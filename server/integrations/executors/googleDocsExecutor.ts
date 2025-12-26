import { z } from 'zod';

const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GoogleDocsExecuteInput = {
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
    throw new Error(`Google API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function findDocumentEndIndex(doc: any): number {
  const contents = Array.isArray(doc?.body?.content) ? doc.body.content : [];
  let max = 1;
  for (const c of contents) {
    const end = typeof c?.endIndex === 'number' ? c.endIndex : undefined;
    if (end && end > max) max = end;
  }
  return max;
}

function buildReplaceAllTextRequests(variables: Record<string, any> | null | undefined) {
  const requests: any[] = [];
  const vars = variables && typeof variables === 'object' ? variables : {};

  for (const [k, v] of Object.entries(vars)) {
    const findText = String(k);
    const replaceText = v === null || v === undefined ? '' : String(v);
    if (!findText) continue;
    requests.push({
      replaceAllText: {
        containsText: { text: findText, matchCase: true },
        replaceText,
      },
    });
  }

  return requests;
}

export async function executeGoogleDocsAction(input: GoogleDocsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = googleAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_document') {
    const title = String(config.title || '').trim();
    const content = String(config.content || '');
    const folderId = String(config.folderId || '').trim() || undefined;

    if (!title) throw new Error('Google Docs create_document requires title');

    const doc = await gJson(accessToken, 'https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    const documentId = String(doc?.documentId || '').trim();
    if (!documentId) throw new Error('Google Docs create_document did not return documentId');

    if (content) {
      await gJson(accessToken, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        }),
      });
    }

    if (folderId) {
      await gJson(
        accessToken,
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(documentId)}?addParents=${encodeURIComponent(folderId)}&fields=id,parents`,
        {
          method: 'PATCH',
          body: JSON.stringify({}),
        }
      );
    }

    return { ok: true, document: doc, documentId, raw: doc };
  }

  if (actionId === 'append_text') {
    const documentId = String(config.documentId || '').trim();
    const text = String(config.text || '');

    if (!documentId) throw new Error('Google Docs append_text requires documentId');
    if (!text) throw new Error('Google Docs append_text requires text');

    const doc = await gJson(accessToken, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`, { method: 'GET' });
    const endIndex = findDocumentEndIndex(doc);

    const resp = await gJson(accessToken, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: Math.max(1, endIndex - 1) },
              text,
            },
          },
        ],
      }),
    });

    return { ok: true, documentId, updates: resp, raw: resp };
  }

  if (actionId === 'replace_text') {
    const documentId = String(config.documentId || '').trim();
    const findText = String(config.findText || '');
    const replaceText = String(config.replaceText || '');
    const matchCase = config.matchCase !== undefined ? Boolean(config.matchCase) : false;

    if (!documentId) throw new Error('Google Docs replace_text requires documentId');
    if (!findText) throw new Error('Google Docs replace_text requires findText');

    const resp = await gJson(accessToken, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            replaceAllText: {
              containsText: { text: findText, matchCase },
              replaceText,
            },
          },
        ],
      }),
    });

    return { ok: true, documentId, updates: resp, raw: resp };
  }

  if (actionId === 'get_content') {
    const documentId = String(config.documentId || '').trim();
    if (!documentId) throw new Error('Google Docs get_content requires documentId');

    const doc = await gJson(accessToken, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`, { method: 'GET' });
    return { ok: true, documentId, document: doc, raw: doc };
  }

  if (actionId === 'create_from_template') {
    const templateId = String(config.templateId || '').trim();
    const newTitle = String(config.newTitle || '').trim();
    const folderId = String(config.folderId || '').trim() || undefined;
    const variables = (config.variables && typeof config.variables === 'object') ? config.variables : undefined;

    if (!templateId) throw new Error('Google Docs create_from_template requires templateId');
    if (!newTitle) throw new Error('Google Docs create_from_template requires newTitle');

    const copyBody: any = { name: newTitle };
    if (folderId) copyBody.parents = [folderId];

    const copied = await gJson(
      accessToken,
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(templateId)}/copy?fields=id,name,parents,webViewLink`,
      {
        method: 'POST',
        body: JSON.stringify(copyBody),
      }
    );

    const newDocId = String(copied?.id || '').trim();
    if (!newDocId) throw new Error('Google Docs template copy did not return file id');

    const requests = buildReplaceAllTextRequests(variables);
    if (requests.length) {
      await gJson(accessToken, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(newDocId)}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({ requests }),
      });
    }

    return { ok: true, documentId: newDocId, file: copied, raw: copied };
  }

  return { status: 'skipped', message: `Google Docs action not implemented: ${actionId}` };
}
