import { createSign } from 'node:crypto';

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
  project_id?: string;
};

export async function getServiceAccountAccessToken(input: {
  serviceAccount: GoogleServiceAccount;
  scopes: string[];
}): Promise<{ accessToken: string; expiresIn?: number }>
{
  const { serviceAccount, scopes } = input;

  const tokenUri = serviceAccount.token_uri || 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload: any = {
    iss: serviceAccount.client_email,
    scope: scopes.join(' '),
    aud: tokenUri,
    iat: now,
    exp: now + 60 * 60,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerEncoded}.${payloadEncoded}`;

  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(serviceAccount.private_key);
  const jwt = `${signingInput}.${base64UrlEncode(signature)}`;

  const body = new URLSearchParams();
  body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
  body.set('assertion', jwt);

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: body.toString(),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Google OAuth token error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  const accessToken = String(data?.access_token || '');
  if (!accessToken) throw new Error('Google OAuth token response missing access_token');

  const expiresIn = typeof data?.expires_in === 'number' ? data.expires_in : undefined;
  return { accessToken, expiresIn };
}
