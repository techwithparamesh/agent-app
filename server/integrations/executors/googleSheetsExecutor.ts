import { z } from 'zod';

const googleSheetsAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GoogleSheetsExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseJsonMaybe(value: any) {
  if (value == null) return undefined;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function gsRequestJson(accessToken: string, url: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Google Sheets API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function getSheetId(accessToken: string, spreadsheetId: string, sheetName: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets(properties(sheetId,title))`;
  const data = await gsRequestJson(accessToken, url, 'GET');
  const sheets: any[] = Array.isArray(data?.sheets) ? data.sheets : [];
  const found = sheets.find((s) => s?.properties?.title === sheetName);
  const id = found?.properties?.sheetId;
  if (typeof id !== 'number') throw new Error(`Sheet not found: ${sheetName}`);
  return id;
}

export async function executeGoogleSheetsAction(input: GoogleSheetsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = googleSheetsAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'append_row') {
    const spreadsheetId = String(config.spreadsheetId || '').trim();
    const sheetName = String(config.sheetName || '').trim();
    if (!spreadsheetId) throw new Error('Google Sheets append_row requires spreadsheetId');
    if (!sheetName) throw new Error('Google Sheets append_row requires sheetName');

    const valuesRaw = parseJsonMaybe(config.values);
    if (!Array.isArray(valuesRaw)) throw new Error('Google Sheets append_row requires values (json array)');

    const insertDataOption = String(config.insertDataOption || 'INSERT_ROWS');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=${encodeURIComponent(insertDataOption)}`;
    const data = await gsRequestJson(accessToken, url, 'POST', { values: [valuesRaw] });
    return { ok: true, update: data, raw: data };
  }

  if (actionId === 'update_row') {
    const spreadsheetId = String(config.spreadsheetId || '').trim();
    const sheetName = String(config.sheetName || '').trim();
    const range = String(config.range || '').trim();
    if (!spreadsheetId) throw new Error('Google Sheets update_row requires spreadsheetId');
    if (!sheetName) throw new Error('Google Sheets update_row requires sheetName');
    if (!range) throw new Error('Google Sheets update_row requires range');

    const valuesRaw = parseJsonMaybe(config.values);
    if (!Array.isArray(valuesRaw)) throw new Error('Google Sheets update_row requires values (json array)');

    const a1 = `${sheetName}!${range}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(a1)}?valueInputOption=USER_ENTERED`;
    const data = await gsRequestJson(accessToken, url, 'PUT', { values: valuesRaw });
    return { ok: true, update: data, raw: data };
  }

  if (actionId === 'get_rows') {
    const spreadsheetId = String(config.spreadsheetId || '').trim();
    const sheetName = String(config.sheetName || '').trim();
    const range = String(config.range || '').trim();
    if (!spreadsheetId) throw new Error('Google Sheets get_rows requires spreadsheetId');
    if (!sheetName) throw new Error('Google Sheets get_rows requires sheetName');

    const a1 = range ? `${sheetName}!${range}` : sheetName;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(a1)}`;
    const data = await gsRequestJson(accessToken, url, 'GET');
    return { ok: true, values: data?.values, range: data?.range, raw: data };
  }

  if (actionId === 'find_row') {
    const spreadsheetId = String(config.spreadsheetId || '').trim();
    const sheetName = String(config.sheetName || '').trim();
    const lookupColumn = String(config.lookupColumn || '').trim();
    const lookupValue = String(config.lookupValue || '').trim();
    if (!spreadsheetId) throw new Error('Google Sheets find_row requires spreadsheetId');
    if (!sheetName) throw new Error('Google Sheets find_row requires sheetName');
    if (!lookupColumn) throw new Error('Google Sheets find_row requires lookupColumn');
    if (!lookupValue) throw new Error('Google Sheets find_row requires lookupValue');

    const colRange = `${sheetName}!${lookupColumn}:${lookupColumn}`;
    const colUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(colRange)}`;
    const colData = await gsRequestJson(accessToken, colUrl, 'GET');

    const colValues: any[] = Array.isArray(colData?.values) ? colData.values.flat() : [];
    const idx = colValues.findIndex((v) => String(v) === lookupValue);
    if (idx < 0) return { ok: true, found: false };

    const rowNumber = idx + 1; // 1-indexed
    const rowA1 = `${sheetName}!A${rowNumber}:Z${rowNumber}`;
    const rowUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(rowA1)}`;
    const rowData = await gsRequestJson(accessToken, rowUrl, 'GET');

    return { ok: true, found: true, rowNumber, values: rowData?.values?.[0], raw: { colData, rowData } };
  }

  if (actionId === 'delete_row') {
    const spreadsheetId = String(config.spreadsheetId || '').trim();
    const sheetName = String(config.sheetName || '').trim();
    const rowIndex = Number(config.rowIndex);
    if (!spreadsheetId) throw new Error('Google Sheets delete_row requires spreadsheetId');
    if (!sheetName) throw new Error('Google Sheets delete_row requires sheetName');
    if (!Number.isFinite(rowIndex) || rowIndex <= 0) throw new Error('Google Sheets delete_row requires rowIndex (1-indexed)');

    const sheetId = await getSheetId(accessToken, spreadsheetId, sheetName);

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`;
    const data = await gsRequestJson(accessToken, url, 'POST', {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: Math.trunc(rowIndex) - 1,
              endIndex: Math.trunc(rowIndex),
            },
          },
        },
      ],
    });

    return { ok: true, update: data, raw: data };
  }

  if (actionId === 'clear_range') {
    const spreadsheetId = String(config.spreadsheetId || '').trim();
    const range = String(config.range || '').trim();
    if (!spreadsheetId) throw new Error('Google Sheets clear_range requires spreadsheetId');
    if (!range) throw new Error('Google Sheets clear_range requires range');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:clear`;
    const data = await gsRequestJson(accessToken, url, 'POST', {});
    return { ok: true, result: data, raw: data };
  }

  return { status: 'skipped', reason: `Google Sheets action not implemented: ${actionId}` };
}
