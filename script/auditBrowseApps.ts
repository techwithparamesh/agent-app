import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { APP_CONFIGS } from '../client/src/components/workspace/AppConfigurations';

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

function extractCatalogAppIds(): string[] {
  const p = path.join(repoRoot(), 'client/src/pages/dashboard/integrations.tsx');
  const code = readText(p);

  const start = code.indexOf('const integrationCatalog');
  const end = code.indexOf('// Flatten all integrations');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not locate integrationCatalog block in integrations.tsx');
  }

  const block = code.slice(start, end);
  const ids = [...block.matchAll(/\bid\s*:\s*['\"]([^'\"]+)['\"]/g)].map((m) => m[1]);
  return uniqueSorted(ids);
}

async function main() {
  const runner = loadRunnerMapping();
  const catalogAppIds = extractCatalogAppIds();

  const appConfigIdList = Object.keys(APP_CONFIGS);
  const appConfigIds = new Set(appConfigIdList);

  const missingInAppConfigs = catalogAppIds.filter((id) => !appConfigIds.has(id));
  const missingInRunner = catalogAppIds.filter((id) => !runner.byAppId[id]?.executorFilePath);

  const appsInAppConfigurationsNotInCatalog = uniqueSorted(
    appConfigIdList.filter((id) => !catalogAppIds.includes(id)),
  );

  // Note: this is a coarse check: it ensures the app exists in both registries.
  // Deeper action-id coverage is handled by `npm run audit:coverage`.

  console.log(
    JSON.stringify(
      {
        catalogApps: catalogAppIds.length,
        appConfigurationsApps: appConfigIdList.length,
        missingInAppConfigurationsCount: missingInAppConfigs.length,
        missingInWorkflowRunnerCount: missingInRunner.length,
        missingInAppConfigurations: missingInAppConfigs,
        missingInWorkflowRunner: missingInRunner,
        appConfigurationsNotInCatalogCount: appsInAppConfigurationsNotInCatalog.length,
        appConfigurationsNotInCatalog: appsInAppConfigurationsNotInCatalog,
        hint: 'For action-level coverage run: npm run audit:coverage',
      },
      null,
      2,
    ),
  );
}

void main();
