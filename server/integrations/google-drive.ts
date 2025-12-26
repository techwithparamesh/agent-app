import { Router } from 'express';
import { z } from 'zod';

const googleDriveOptionsRouter = Router();

const baseSchema = z.object({
  accessToken: z.string().min(1),
});

const listFoldersSchema = baseSchema.extend({
  parentId: z.string().min(1).optional(),
  search: z.string().optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
});

const listFilesSchema = baseSchema.extend({
  folderId: z.string().min(1).optional(),
  mimeType: z.string().optional(),
  search: z.string().optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
});

async function gdList(accessToken: string, query: string, pageSize: number) {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', query);
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('fields', 'files(id,name,mimeType,parents,trashed),nextPageToken');
  url.searchParams.set('supportsAllDrives', 'true');
  url.searchParams.set('includeItemsFromAllDrives', 'true');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Drive API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

// POST /api/integrations/options/google_drive/folders
// Body: { accessToken, parentId?, search?, pageSize? }
googleDriveOptionsRouter.post('/folders', async (req, res) => {
  try {
    const { accessToken, parentId, search, pageSize } = listFoldersSchema.parse(req.body);

    const qParts: string[] = [
      "mimeType = 'application/vnd.google-apps.folder'",
      'trashed = false',
    ];

    const parent = parentId ? String(parentId) : 'root';
    qParts.push(`'${parent.replace(/'/g, "\\'")}' in parents`);

    if (search && search.trim()) {
      const s = search.trim().replace(/'/g, "\\'");
      qParts.push(`name contains '${s}'`);
    }

    const data = await gdList(accessToken, qParts.join(' and '), pageSize ?? 100);
    const files = Array.isArray(data?.files) ? data.files : [];

    const options = files
      .filter((f: any) => f && f.id)
      .map((f: any) => ({ value: String(f.id), label: String(f.name || f.id) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[Google Drive Options] folders error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Google Drive folders' });
  }
});

// POST /api/integrations/options/google_drive/files
// Body: { accessToken, folderId?, mimeType?, search?, pageSize? }
googleDriveOptionsRouter.post('/files', async (req, res) => {
  try {
    const { accessToken, folderId, mimeType, search, pageSize } = listFilesSchema.parse(req.body);

    const qParts: string[] = ['trashed = false'];

    if (folderId && folderId.trim()) {
      qParts.push(`'${folderId.trim().replace(/'/g, "\\'")}' in parents`);
    }

    if (mimeType && mimeType.trim()) {
      const mt = mimeType.trim();
      if (mt.endsWith('/*')) {
        const prefix = mt.slice(0, -1).replace(/'/g, "\\'");
        qParts.push(`mimeType contains '${prefix}'`);
      } else {
        qParts.push(`mimeType = '${mt.replace(/'/g, "\\'")}'`);
      }
    }

    if (search && search.trim()) {
      const s = search.trim().replace(/'/g, "\\'");
      qParts.push(`name contains '${s}'`);
    }

    const data = await gdList(accessToken, qParts.join(' and '), pageSize ?? 100);
    const files = Array.isArray(data?.files) ? data.files : [];

    const options = files
      .filter((f: any) => f && f.id)
      .map((f: any) => ({ value: String(f.id), label: String(f.name || f.id) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[Google Drive Options] files error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Google Drive files' });
  }
});

export default googleDriveOptionsRouter;
