import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { APP_CONFIGS, type AppConfig } from '../client/src/components/workspace/AppConfigurations';

function repoRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '..');
}

function readText(p: string) {
  return fs.readFileSync(p, 'utf8');
}

function uniqueSorted(list: Iterable<string>) {
  return [...new Set([...list].filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

type RunnerMapping = {
  byAppId: Record<string, { functionName: string; executorImportPath?: string; executorFilePath?: string }>;
};

function loadRunnerMapping(): RunnerMapping {
  const runnerPath = path.join(repoRoot(), 'server/integrations/workflowRunner.ts');
  const runner = readText(runnerPath);

  const importRe = /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+['\"](\.\/executors\/[A-Za-z0-9_\-]+)['\"];?/g;
  const importPathByFn = new Map<string, string>();
  for (const m of runner.matchAll(importRe)) {
    importPathByFn.set(m[1], m[2]);
  }

  const mapping: RunnerMapping = { byAppId: {} };
  const ifRe = /if\s*\(([^)]*\bappId\b[^)]*)\)\s*\{[\s\S]*?return\s+([A-Za-z0-9_]+)\s*\(/g;
  for (const m of runner.matchAll(ifRe)) {
    const condition = m[1];
    const fnName = m[2];
    const appIds = [...condition.matchAll(/appId\s*===\s*['\"]([^'\"]+)['\"]/g)].map((x) => x[1]);
    if (!appIds.length) continue;

    const relImportPath = importPathByFn.get(fnName);
    const executorTs = relImportPath ? path.join(repoRoot(), 'server/integrations', `${relImportPath}.ts`) : undefined;

    for (const appId of appIds) {
      mapping.byAppId[appId] = {
        functionName: fnName,
        executorImportPath: relImportPath,
        executorFilePath: executorTs,
      };
    }
  }

  return mapping;
}

function extractActionIds(code: string): string[] {
  const ids = new Set<string>();

  // Detect any direct comparisons against actionId:
  //   actionId === 'x'
  //   actionId !== 'x'
  //   actionId == 'x'
  //   actionId != 'x'
  for (const m of code.matchAll(/\bactionId\s*(?:===|!==|==|!=)\s*['\"]([^'\"]+)['\"]/g)) {
    ids.add(m[1]);
  }

  for (const m of code.matchAll(/\bcase\s+['\"]([^'\"]+)['\"]\s*:/g)) {
    ids.add(m[1]);
  }

  return uniqueSorted(ids);
}

type CoverageRow = {
  appId: string;
  appName: string;
  executorFile?: string;
  uiActionIds: string[];
  executorActionIds: string[];
  missingInExecutor: string[];
  extraInExecutor: string[];
};

function auditApp(appId: string, app: AppConfig, mapping: RunnerMapping): CoverageRow {
  const uiActionIds = uniqueSorted(app.actions.map((a) => a.id));

  const executorFilePath = mapping.byAppId[appId]?.executorFilePath;
  if (!executorFilePath || !fs.existsSync(executorFilePath)) {
    return {
      appId,
      appName: app.name,
      executorFile: executorFilePath ? path.relative(repoRoot(), executorFilePath).replace(/\\/g, '/') : undefined,
      uiActionIds,
      executorActionIds: [],
      missingInExecutor: uiActionIds,
      extraInExecutor: [],
    };
  }

  const code = readText(executorFilePath);
  const executorActionIds = extractActionIds(code);

  const missingInExecutor = uiActionIds.filter((id) => !executorActionIds.includes(id));
  const extraInExecutor = executorActionIds.filter((id) => !uiActionIds.includes(id));

  return {
    appId,
    appName: app.name,
    executorFile: path.relative(repoRoot(), executorFilePath).replace(/\\/g, '/'),
    uiActionIds,
    executorActionIds,
    missingInExecutor,
    extraInExecutor,
  };
}

async function main() {
  const mapping = loadRunnerMapping();

  const rows: CoverageRow[] = [];
  for (const [appId, app] of Object.entries(APP_CONFIGS)) {
    rows.push(auditApp(appId, app, mapping));
  }

  const total = rows.length;
  const wired = rows.filter((r) => r.executorFile && r.executorActionIds.length > 0);
  const hasExecutorFile = rows.filter((r) => r.executorFile);
  const missingExecutorFile = rows.filter((r) => !r.executorFile);

  const fullyImplemented = rows.filter((r) => r.executorFile && r.uiActionIds.length > 0 && r.missingInExecutor.length === 0);
  const partiallyImplemented = rows.filter((r) => r.executorFile && r.uiActionIds.length > 0 && r.missingInExecutor.length > 0);
  const noActions = rows.filter((r) => r.uiActionIds.length === 0);

  const outDir = path.join(repoRoot(), 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'app_coverage_audit.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary: {
          apps: total,
          appsWithExecutorFile: hasExecutorFile.length,
          appsMissingExecutorFile: missingExecutorFile.length,
          appsWithAnyExecutorActionsDetected: wired.length,
          appsFullyImplementedActions: fullyImplemented.length,
          appsPartiallyImplementedActions: partiallyImplemented.length,
          appsWithNoUiActions: noActions.length,
        },
        rows,
      },
      null,
      2,
    ),
  );

  const topMissing = [...partiallyImplemented]
    .sort((a, b) => b.missingInExecutor.length - a.missingInExecutor.length)
    .slice(0, 25)
    .map((r) => ({ appId: r.appId, missingActions: r.missingInExecutor }));

  console.log(
    JSON.stringify(
      {
        apps: total,
        appsWithExecutorFile: hasExecutorFile.length,
        appsMissingExecutorFile: missingExecutorFile.length,
        appsWithAnyExecutorActionsDetected: wired.length,
        appsFullyImplementedActions: fullyImplemented.length,
        appsPartiallyImplementedActions: partiallyImplemented.length,
        appsWithNoUiActions: noActions.length,
        missingExecutorFileFirst30: missingExecutorFile.slice(0, 30).map((r) => r.appId),
        topMissing,
        output: 'docs/app_coverage_audit.json',
      },
      null,
      2,
    ),
  );
}

void main();
