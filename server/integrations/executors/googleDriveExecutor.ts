import { z } from 'zod';

const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GoogleDriveExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function gJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Google Drive API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function fetchAsBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch fileContent URL (${res.status}): ${text || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || undefined;
  const arrayBuffer = await res.arrayBuffer();
  return { bytes: new Uint8Array(arrayBuffer), contentType };
}

function randomBoundary() {
  return `----agentapp-${Math.random().toString(16).slice(2)}`;
}

export async function executeGoogleDriveAction(input: GoogleDriveExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = googleAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'upload_file') {
    const fileName = String(config.fileName || '').trim();
    const fileContentUrl = String(config.fileContent || '').trim();
    const mimeType = String(config.mimeType || '').trim() || undefined;
    const folderId = String(config.folderId || '').trim() || undefined;

    if (!fileName) throw new Error('Google Drive upload_file requires fileName');
    if (!fileContentUrl) throw new Error('Google Drive upload_file requires fileContent (URL)');

    const { bytes, contentType } = await fetchAsBytes(fileContentUrl);

    const metadata: any = { name: fileName };
    if (folderId) metadata.parents = [folderId];

    const boundary = randomBoundary();
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;

    const metaPart =
      `${delimiter}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n`;

    const filePartHeader =
      `${delimiter}\r\n` +
      `Content-Type: ${mimeType || contentType || 'application/octet-stream'}\r\n\r\n`;

    const closing = `\r\n${closeDelimiter}`;

    const encoder = new TextEncoder();
    const body = new Uint8Array(
      encoder.encode(metaPart).length +
        encoder.encode(filePartHeader).length +
        bytes.length +
        encoder.encode(closing).length
    );

    let offset = 0;
    body.set(encoder.encode(metaPart), offset);
    offset += encoder.encode(metaPart).length;

    body.set(encoder.encode(filePartHeader), offset);
    offset += encoder.encode(filePartHeader).length;

    body.set(bytes, offset);
    offset += bytes.length;

    body.set(encoder.encode(closing), offset);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,mimeType,parents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        Accept: 'application/json',
      },
      body,
    });

    const text = await res.text().catch(() => '');
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      throw new Error(`Google Drive upload error ${res.status}: ${text || res.statusText}`);
    }

    return { ok: true, file: data, raw: data };
  }

  if (actionId === 'create_folder') {
    const folderName = String(config.folderName || '').trim();
    const parentFolderId = String(config.parentFolderId || '').trim() || 'root';
    if (!folderName) throw new Error('Google Drive create_folder requires folderName');

    const data = await gJson(accessToken, 'https://www.googleapis.com/drive/v3/files?fields=id,name,parents', {
      method: 'POST',
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      }),
    });

    return { ok: true, folder: data, raw: data };
  }

  if (actionId === 'copy_file') {
    const fileId = String(config.fileId || '').trim();
    const newName = String(config.newName || '').trim() || undefined;
    const folderId = String(config.folderId || '').trim() || undefined;
    if (!fileId) throw new Error('Google Drive copy_file requires fileId');

    const body: any = {};
    if (newName) body.name = newName;
    if (folderId) body.parents = [folderId];

    const data = await gJson(
      accessToken,
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/copy?fields=id,name,parents,webViewLink`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    return { ok: true, file: data, raw: data };
  }

  if (actionId === 'move_file') {
    const fileId = String(config.fileId || '').trim();
    const newFolderId = String(config.newFolderId || '').trim();
    if (!fileId) throw new Error('Google Drive move_file requires fileId');
    if (!newFolderId) throw new Error('Google Drive move_file requires newFolderId');

    const meta = await gJson(
      accessToken,
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=parents`,
      { method: 'GET' }
    );

    const previousParents = Array.isArray(meta?.parents) ? meta.parents.join(',') : '';

    const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
    url.searchParams.set('addParents', newFolderId);
    if (previousParents) url.searchParams.set('removeParents', previousParents);
    url.searchParams.set('fields', 'id,name,parents,webViewLink');

    const data = await gJson(accessToken, url.toString(), { method: 'PATCH', body: JSON.stringify({}) });
    return { ok: true, file: data, raw: data };
  }

  if (actionId === 'delete_file') {
    const fileId = String(config.fileId || '').trim();
    const permanent = Boolean(config.permanent);
    if (!fileId) throw new Error('Google Drive delete_file requires fileId');

    if (permanent) {
      await gJson(accessToken, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' });
      return { ok: true, deleted: true, permanent: true };
    }

    const data = await gJson(
      accessToken,
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,trashed`,
      {
        method: 'PATCH',
        body: JSON.stringify({ trashed: true }),
      }
    );

    return { ok: true, deleted: true, permanent: false, file: data, raw: data };
  }

  if (actionId === 'share_file') {
    const fileId = String(config.fileId || '').trim();
    const email = String(config.email || '').trim();
    const role = String(config.role || '').trim();
    const sendNotification = config.sendNotification !== undefined ? Boolean(config.sendNotification) : true;

    if (!fileId) throw new Error('Google Drive share_file requires fileId');
    if (!email) throw new Error('Google Drive share_file requires email');
    if (!role) throw new Error('Google Drive share_file requires role');

    const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`);
    url.searchParams.set('sendNotificationEmail', String(sendNotification));

    const data = await gJson(accessToken, url.toString(), {
      method: 'POST',
      body: JSON.stringify({ type: 'user', role, emailAddress: email }),
    });

    return { ok: true, permission: data, raw: data };
  }

  if (actionId === 'get_file') {
    const fileId = String(config.fileId || '').trim();
    if (!fileId) throw new Error('Google Drive get_file requires fileId');

    const data = await gJson(
      accessToken,
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,parents,webViewLink,webContentLink,size,createdTime,modifiedTime`,
      { method: 'GET' }
    );

    return { ok: true, file: data, raw: data };
  }

  return { status: 'skipped', reason: `Google Drive action not implemented: ${actionId}` };
}
