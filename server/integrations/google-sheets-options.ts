import { Router } from 'express';
import { z } from 'zod';

const googleSheetsOptionsRouter = Router();

const baseSchema = z.object({
  accessToken: z.string().min(1),
});

const sheetsSchema = baseSchema.extend({
  spreadsheetId: z.string().min(1),
});

async function gGetJson(accessToken: string, url: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

// POST /api/integrations/options/google_sheets/spreadsheets
// Body: { accessToken }
googleSheetsOptionsRouter.post('/spreadsheets', async (req, res) => {
  try {
    const { accessToken } = baseSchema.parse(req.body);

    const data = await gGetJson(
      accessToken,
      "https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27&fields=files(id%2Cname)&pageSize=1000"
    );

    const files = Array.isArray(data?.files) ? data.files : [];
    const options = files
      .filter((f: any) => f && f.id && f.name)
      .map((f: any) => ({ value: String(f.id), label: String(f.name) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[Google Sheets Options] spreadsheets error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load spreadsheets' });
  }
});

// POST /api/integrations/options/google_sheets/sheets
// Body: { accessToken, spreadsheetId }
googleSheetsOptionsRouter.post('/sheets', async (req, res) => {
  try {
    const { accessToken, spreadsheetId } = sheetsSchema.parse(req.body);

    const data = await gGetJson(
      accessToken,
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties(title)`
    );

    const sheets = Array.isArray(data?.sheets) ? data.sheets : [];
    const options = sheets
      .map((s: any) => s?.properties?.title)
      .filter((t: any) => typeof t === 'string' && t.length)
      .map((title: string) => ({ value: title, label: title }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[Google Sheets Options] sheets error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load sheets' });
  }
});

export default googleSheetsOptionsRouter;
