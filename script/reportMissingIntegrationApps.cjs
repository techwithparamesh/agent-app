const fs = require('fs');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function parseAppConfigIds(appConfigsTs) {
  const ids = new Set();
  const re = /export const \w+Config: AppConfig\s*=\s*\{\s*id:\s*'([^']+)'/g;
  for (const m of appConfigsTs.matchAll(re)) ids.add(m[1]);
  return ids;
}

function parseAppsPanelIds(appsPanelTsx) {
  const ids = new Set();
  const re = /\{\s*id:\s*'([^']+)'\s*,\s*name:/g;
  for (const m of appsPanelTsx.matchAll(re)) ids.add(m[1]);
  return ids;
}

function parseIntegrationCatalogIds(integrationsPageTsx) {
  const { ids } = JSON.parse(
    require('child_process').execFileSync('node', ['.\\script\\extractIntegrationCatalogIds.cjs'], { encoding: 'utf8' })
  );
  return new Set(ids);
}

const appConfigs = read('client/src/components/workspace/AppConfigurations.ts');
const appsPanel = read('client/src/components/workspace/AppsPanel.tsx');
const integrationsPage = read('client/src/pages/dashboard/integrations.tsx');

const configIds = parseAppConfigIds(appConfigs);
const panelIds = parseAppsPanelIds(appsPanel);
const catalogIds = parseIntegrationCatalogIds(integrationsPage);

const missingConfig = [...catalogIds].filter((id) => !configIds.has(id)).sort();
const missingPanel = [...catalogIds].filter((id) => !panelIds.has(id)).sort();

console.log(
  JSON.stringify(
    {
      catalogCount: catalogIds.size,
      configCount: configIds.size,
      panelCount: panelIds.size,
      missingConfig,
      missingPanel,
    },
    null,
    2
  )
);
