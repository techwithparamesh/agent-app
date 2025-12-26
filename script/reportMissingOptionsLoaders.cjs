#!/usr/bin/env node
/*
  Reports which /api/integrations/options/<app>/<path> endpoints are referenced by
  frontend schemas (AppConfigurations loadOptions) but do not have an explicit
  server router mounted in server/integrations/routes.ts.

  This is intentionally heuristic: it helps us batch provider implementations.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function extractClientLoadOptions(text) {
  // Extract occurrences like:
  // - loadOptions: { path: 'channels', ... }   (relative path, attributed to the current AppConfig)
  // - loadOptions: { path: '/api/integrations/options/trello/boards' } (absolute path, app inferred from URL)
  //
  // IMPORTANT: AppConfigurations.ts also contains many nested objects with `id:` (triggers/actions).
  // We intentionally parse only top-level AppConfig blocks:
  //   export const slackConfig: AppConfig = { id: 'slack', ... }

  const out = [];

  function findMatchingBrace(source, openIdx) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    let inLineComment = false;
    let inBlockComment = false;
    let escaped = false;

    for (let i = openIdx; i < source.length; i++) {
      const ch = source[i];
      const next = source[i + 1];

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

      if (inSingle) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === "'") inSingle = false;
        continue;
      }
      if (inDouble) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === '"') inDouble = false;
        continue;
      }
      if (inTemplate) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === '`') inTemplate = false;
        continue;
      }

      if (ch === "'") {
        inSingle = true;
        continue;
      }
      if (ch === '"') {
        inDouble = true;
        continue;
      }
      if (ch === '`') {
        inTemplate = true;
        continue;
      }

      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  const appBlockRe = /export\s+const\s+\w+Config\s*:\s*AppConfig\s*=\s*\{/g;
  let m;
  while ((m = appBlockRe.exec(text))) {
    const openIdx = text.indexOf('{', m.index);
    const closeIdx = findMatchingBrace(text, openIdx);
    if (openIdx === -1 || closeIdx === -1) continue;

    const block = text.slice(openIdx, closeIdx + 1);
    const headerEnd = block.indexOf('auth:') !== -1 ? block.indexOf('auth:') : Math.min(block.length, 1200);
    const header = block.slice(0, headerEnd);
    const idMatch = /\bid\s*:\s*['"]([a-z0-9_]+)['"]/i.exec(header);
    const appId = idMatch ? idMatch[1] : null;
    if (!appId) continue;

    const loadPathRe = /\bloadOptions\s*:\s*\{[\s\S]*?\bpath\s*:\s*['"]([^'"]+)['"]/gi;
    let lm;
    while ((lm = loadPathRe.exec(block))) {
      let p = lm[1].trim();
      // normalize leading slash
      p = p.replace(/^\//, '');

      // If schema uses absolute API path, infer appId from it.
      const absRe = /^api\/integrations\/options\/([a-z0-9_]+)\/(.+)$/i;
      const absMatch = absRe.exec(p);
      if (absMatch) {
        out.push({ appId: absMatch[1], path: absMatch[2] });
      } else {
        out.push({ appId, path: p });
      }
    }

    // Move regex cursor forward so we don't re-process nested "export const" occurrences.
    appBlockRe.lastIndex = closeIdx + 1;
  }

  return out;
}

function extractServerMountedOptionRouters(text) {
  // Finds: integrationRoutes.use('/options/<app>', ...)
  const re = /integrationRoutes\.use\(\s*['"]\/options\/([a-z0-9_]+)['"]/gi;
  const apps = [];
  let m;
  while ((m = re.exec(text))) apps.push(m[1]);
  return uniq(apps).sort();
}

function main() {
  const clientFile = path.join(ROOT, 'client', 'src', 'components', 'workspace', 'AppConfigurations.ts');
  const serverRoutesFile = path.join(ROOT, 'server', 'integrations', 'routes.ts');

  const clientText = read(clientFile);
  const serverText = read(serverRoutesFile);

  const refs = extractClientLoadOptions(clientText);
  const mountedApps = new Set(extractServerMountedOptionRouters(serverText));

  const byApp = new Map();
  for (const r of refs) {
    if (!r.appId) continue;
    if (!byApp.has(r.appId)) byApp.set(r.appId, new Set());
    byApp.get(r.appId).add(r.path);
  }

  const appsWithOptions = Array.from(byApp.keys()).sort();
  const missingRouters = appsWithOptions.filter((a) => !mountedApps.has(a));

  const report = {
    appsWithLoadOptionsCount: appsWithOptions.length,
    mountedOptionRoutersCount: mountedApps.size,
    missingOptionRoutersCount: missingRouters.length,
    note: 'This reports missing *mounted* option routers. It does not validate that each individual path is implemented within an existing router.',
    missingOptionRouters: missingRouters.map((appId) => ({
      appId,
      paths: Array.from(byApp.get(appId)).sort(),
    })),
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
