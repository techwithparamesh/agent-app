const fs = require('fs');

const appConfigPath = 'client/src/components/workspace/AppConfigurations.ts';
const runnerPath = 'server/integrations/workflowRunner.ts';

const ac = fs.readFileSync(appConfigPath, 'utf8');
const wr = fs.readFileSync(runnerPath, 'utf8');

const appIds = [...ac.matchAll(/: AppConfig\s*=\s*\{[^\S\r\n]*\r?\n\s*id\s*:\s*'([^']+)'/g)].map((m) => m[1]);
const uniqApps = [...new Set(appIds)];

const supported = [...wr.matchAll(/appId\s*===\s*['\"]([^'\"]+)['\"]/g)].map((m) => m[1]);
const supportedSet = new Set(supported);

const missing = uniqApps.filter((id) => !supportedSet.has(id));

console.log(JSON.stringify({
  totalApps: uniqApps.length,
  supportedApps: supportedSet.size,
  missingApps: missing.length,
  missing,
}, null, 2));
