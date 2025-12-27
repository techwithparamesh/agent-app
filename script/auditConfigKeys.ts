import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the frontend source of truth for field definitions.
import { APP_CONFIGS, type AppConfig } from '../client/src/components/workspace/AppConfigurations';

type AuditFinding = {
  appId: string;
  appName: string;
  executorFile?: string;
  actionId: string;
  actionName: string;
  missingInUi: string[];
  unusedInBackend: string[];
  backendKeys: string[];
  uiKeys: string[];
};

type RunnerMapping = {
  byAppId: Record<string, { functionName: string; executorImportPath?: string; executorFilePath?: string }>;
};

function repoRoot() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // script/ is at repo root
  return path.resolve(here, '..');
}

function readText(p: string) {
  return fs.readFileSync(p, 'utf8');
}

function normalizeSlashes(p: string) {
  return p.replace(/\\/g, '/');
}

function uniqueSorted(list: Iterable<string>) {
  return [...new Set([...list].filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function extractConfigKeys(code: string): string[] {
  const keys = new Set<string>();

  // config.foo
  for (const m of code.matchAll(/\bconfig\.([A-Za-z_][A-Za-z0-9_]*)\b/g)) {
    keys.add(m[1]);
  }

  // config['foo'] / config["foo"]
  for (const m of code.matchAll(/\bconfig\s*\[\s*['"]([^'"]+)['"]\s*\]/g)) {
    keys.add(m[1]);
  }

  // const { a, b: alias, c = 'x' } = config
  for (const m of code.matchAll(/\bconst\s*\{([^}]+)\}\s*=\s*config\b/g)) {
    const inside = m[1];
    for (const part of inside.split(',')) {
      const raw = part.trim();
      if (!raw) continue;
      // remove default values
      const noDefault = raw.split('=')[0].trim();
      // handle aliasing: a: alias
      const name = noDefault.split(':')[0].trim();
      if (name) keys.add(name);
    }
  }

  return uniqueSorted(keys);
}

function findIfActionIdBlocks(code: string): Array<{ actionId: string; block: string }> {
  const blocks: Array<{ actionId: string; block: string }> = [];

  // We look for patterns like: if (actionId === 'x') { ... }
  const re = /if\s*\(\s*actionId\s*===\s*['"]([^'"]+)['"]\s*\)\s*\{/g;
  for (const m of code.matchAll(re)) {
    const actionId = m[1];
    const openBraceIndex = (m.index ?? 0) + m[0].length - 1; // points at '{'
    const closeBraceIndex = findMatchingBrace(code, openBraceIndex);
    if (closeBraceIndex === -1) continue;
    const block = code.slice(openBraceIndex + 1, closeBraceIndex);
    blocks.push({ actionId, block });
  }

  // Also handle else if (actionId === 'x') { ... }
  // (covered by the same regex)

  return blocks;
}

function findMatchingBrace(code: string, openIndex: number): number {
  if (code[openIndex] !== '{') return -1;
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openIndex; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === '/' && next === '/') {
        inLineComment = true;
        i++;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i++;
        continue;
      }
    }

    if (!inDouble && !inTemplate && ch === '\'' && code[i - 1] !== '\\') {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && !inTemplate && ch === '"' && code[i - 1] !== '\\') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && ch === '`' && code[i - 1] !== '\\') {
      inTemplate = !inTemplate;
      continue;
    }

    if (inSingle || inDouble || inTemplate) continue;

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function loadRunnerMapping(): RunnerMapping {
  const runnerPath = path.join(repoRoot(), 'server/integrations/workflowRunner.ts');
  const runner = readText(runnerPath);

  // imports: executeXAction -> ./executors/fooExecutor
  const importRe = /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+['"](\.\/executors\/[A-Za-z0-9_\-]+)['"];?/g;
  const importPathByFn = new Map<string, string>();
  for (const m of runner.matchAll(importRe)) {
    importPathByFn.set(m[1], m[2]);
  }

  // mapping by appId in executeNode: if (appId === 'x' || appId === 'y') { ... return executeFn( ... ) }
  const mapping: RunnerMapping = { byAppId: {} };
  const ifRe = /if\s*\(([^)]*\bappId\b[^)]*)\)\s*\{[\s\S]*?return\s+([A-Za-z0-9_]+)\s*\(/g;
  for (const m of runner.matchAll(ifRe)) {
    const condition = m[1];
    const fnName = m[2];
    const appIds = [...condition.matchAll(/appId\s*===\s*['"]([^'"]+)['"]/g)].map((x) => x[1]);
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

const ALWAYS_ALLOWED_NON_FIELD_KEYS = new Set([
  'appId',
  'actionId',
  'selectedActionId',
  'name',
  'id',
  'credentialId',
  'triggerType',
  'triggerId',
  'selectedTriggerId',
  'pollInterval',
  'cronExpression',
  'timezone',
]);

function auditApp(appId: string, app: AppConfig, runnerMapping: RunnerMapping): AuditFinding[] {
  const mapping = runnerMapping.byAppId[appId];
  const executorFilePath = mapping?.executorFilePath;

  if (!executorFilePath || !fs.existsSync(executorFilePath)) {
    // No executor file found (should not happen in your project), but keep as finding placeholder.
    return app.actions.map((a) => ({
      appId,
      appName: app.name,
      executorFile: executorFilePath ? normalizeSlashes(path.relative(repoRoot(), executorFilePath)) : undefined,
      actionId: a.id,
      actionName: a.name,
      missingInUi: [],
      unusedInBackend: uniqueSorted(a.fields.map((f) => f.key)),
      backendKeys: [],
      uiKeys: uniqueSorted(a.fields.map((f) => f.key)),
    }));
  }

  const executorCode = readText(executorFilePath);

  // Build per-action backend key sets from if(actionId===...) blocks when possible.
  const actionBlocks = findIfActionIdBlocks(executorCode);
  const keysByActionId = new Map<string, string[]>();
  for (const b of actionBlocks) {
    keysByActionId.set(b.actionId, extractConfigKeys(b.block));
  }

  // Fallback: file-wide keys
  const fileWideKeys = extractConfigKeys(executorCode);

  const findings: AuditFinding[] = [];

  for (const action of app.actions) {
    const uiKeys = uniqueSorted(action.fields.map((f) => f.key));
    const backendKeys = keysByActionId.get(action.id) || fileWideKeys;

    const missingInUi = backendKeys
      .filter((k) => !ALWAYS_ALLOWED_NON_FIELD_KEYS.has(k))
      .filter((k) => !uiKeys.includes(k));

    const unusedInBackend = uiKeys.filter((k) => !backendKeys.includes(k));

    // Only record actionable mismatches.
    if (missingInUi.length || unusedInBackend.length) {
      findings.push({
        appId,
        appName: app.name,
        executorFile: normalizeSlashes(path.relative(repoRoot(), executorFilePath)),
        actionId: action.id,
        actionName: action.name,
        missingInUi,
        unusedInBackend,
        backendKeys,
        uiKeys,
      });
    }
  }

  return findings;
}

function toMarkdown(findings: AuditFinding[]) {
  const lines: string[] = [];
  lines.push('# Integration Config Keys Audit');
  lines.push('');
  lines.push('Compares frontend action field keys (AppConfigurations) vs backend executor config usage.');
  lines.push('');
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push('');

  const byApp = new Map<string, AuditFinding[]>();
  for (const f of findings) {
    const key = `${f.appId}::${f.appName}`;
    if (!byApp.has(key)) byApp.set(key, []);
    byApp.get(key)!.push(f);
  }

  // Summary table (top 50 by missingInUi)
  const ranked = [...findings].sort((a, b) => b.missingInUi.length - a.missingInUi.length);
  lines.push('## Summary (most missing UI keys)');
  lines.push('');
  lines.push('| App | Action | Missing in UI | Executor |');
  lines.push('|---|---|---:|---|');
  for (const f of ranked.slice(0, 50)) {
    lines.push(
      `| ${f.appId} | ${f.actionId} | ${f.missingInUi.length} | ${f.executorFile ?? ''} |`,
    );
  }
  lines.push('');

  for (const [appKey, list] of [...byApp.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const [appId, appName] = appKey.split('::');
    lines.push(`## ${appName} (${appId})`);
    lines.push('');

    const executorFile = list[0]?.executorFile;
    if (executorFile) lines.push(`Executor: ${executorFile}`);
    lines.push('');

    for (const f of list.sort((a, b) => a.actionId.localeCompare(b.actionId))) {
      lines.push(`### ${f.actionName} (${f.actionId})`);
      lines.push('');
      if (f.missingInUi.length) {
        lines.push(`- Missing in UI fields: ${f.missingInUi.join(', ')}`);
      }
      if (f.unusedInBackend.length) {
        lines.push(`- Present in UI but not referenced in executor: ${f.unusedInBackend.join(', ')}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main() {
  const mapping = loadRunnerMapping();

  const findings: AuditFinding[] = [];
  for (const [appId, app] of Object.entries(APP_CONFIGS)) {
    findings.push(...auditApp(appId, app, mapping));
  }

  const outDir = path.join(repoRoot(), 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, 'integration_config_audit.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2));

  const mdPath = path.join(outDir, 'INTEGRATION_CONFIG_AUDIT.md');
  fs.writeFileSync(mdPath, toMarkdown(findings));

  const actionable = findings.filter((f) => f.missingInUi.length > 0);
  console.log(
    JSON.stringify(
      {
        apps: Object.keys(APP_CONFIGS).length,
        findings: findings.length,
        actionable: actionable.length,
        topMissing: actionable
          .sort((a, b) => b.missingInUi.length - a.missingInUi.length)
          .slice(0, 15)
          .map((x) => ({ appId: x.appId, actionId: x.actionId, missingInUi: x.missingInUi })),
        output: {
          markdown: normalizeSlashes(path.relative(repoRoot(), mdPath)),
          json: normalizeSlashes(path.relative(repoRoot(), jsonPath)),
        },
      },
      null,
      2,
    ),
  );
}

void main();
