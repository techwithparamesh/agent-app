const fs = require('fs');

function uniq(arr) {
  return Array.from(new Set(arr));
}

const appConfigPath = 'client/src/components/workspace/AppConfigurations.ts';
const workflowRunnerPath = 'server/integrations/workflowRunner.ts';

const ac = fs.readFileSync(appConfigPath, 'utf8');
const wr = fs.readFileSync(workflowRunnerPath, 'utf8');

// Extract AppConfig ids in the order they appear.
const appIds = [...ac.matchAll(/: AppConfig\s*=\s*\{[^\S\r\n]*\r?\n\s*id\s*:\s*'([^']+)'/g)].map((m) => m[1]);
const uniqAppIds = uniq(appIds);

// Extract appIds supported by runner.
const supported = [...wr.matchAll(/appId\s*===\s*['\"]([^'\"]+)['\"]/g)].map((m) => m[1]);
const supportedSet = new Set(uniq(supported));

const missing = uniqAppIds.filter((id) => !supportedSet.has(id));

console.log(JSON.stringify({
  apps: uniqAppIds.length,
  supported: supportedSet.size,
  missing: missing.length,
  missing_first_60: missing.slice(0, 60),
}, null, 2));
