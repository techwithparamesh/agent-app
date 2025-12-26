import { z } from 'zod';

const dropboxAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type DropboxExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function dbxJson(accessToken: string, url: string, body?: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Dropbox API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function fetchBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch content URL (${res.status}): ${text || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || undefined;
  const arrayBuffer = await res.arrayBuffer();
  return { bytes: new Uint8Array(arrayBuffer), contentType };
}

export async function executeDropboxAction(input: DropboxExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = dropboxAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'upload_file') {
    const path = String(config.path || '').trim();
    const contentUrl = String(config.content || '').trim();
    const mode = String(config.mode || '').trim() || 'add';

    if (!path) throw new Error('Dropbox upload_file requires path');
    if (!contentUrl) throw new Error('Dropbox upload_file requires content (URL)');

    const { bytes } = await fetchBytes(contentUrl);

    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path,
          mode: mode === 'overwrite' ? 'overwrite' : 'add',
          autorename: true,
          mute: false,
          strict_conflict: false,
        }),
      },
      body: bytes,
    });

    const text = await res.text().catch(() => '');
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      throw new Error(`Dropbox upload error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }

    return { ok: true, file: data, raw: data };
  }

  if (actionId === 'download_file') {
    const path = String(config.path || '').trim();
    if (!path) throw new Error('Dropbox download_file requires path');

    const res = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path }),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Dropbox download error ${res.status}: ${text || res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || undefined;

    const metaHeader = res.headers.get('dropbox-api-result') || '';
    let meta: any = null;
    try {
      meta = metaHeader ? JSON.parse(metaHeader) : null;
    } catch {
      meta = metaHeader;
    }

    return {
      ok: true,
      path,
      contentType,
      bytesBase64: bytes.toString('base64'),
      metadata: meta,
      raw: meta,
    };
  }

  if (actionId === 'list_folder') {
    const path = String(config.path || '').trim();
    const recursive = config.recursive !== undefined ? Boolean(config.recursive) : false;

    const data = await dbxJson(accessToken, 'https://api.dropboxapi.com/2/files/list_folder', {
      path,
      recursive,
      include_media_info: false,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      include_non_downloadable_files: true,
    });

    return { ok: true, entries: data?.entries || [], cursor: data?.cursor, has_more: data?.has_more, raw: data };
  }

  if (actionId === 'create_folder') {
    const path = String(config.path || '').trim();
    if (!path) throw new Error('Dropbox create_folder requires path');

    const data = await dbxJson(accessToken, 'https://api.dropboxapi.com/2/files/create_folder_v2', {
      path,
      autorename: false,
    });

    return { ok: true, folder: data, raw: data };
  }

  if (actionId === 'move_file') {
    const fromPath = String(config.fromPath || '').trim();
    const toPath = String(config.toPath || '').trim();

    if (!fromPath) throw new Error('Dropbox move_file requires fromPath');
    if (!toPath) throw new Error('Dropbox move_file requires toPath');

    const data = await dbxJson(accessToken, 'https://api.dropboxapi.com/2/files/move_v2', {
      from_path: fromPath,
      to_path: toPath,
      allow_shared_folder: true,
      autorename: false,
      allow_ownership_transfer: false,
    });

    return { ok: true, moved: data, raw: data };
  }

  if (actionId === 'delete_file') {
    const path = String(config.path || '').trim();
    if (!path) throw new Error('Dropbox delete_file requires path');

    const data = await dbxJson(accessToken, 'https://api.dropboxapi.com/2/files/delete_v2', { path });
    return { ok: true, deleted: data, raw: data };
  }

  if (actionId === 'create_shared_link') {
    const path = String(config.path || '').trim();
    if (!path) throw new Error('Dropbox create_shared_link requires path');

    const data = await dbxJson(accessToken, 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      path,
      settings: { requested_visibility: 'public' },
    });

    return { ok: true, link: data, url: data?.url, raw: data };
  }

  return { status: 'skipped', message: `Dropbox action not implemented: ${actionId}` };
}
