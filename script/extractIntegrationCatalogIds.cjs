const fs = require('fs');

const text = fs.readFileSync('client/src/pages/dashboard/integrations.tsx', 'utf8');

function findIntegrationCatalogRange(src) {
  const start = src.indexOf('const integrationCatalog');
  if (start === -1) throw new Error('integrationCatalog not found');
  const braceStart = src.indexOf('{', start);
  if (braceStart === -1) throw new Error('opening { not found');

  let depth = 0;
  let inStr = null;
  let inTplExprDepth = 0;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = braceStart; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];

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

    if (!inStr) {
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

    if (inStr) {
      if (ch === '\\') {
        i++;
        continue;
      }

      if (inStr === '`') {
        if (ch === '$' && next === '{') {
          inTplExprDepth++;
          i++;
          continue;
        }
        if (ch === '}' && inTplExprDepth > 0) {
          inTplExprDepth--;
          continue;
        }
      }

      if (inTplExprDepth === 0 && ch === inStr) {
        inStr = null;
      }

      continue;
    }

    if (ch === '\'' || ch === '"' || ch === '`') {
      inStr = ch;
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return { start: braceStart, end: i + 1 };
      }
    }
  }

  throw new Error('matching } not found');
}

function extractIntegrationsArrays(src) {
  const arrays = [];
  let idx = 0;
  while (true) {
    const pos = src.indexOf('integrations:', idx);
    if (pos === -1) break;

    const bracketStart = src.indexOf('[', pos);
    if (bracketStart === -1) break;

    let depth = 0;
    let inStr = null;
    let inTplExprDepth = 0;
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = bracketStart; i < src.length; i++) {
      const ch = src[i];
      const next = src[i + 1];

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

      if (!inStr) {
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

      if (inStr) {
        if (ch === '\\') {
          i++;
          continue;
        }

        if (inStr === '`') {
          if (ch === '$' && next === '{') {
            inTplExprDepth++;
            i++;
            continue;
          }
          if (ch === '}' && inTplExprDepth > 0) {
            inTplExprDepth--;
            continue;
          }
        }

        if (inTplExprDepth === 0 && ch === inStr) {
          inStr = null;
        }

        continue;
      }

      if (ch === '\'' || ch === '"' || ch === '`') {
        inStr = ch;
        continue;
      }

      if (ch === '[') depth++;
      if (ch === ']') {
        depth--;
        if (depth === 0) {
          arrays.push(src.slice(bracketStart, i + 1));
          idx = i + 1;
          break;
        }
      }
    }

    if (idx <= pos) break;
  }

  return arrays;
}

const range = findIntegrationCatalogRange(text);
const catalog = text.slice(range.start, range.end);
const arrays = extractIntegrationsArrays(catalog);

const ids = new Set();
for (const arr of arrays) {
  for (const m of arr.matchAll(/\bid:\s*'([^']+)'/g)) {
    ids.add(m[1]);
  }
}

console.log(JSON.stringify({ arrays: arrays.length, ids: [...ids].sort() }, null, 2));
