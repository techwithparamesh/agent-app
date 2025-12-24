/**
 * Google Sheets Integration API
 * Handles OAuth and spreadsheet operations
 */

import { Router } from 'express';
import { db } from '../../db';
import { eq, and } from 'drizzle-orm';
import { integrations } from '@shared/schema';

const router = Router();

// OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

/**
 * Initiate Google OAuth flow
 */
router.get('/auth', (req, res) => {
  const { agentId, integrationId } = req.query;
  
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
  ];

  const state = JSON.stringify({ agentId, integrationId });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(state)}`;

  res.json({ authUrl });
});

/**
 * Handle OAuth callback
 */
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/dashboard/integrations?error=${encodeURIComponent(error as string)}`);
  }

  if (!code) {
    return res.redirect('/dashboard/integrations?error=no_code');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    
    // Parse state to get integration context
    const stateData = state ? JSON.parse(state as string) : {};
    
    // If we have an integrationId, update it with the tokens
    if (stateData.integrationId) {
      await db.update(integrations)
        .set({
          credentials: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + (tokens.expires_in * 1000),
          },
        })
        .where(eq(integrations.id, stateData.integrationId));
    }

    res.redirect('/dashboard/integrations?success=google_connected');
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    res.redirect(`/dashboard/integrations?error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * List user's spreadsheets
 */
router.get('/spreadsheets', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { integrationId } = req.query;

    if (!integrationId) {
      return res.status(400).json({ error: 'integrationId required' });
    }

    // Get integration with credentials
    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId as string),
          eq(integrations.userId, userId)
        )
      )
      .limit(1);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const credentials = integration.credentials as any;
    if (!credentials?.accessToken) {
      return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    // Check if token needs refresh
    const accessToken = await ensureValidToken(integration);

    // List spreadsheets from Drive
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application/vnd.google-apps.spreadsheet%27&fields=files(id,name)',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch spreadsheets');
    }

    const data = await response.json();
    res.json({ spreadsheets: data.files || [] });
  } catch (err: any) {
    console.error('Error listing spreadsheets:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get sheets within a spreadsheet
 */
router.get('/spreadsheets/:spreadsheetId/sheets', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { spreadsheetId } = req.params;
    const { integrationId } = req.query;

    if (!integrationId) {
      return res.status(400).json({ error: 'integrationId required' });
    }

    // Get integration with credentials
    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId as string),
          eq(integrations.userId, userId)
        )
      )
      .limit(1);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const accessToken = await ensureValidToken(integration);

    // Get spreadsheet metadata
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch sheets');
    }

    const data = await response.json();
    const sheets = data.sheets?.map((s: any) => ({
      id: s.properties.sheetId,
      title: s.properties.title,
    })) || [];

    res.json({ sheets });
  } catch (err: any) {
    console.error('Error listing sheets:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Append row to a sheet
 */
router.post('/spreadsheets/:spreadsheetId/append', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { spreadsheetId } = req.params;
    const { integrationId, sheetName, values } = req.body;

    if (!integrationId || !sheetName || !values) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get integration with credentials
    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.id, integrationId),
          eq(integrations.userId, userId)
        )
      )
      .limit(1);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const accessToken = await ensureValidToken(integration);

    // Append row
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [values] }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to append row');
    }

    const result = await response.json();
    res.json({ success: true, updatedRange: result.updates?.updatedRange });
  } catch (err: any) {
    console.error('Error appending row:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Helper: Ensure we have a valid access token, refresh if needed
 */
async function ensureValidToken(integration: any): Promise<string> {
  const credentials = integration.credentials as any;
  
  if (!credentials?.accessToken) {
    throw new Error('No access token available');
  }

  // Check if token is expired or about to expire (5 min buffer)
  const isExpired = credentials.expiresAt && (Date.now() > credentials.expiresAt - 300000);

  if (isExpired && credentials.refreshToken) {
    // Refresh the token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: credentials.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokens = await response.json();

    // Update stored credentials
    await db.update(integrations)
      .set({
        credentials: {
          ...credentials,
          accessToken: tokens.access_token,
          expiresAt: Date.now() + (tokens.expires_in * 1000),
        },
      })
      .where(eq(integrations.id, integration.id));

    return tokens.access_token;
  }

  return credentials.accessToken;
}

export default router;
