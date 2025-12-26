/**
 * Integration Credentials & Workflows API Routes
 * 
 * Handles secure storage and management of API keys and workflow definitions.
 */
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { runWorkflow } from './workflowRunner';
import { isAuthenticated } from '../replitAuth';
import { 
  encryptCredentialData, 
  decryptCredentialData, 
  maskCredential 
} from './crypto';
import { getServiceAccountAccessToken } from './googleServiceAccount';
import nodemailer from 'nodemailer';
import { MongoClient } from 'mongodb';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { createClient as createRedisClient } from 'redis';

const router = Router();
const { Client: PgClient } = pg;

// ========== CREDENTIALS ROUTES ==========

// Validation schemas
const createCredentialSchema = z.object({
  name: z.string().min(1).max(255),
  appId: z.string().min(1).max(100),
  credentialType: z.enum(['api_key', 'oauth2', 'basic_auth', 'bearer_token']),
  credentials: z.record(z.any()), // Flexible credential data (api_key, username/password, etc.)
  scopes: z.array(z.string()).optional(),
});

const updateCredentialSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  credentials: z.record(z.any()).optional(),
  scopes: z.array(z.string()).optional(),
  isValid: z.boolean().optional(),
});

// Get all credentials for user (masked)
router.get('/credentials', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credentials = await storage.getCredentialsByUserId(userId);
    
    // Return credentials with masked sensitive data
    const maskedCredentials = credentials.map(cred => {
      let preview = '';
      try {
        const data = decryptCredentialData(cred.encryptedData);
        // Show what type of credential it is
        if (data.apiKey) preview = maskCredential(data.apiKey);
        else if (data.accessToken) preview = maskCredential(data.accessToken);
        else if (data.botToken) preview = maskCredential(data.botToken);
        else if (data.username) preview = `${data.username}:****`;
        else if (data.webhookUrl) preview = '(webhook)';
        else preview = '••••••••';
      } catch {
        preview = '(encrypted)';
      }
      
      return {
        id: cred.id,
        name: cred.name,
        appId: cred.appId,
        credentialType: cred.credentialType,
        preview,
        isValid: cred.isValid,
        lastUsedAt: cred.lastUsedAt,
        lastValidatedAt: cred.lastValidatedAt,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt,
      };
    });
    
    res.json({ credentials: maskedCredentials });
  } catch (error: any) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ message: 'Failed to fetch credentials' });
  }
});

// Get credential by ID (with decrypted data for workflow execution)
router.get('/credentials/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Decrypt and return full credential data
    const decryptedData = decryptCredentialData(credential.encryptedData);
    
    res.json({
      id: credential.id,
      name: credential.name,
      appId: credential.appId,
      credentialType: credential.credentialType,
      credentials: decryptedData,
      scopes: credential.scopes,
      isValid: credential.isValid,
      createdAt: credential.createdAt,
    });
  } catch (error: any) {
    console.error('Error fetching credential:', error);
    res.status(500).json({ message: 'Failed to fetch credential' });
  }
});

// Create new credential
router.post('/credentials', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const data = createCredentialSchema.parse(req.body);
    
    // Encrypt the credential data
    const encryptedData = encryptCredentialData(data.credentials);
    
    const credential = await storage.createCredential(userId, {
      name: data.name,
      appId: data.appId,
      credentialType: data.credentialType,
      encryptedData,
      scopes: data.scopes || [],
      // Credentials must be verified server-side before being treated as usable
      isValid: false,
    });
    
    res.status(201).json({
      id: credential.id,
      name: credential.name,
      appId: credential.appId,
      credentialType: credential.credentialType,
      isValid: credential.isValid,
      createdAt: credential.createdAt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating credential:', error);
    res.status(500).json({ message: 'Failed to create credential' });
  }
});

// Update credential
router.patch('/credentials/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const data = updateCredentialSchema.parse(req.body);
    
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.scopes) updateData.scopes = data.scopes;
    if (data.isValid !== undefined) updateData.isValid = data.isValid;
    
    // If credentials are being updated, re-encrypt
    if (data.credentials) {
      updateData.encryptedData = encryptCredentialData(data.credentials);
      // Require re-verification after secrets change
      updateData.isValid = false;
      updateData.lastValidatedAt = null;
    }
    
    const updated = await storage.updateCredential(req.params.id, updateData);
    
    res.json({
      id: updated?.id,
      name: updated?.name,
      appId: updated?.appId,
      isValid: updated?.isValid,
      updatedAt: updated?.updatedAt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating credential:', error);
    res.status(500).json({ message: 'Failed to update credential' });
  }
});

// Delete credential
router.delete('/credentials/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await storage.deleteCredential(req.params.id);
    res.json({ message: 'Credential deleted' });
  } catch (error: any) {
    console.error('Error deleting credential:', error);
    res.status(500).json({ message: 'Failed to delete credential' });
  }
});

// Verify/test a credential
router.post('/credentials/:id/verify', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const decryptedData = decryptCredentialData(credential.encryptedData);

    const appId = credential.appId;
    let isValid = false;
    let message = 'Credential verification not implemented for this app yet';

    const apiKeyOrToken =
      decryptedData.apiKey ||
      decryptedData.accessToken ||
      decryptedData.token ||
      decryptedData.botToken;

    // Verify OpenAI API key
    if ((appId === 'openai' || appId === 'azure_openai') && decryptedData.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${decryptedData.apiKey}` },
        });

        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid API key';
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify Google AI (Gemini) API key
    if (appId === 'google_ai' && decryptedData.apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(decryptedData.apiKey)}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid API key';
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify ElevenLabs API key
    if (appId === 'elevenlabs' && decryptedData.apiKey) {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': decryptedData.apiKey, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid API key';
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify Replicate API token
    if (appId === 'replicate' && decryptedData.apiToken) {
      try {
        const response = await fetch('https://api.replicate.com/v1/models?limit=1', {
          headers: { Authorization: `Token ${decryptedData.apiToken}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid API token';
      } catch {
        isValid = false;
        message = 'Failed to verify API token';
      }
    }

    // Verify HuggingFace API token
    if (appId === 'huggingface' && decryptedData.apiToken) {
      try {
        const response = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { Authorization: `Bearer ${decryptedData.apiToken}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid API token';
      } catch {
        isValid = false;
        message = 'Failed to verify API token';
      }
    }

    // Verify Google Meet (Calendar-scoped access token)
    if (appId === 'google_meet' && decryptedData.accessToken) {
      try {
        const response = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(decryptedData.accessToken)}`,
          { headers: { Accept: 'application/json' } },
        );

        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Salesforce OAuth access token
    if (appId === 'salesforce' && decryptedData.accessToken && decryptedData.instanceUrl) {
      try {
        const instanceUrl = String(decryptedData.instanceUrl).replace(/\/$/, '');
        const response = await fetch(`${instanceUrl}/services/data/v59.0/`, {
          headers: { Authorization: `Bearer ${decryptedData.accessToken}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Pipedrive API token
    if (appId === 'pipedrive' && decryptedData.apiToken && decryptedData.companyDomain) {
      try {
        const companyDomain = String(decryptedData.companyDomain).replace(/^https?:\/\//, '').replace(/\/$/, '');
        const url = new URL(`https://${companyDomain}/api/v1/users/me`);
        url.searchParams.set('api_token', String(decryptedData.apiToken));
        const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid API token';
      } catch {
        isValid = false;
        message = 'Failed to verify API token';
      }
    }

    // Verify Zoho CRM OAuth access token
    if (appId === 'zoho_crm' && decryptedData.accessToken) {
      try {
        const apiDomain = decryptedData.apiDomain ? String(decryptedData.apiDomain).replace(/\/$/, '') : 'https://www.zohoapis.com';
        const base = apiDomain.startsWith('http') ? apiDomain : `https://${apiDomain}`;
        const response = await fetch(`${base}/crm/v2/org`, {
          headers: { Authorization: `Zoho-oauthtoken ${decryptedData.accessToken}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Freshsales API key
    if (appId === 'freshsales' && decryptedData.apiKey && decryptedData.domain) {
      try {
        const domain = String(decryptedData.domain).replace(/^https?:\/\//, '').replace(/\/$/, '');
        const response = await fetch(`https://${domain}/api/users/me`, {
          headers: { Authorization: `Token token=${decryptedData.apiKey}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid API key';
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify Zapier webhook URL (format-only, no side effects)
    if (appId === 'zapier' && decryptedData.webhookUrl) {
      try {
        // Avoid making a network request during verification.
        new URL(String(decryptedData.webhookUrl));
        isValid = true;
        message = 'Webhook URL looks valid';
      } catch {
        isValid = false;
        message = 'Invalid webhook URL';
      }
    }

    // Verify Make webhook URL (format-only, no side effects)
    if (appId === 'make' && decryptedData.webhookUrl) {
      try {
        new URL(String(decryptedData.webhookUrl));
        isValid = true;
        message = 'Webhook URL looks valid';
      } catch {
        isValid = false;
        message = 'Invalid webhook URL';
      }
    }

    // Verify n8n webhook URL (format-only, no side effects)
    if (appId === 'n8n' && decryptedData.webhookUrl) {
      try {
        new URL(String(decryptedData.webhookUrl));
        isValid = true;
        message = 'Webhook URL looks valid';
      } catch {
        isValid = false;
        message = 'Invalid webhook URL';
      }
    }

    // Verify Power Automate Flow URL (format-only, no side effects)
    if (appId === 'power_automate' && decryptedData.flowUrl) {
      try {
        new URL(String(decryptedData.flowUrl));
        isValid = true;
        message = 'Flow URL looks valid';
      } catch {
        isValid = false;
        message = 'Invalid flow URL';
      }
    }

    // Verify Supabase credentials (format-only; avoid making requests to arbitrary hosts)
    if (appId === 'supabase' && decryptedData.projectUrl && decryptedData.anonKey) {
      try {
        new URL(String(decryptedData.projectUrl));
        isValid = true;
        message = 'Supabase project URL looks valid';
      } catch {
        isValid = false;
        message = 'Invalid Supabase project URL';
      }
    }

    // Verify Firebase service account by obtaining an access token
    if (appId === 'firebase' && decryptedData.projectId && decryptedData.serviceAccount) {
      try {
        const projectId = String(decryptedData.projectId).trim();
        const serviceAccountRaw = decryptedData.serviceAccount;
        const serviceAccount = typeof serviceAccountRaw === 'string'
          ? JSON.parse(serviceAccountRaw)
          : serviceAccountRaw;

        const clientEmail = String(serviceAccount?.client_email || '').trim();
        const privateKey = String(serviceAccount?.private_key || '').trim();
        const tokenUri = serviceAccount?.token_uri ? String(serviceAccount.token_uri).trim() : undefined;
        if (!projectId) throw new Error('Missing projectId');
        if (!clientEmail || !privateKey) throw new Error('Service account missing client_email/private_key');

        await getServiceAccountAccessToken({
          serviceAccount: {
            client_email: clientEmail,
            private_key: privateKey,
            token_uri: tokenUri,
          },
          scopes: ['https://www.googleapis.com/auth/datastore'],
        });

        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Failed to verify service account';
      }
    }

    // Verify WhatsApp Business API access token
    if (appId === 'whatsapp' && decryptedData.accessToken && decryptedData.phoneNumberId) {
      try {
        const phoneNumberId = String(decryptedData.phoneNumberId).trim();
        const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneNumberId)}?fields=id`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${String(decryptedData.accessToken)}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Gmail OAuth access token
    if (appId === 'gmail' && decryptedData.accessToken) {
      try {
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${String(decryptedData.accessToken)}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Google Docs OAuth access token
    if (appId === 'google_docs' && decryptedData.accessToken) {
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(String(decryptedData.accessToken))}`, {
          headers: { Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Google Forms OAuth access token
    if (appId === 'google_forms' && decryptedData.accessToken) {
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(String(decryptedData.accessToken))}`, {
          headers: { Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Google Analytics OAuth access token
    if (appId === 'google_analytics' && decryptedData.accessToken) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(String(decryptedData.accessToken))}`,
          { headers: { Accept: 'application/json' } },
        );
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Facebook Ads access token
    if (appId === 'facebook_ads' && decryptedData.accessToken) {
      try {
        const url = `https://graph.facebook.com/v20.0/me?fields=id&access_token=${encodeURIComponent(String(decryptedData.accessToken))}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Google Ads credentials by listing accessible customers
    if (appId === 'google_ads' && decryptedData.accessToken && decryptedData.developerToken) {
      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${String(decryptedData.accessToken)}`,
          'developer-token': String(decryptedData.developerToken),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };

        if (decryptedData.loginCustomerId) {
          headers['login-customer-id'] = String(decryptedData.loginCustomerId).replace(/-/g, '').trim();
        }

        const response = await fetch('https://googleads.googleapis.com/v17/customers:listAccessibleCustomers', {
          method: 'POST',
          headers,
          body: JSON.stringify({}),
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid Google Ads credentials';
      } catch {
        isValid = false;
        message = 'Failed to verify Google Ads credentials';
      }
    }

    // Verify LinkedIn OAuth access token
    if (appId === 'linkedin' && decryptedData.accessToken) {
      try {
        const response = await fetch('https://api.linkedin.com/v2/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            Accept: 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Tawk credentials cannot be verified generically here; validate presence/shape only
    if (appId === 'tawk') {
      try {
        if (decryptedData.apiKey && typeof decryptedData.apiKey !== 'string') throw new Error('Invalid apiKey');
        if (decryptedData.propertyId && typeof decryptedData.propertyId !== 'string') throw new Error('Invalid propertyId');
        if (!decryptedData.apiKey || !decryptedData.propertyId) throw new Error('Missing apiKey or propertyId');
        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Invalid Tawk credential data';
      }
    }

    // Verify Dropbox OAuth access token
    if (appId === 'dropbox' && decryptedData.accessToken) {
      try {
        const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: 'null',
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify MongoDB connection string by pinging the DB
    if (appId === 'mongodb' && decryptedData.connectionString && decryptedData.database) {
      try {
        const connectionString = String(decryptedData.connectionString);
        const database = String(decryptedData.database);

        const client = new MongoClient(connectionString, {
          serverSelectionTimeoutMS: 8000,
          connectTimeoutMS: 8000,
        });

        try {
          await Promise.race([
            (async () => {
              await client.connect();
              await client.db(database).command({ ping: 1 });
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('MongoDB verify timeout')), 8000)),
          ]);
        } finally {
          await client.close().catch(() => undefined);
        }

        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Failed to verify MongoDB connection';
      }
    }

    // Verify AWS credentials with STS GetCallerIdentity
    if (appId === 'aws_s3' && decryptedData.accessKeyId && decryptedData.secretAccessKey && decryptedData.region) {
      try {
        const region = String(decryptedData.region);
        const accessKeyId = String(decryptedData.accessKeyId);
        const secretAccessKey = String(decryptedData.secretAccessKey);

        const sts = new STSClient({
          region,
          credentials: { accessKeyId, secretAccessKey },
        });

        const resp = await sts.send(new GetCallerIdentityCommand({}));
        isValid = Boolean(resp?.Arn);
        message = isValid ? 'Credential verified successfully' : 'Invalid AWS credentials';
      } catch {
        isValid = false;
        message = 'Failed to verify AWS credentials';
      }
    }

    // Verify Razorpay credentials (Basic auth) by listing payments
    if (appId === 'razorpay' && decryptedData.keyId && decryptedData.keySecret) {
      try {
        const token = Buffer.from(`${String(decryptedData.keyId)}:${String(decryptedData.keySecret)}`, 'utf8').toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
          method: 'GET',
          headers: {
            Authorization: `Basic ${token}`,
            Accept: 'application/json',
          },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid Razorpay credentials';
      } catch {
        isValid = false;
        message = 'Failed to verify Razorpay credentials';
      }
    }

    // Verify Calendly token by fetching current user
    if (appId === 'calendly' && (decryptedData.apiKey || decryptedData.accessToken || decryptedData.token)) {
      try {
        const token = String(decryptedData.apiKey || decryptedData.accessToken || decryptedData.token);
        const response = await fetch('https://api.calendly.com/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid Calendly token';
      } catch {
        isValid = false;
        message = 'Failed to verify Calendly token';
      }
    }

    // Webhook credentials are purely optional headers; validate format only
    if (appId === 'webhook') {
      try {
        if (decryptedData.headers !== undefined && decryptedData.headers !== null && typeof decryptedData.headers !== 'object') {
          throw new Error('Invalid headers');
        }
        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Invalid webhook headers';
      }
    }

    // REST API credentials can’t be verified generically; validate presence/shape only
    if (appId === 'rest_api') {
      try {
        if (decryptedData.apiKey && decryptedData.headerName && typeof decryptedData.headerName !== 'string') {
          throw new Error('Invalid headerName');
        }
        if (decryptedData.username && !decryptedData.password) {
          throw new Error('Missing password');
        }
        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Invalid REST API credential data';
      }
    }

    // Verify GraphQL credentials by running an introspection-lite query
    if (appId === 'graphql' && decryptedData.endpoint) {
      try {
        const endpoint = String(decryptedData.endpoint);
        const headers: Record<string, string> = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        };

        if (decryptedData.token) headers['Authorization'] = `Bearer ${String(decryptedData.token)}`;
        if (decryptedData.apiKey) headers[String(decryptedData.headerName || 'X-API-Key')] = String(decryptedData.apiKey);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query: 'query { __typename }' }),
            signal: controller.signal,
          });
          const text = await response.text().catch(() => '');
          let data: any = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = text;
          }

          const hasErrors = !!data && typeof data === 'object' && Array.isArray((data as any).errors) && (data as any).errors.length > 0;
          isValid = response.ok && !!data && typeof data === 'object' && !hasErrors;
          message = isValid ? 'Credential verified successfully' : 'GraphQL endpoint rejected the request';
        } finally {
          clearTimeout(timeout);
        }
      } catch {
        isValid = false;
        message = 'Failed to verify GraphQL endpoint';
      }
    }

    // Verify Microsoft Teams OAuth access token
    if (appId === 'microsoft_teams' && decryptedData.accessToken) {
      try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${String(decryptedData.accessToken)}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Microsoft Outlook OAuth access token
    if (appId === 'outlook' && decryptedData.accessToken) {
      try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${String(decryptedData.accessToken)}`, Accept: 'application/json' },
        });
        isValid = response.ok;
        message = isValid ? 'Credential verified successfully' : 'Invalid access token';
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Microsoft Teams Incoming Webhook URL (format-only)
    if (appId === 'microsoft_teams' && decryptedData.webhookUrl) {
      try {
        new URL(String(decryptedData.webhookUrl));
        isValid = true;
        message = 'Webhook URL looks valid';
      } catch {
        isValid = false;
        message = 'Invalid webhook URL';
      }
    }

    // Verify SMTP credentials by opening a connection
    if (appId === 'smtp' && decryptedData.host && decryptedData.port && decryptedData.username && decryptedData.password) {
      try {
        const host = String(decryptedData.host);
        const port = Number(decryptedData.port);
        const secure = decryptedData.secure !== undefined ? Boolean(decryptedData.secure) : port === 465;
        const username = String(decryptedData.username);
        const password = String(decryptedData.password);

        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user: username, pass: password },
        });

        const verifyPromise = transporter.verify();
        await Promise.race([
          verifyPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP verify timeout')), 8000)),
        ]);

        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Failed to verify SMTP credentials';
      }
    }

    // Verify Slack bot/user token (bearer token)
    if ((appId === 'slack' || appId === 'slack_bot') && apiKeyOrToken) {
      try {
        const response = await fetch('https://slack.com/api/auth.test', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKeyOrToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: '',
        });

        const payload = (await response.json().catch(() => null)) as any;
        isValid = Boolean(payload?.ok);
        message = isValid
          ? 'Credential verified successfully'
          : (payload?.error ? `Invalid token: ${payload.error}` : 'Invalid token');
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // No-auth: always valid
    if (appId === 'custom_integration') {
      isValid = true;
      message = 'No authentication required';
    }

    // Verify Segment write key (format-only to avoid sending events)
    if (appId === 'segment' && decryptedData.writeKey) {
      const wk = String(decryptedData.writeKey).trim();
      isValid = wk.length > 0;
      message = isValid ? 'Write key looks set' : 'Missing write key';
    }

    // Verify Mixpanel project token (format-only to avoid sending events)
    if (appId === 'mixpanel' && decryptedData.projectToken) {
      const token = String(decryptedData.projectToken).trim();
      isValid = token.length > 0;
      message = isValid ? 'Project token looks set' : 'Missing project token';
    }

    // Verify Mastodon access token by checking verify_credentials
    if (appId === 'mastodon' && decryptedData.instanceUrl && decryptedData.accessToken) {
      try {
        const instanceUrl = String(decryptedData.instanceUrl).replace(/\/+$/, '');

        const verifyPromise = fetch(`${instanceUrl}/api/v1/accounts/verify_credentials`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Mastodon verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Reddit access token (non-destructive)
    if (appId === 'reddit' && decryptedData.accessToken) {
      try {
        const verifyPromise = fetch('https://oauth.reddit.com/api/v1/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            'User-Agent': 'agent-app/1.0 (credential verify)',
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Reddit verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Elasticsearch API key (non-destructive)
    if (appId === 'elasticsearch' && decryptedData.baseUrl && decryptedData.apiKey) {
      try {
        const baseUrl = String(decryptedData.baseUrl).replace(/\/+$/, '');
        new URL(baseUrl);

        const verifyPromise = fetch(`${baseUrl}/_cluster/health`, {
          method: 'GET',
          headers: {
            Authorization: `ApiKey ${String(decryptedData.apiKey)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Elasticsearch verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid credentials: ${text}` : 'Invalid credentials';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify Elasticsearch credentials';
      }
    }

    // Verify LiveAgent API key (format-only; deployments vary too much for a reliable probe)
    if (appId === 'liveagent' && decryptedData.baseUrl && decryptedData.apiKey) {
      try {
        const baseUrl = String(decryptedData.baseUrl).replace(/\/+$/, '');
        new URL(baseUrl);
        const apiKey = String(decryptedData.apiKey).trim();
        isValid = apiKey.length > 0;
        message = isValid ? 'API key looks set (format-only)' : 'Missing API key';
      } catch {
        isValid = false;
        message = 'Invalid baseUrl';
      }
    }

    // Verify Help Scout access token by calling users/me
    if (appId === 'helpscout' && apiKeyOrToken) {
      try {
        const verifyPromise = fetch('https://api.helpscout.net/v2/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(apiKeyOrToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Help Scout verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Twitter access token (non-destructive)
    if (appId === 'twitter' && apiKeyOrToken) {
      try {
        const verifyPromise = fetch('https://api.twitter.com/2/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(apiKeyOrToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Twitter verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Instagram Graph token (non-destructive)
    if (appId === 'instagram' && apiKeyOrToken) {
      try {
        const url = new URL('https://graph.facebook.com/v19.0/me');
        url.searchParams.set('fields', 'id');
        url.searchParams.set('access_token', String(apiKeyOrToken));

        const verifyPromise = fetch(url.toString(), { method: 'GET', headers: { Accept: 'application/json' } });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Instagram verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify YouTube access token (non-destructive)
    if (appId === 'youtube' && apiKeyOrToken) {
      try {
        const verifyPromise = fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&maxResults=1', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(apiKeyOrToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('YouTube verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify TikTok access token (non-destructive)
    if (appId === 'tiktok' && apiKeyOrToken) {
      try {
        const verifyPromise = fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(apiKeyOrToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('TikTok verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Pinterest access token (non-destructive)
    if (appId === 'pinterest' && apiKeyOrToken) {
      try {
        const verifyPromise = fetch('https://api.pinterest.com/v5/user_account', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(apiKeyOrToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Pinterest verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Anthropic API key
    if (appId === 'anthropic' && decryptedData.apiKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/models?limit=1', {
          method: 'GET',
          headers: {
            'x-api-key': String(decryptedData.apiKey),
            'anthropic-version': '2023-06-01',
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) {
          message = 'Credential verified successfully';
        } else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid API key: ${text}` : 'Invalid API key';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify SendGrid API key
    if (appId === 'sendgrid' && decryptedData.apiKey) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.apiKey)}`,
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid API key: ${text}` : 'Invalid API key';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify Mailgun API key + domain
    if (appId === 'mailgun' && decryptedData.apiKey && decryptedData.domain) {
      try {
        const region = String(decryptedData.region || '').trim();
        const baseUrl = region === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
        const auth = `Basic ${Buffer.from(`api:${String(decryptedData.apiKey)}`).toString('base64')}`;

        const response = await fetch(`${baseUrl}/v3/domains/${encodeURIComponent(String(decryptedData.domain))}`, {
          method: 'GET',
          headers: { Authorization: auth, Accept: 'application/json' },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid API key/domain: ${text}` : 'Invalid API key/domain';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API key/domain';
      }
    }

    // Verify Twilio Account SID/Auth Token
    if ((appId === 'twilio_sms' || appId === 'sms_twilio') && decryptedData.accountSid && decryptedData.authToken) {
      try {
        const auth = `Basic ${Buffer.from(`${String(decryptedData.accountSid)}:${String(decryptedData.authToken)}`).toString('base64')}`;
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(String(decryptedData.accountSid))}.json`,
          {
            method: 'GET',
            headers: { Authorization: auth, Accept: 'application/json' },
          }
        );

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid SID/token: ${text}` : 'Invalid SID/token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify SID/token';
      }
    }

    // Verify Twilio Voice Account SID/Auth Token
    if (appId === 'twilio_voice' && decryptedData.accountSid && decryptedData.authToken) {
      try {
        const auth = `Basic ${Buffer.from(`${String(decryptedData.accountSid)}:${String(decryptedData.authToken)}`).toString('base64')}`;
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(String(decryptedData.accountSid))}.json`,
          {
            method: 'GET',
            headers: { Authorization: auth, Accept: 'application/json' },
          }
        );

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid SID/token: ${text}` : 'Invalid SID/token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify SID/token';
      }
    }

    // Internal no-auth apps
    if (appId === 'schedule' || appId === 'manual' || appId === 'if_condition' || appId === 'switch' || appId === 'loop' || appId === 'set_variable' || appId === 'code') {
      isValid = true;
      message = 'Credential verified successfully';
    }

    // Verify IFTTT Webhooks key by triggering the test endpoint (GET will 405; we just validate key format)
    if (appId === 'ifttt' && decryptedData.key) {
      try {
        if (typeof decryptedData.key !== 'string' || !String(decryptedData.key).trim()) throw new Error('Invalid key');
        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Invalid IFTTT key';
      }
    }

    // Verify Azure OpenAI config by calling deployments chat completions with a tiny request
    if (appId === 'azure_openai' && decryptedData.endpoint && decryptedData.apiKey && decryptedData.deployment) {
      try {
        const endpoint = String(decryptedData.endpoint).replace(/\/+$/, '');
        const apiVersion = String(decryptedData.apiVersion || '2024-02-15-preview');
        const deployment = String(decryptedData.deployment);

        const url = new URL(`${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions`);
        url.searchParams.set('api-version', apiVersion);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'api-key': String(decryptedData.apiKey),
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1,
            }),
            signal: controller.signal,
          });
          isValid = response.ok;
          message = isValid ? 'Credential verified successfully' : 'Invalid Azure OpenAI credentials';
        } finally {
          clearTimeout(timeout);
        }
      } catch {
        isValid = false;
        message = 'Failed to verify Azure OpenAI credentials';
      }
    }

    // Verify Stripe secret key
    if (appId === 'stripe' && decryptedData.secretKey) {
      try {
        const response = await fetch('https://api.stripe.com/v1/account', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.secretKey)}`,
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid secret key: ${text}` : 'Invalid secret key';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify secret key';
      }
    }

    // Verify Shopify access token
    if (appId === 'shopify' && decryptedData.shopDomain && decryptedData.accessToken) {
      try {
        const normalized = String(decryptedData.shopDomain).replace(/^https?:\/\//, '').trim();
        const response = await fetch(`https://${normalized}/admin/api/2024-01/shop.json`, {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': String(decryptedData.accessToken),
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token/domain: ${text}` : 'Invalid token/domain';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token/domain';
      }
    }

    // Verify GitHub token
    if (appId === 'github' && decryptedData.token) {
      try {
        const response = await fetch('https://api.github.com/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.token)}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Intercom access token
    if (appId === 'intercom' && decryptedData.accessToken) {
      try {
        const response = await fetch('https://api.intercom.io/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            Accept: 'application/json',
            'Intercom-Version': '2.11',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Zendesk API token
    if (appId === 'zendesk' && decryptedData.subdomain && decryptedData.email && decryptedData.apiToken) {
      try {
        const raw = `${String(decryptedData.email)}/token:${String(decryptedData.apiToken)}`;
        const auth = `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
        const url = `https://${String(decryptedData.subdomain).trim()}.zendesk.com/api/v2/account/settings.json`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { Authorization: auth, Accept: 'application/json' },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Freshdesk API key
    if (appId === 'freshdesk' && decryptedData.domain && decryptedData.apiKey) {
      try {
        const d = String(decryptedData.domain).trim();
        const baseUrl = d.startsWith('http://') || d.startsWith('https://') ? d : `https://${d}`;
        const auth = `Basic ${Buffer.from(`${String(decryptedData.apiKey)}:X`, 'utf8').toString('base64')}`;

        const response = await fetch(`${baseUrl}/api/v2/agents/me`, {
          method: 'GET',
          headers: { Authorization: auth, Accept: 'application/json' },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid API key: ${text}` : 'Invalid API key';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify Crisp API credentials
    if (appId === 'crisp' && decryptedData.websiteId && decryptedData.identifier && decryptedData.key) {
      try {
        const auth = `Basic ${Buffer.from(`${String(decryptedData.identifier)}:${String(decryptedData.key)}`, 'utf8').toString('base64')}`;
        const response = await fetch(
          `https://api.crisp.chat/v1/website/${encodeURIComponent(String(decryptedData.websiteId))}`,
          {
            method: 'GET',
            headers: { Authorization: auth, Accept: 'application/json' },
          }
        );

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid credentials: ${text}` : 'Invalid credentials';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify credentials';
      }
    }

    // Verify Asana Personal Access Token
    if (appId === 'asana' && decryptedData.accessToken) {
      try {
        const response = await fetch('https://app.asana.com/api/1.0/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid access token: ${text}` : 'Invalid access token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Jira Cloud API token
    if (appId === 'jira' && decryptedData.domain && decryptedData.email && decryptedData.apiToken) {
      try {
        const normalized = String(decryptedData.domain).replace(/^https?:\/\//, '').trim();
        const raw = `${String(decryptedData.email)}:${String(decryptedData.apiToken)}`;
        const auth = `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
        const response = await fetch(`https://${normalized}/rest/api/3/myself`, {
          method: 'GET',
          headers: {
            Authorization: auth,
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid Jira credentials: ${text}` : 'Invalid Jira credentials';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify Jira credentials';
      }
    }

    // Verify Monday.com API token
    if (appId === 'monday' && decryptedData.apiToken) {
      try {
        const response = await fetch('https://api.monday.com/v2', {
          method: 'POST',
          headers: {
            Authorization: String(decryptedData.apiToken),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ query: 'query { me { id name } }' }),
        });

        const payload = (await response.json().catch(() => null)) as any;
        const ok = response.ok && !payload?.errors && payload?.data?.me?.id;
        isValid = Boolean(ok);
        message = isValid
          ? 'Credential verified successfully'
          : (payload?.errors ? `Invalid API token: ${JSON.stringify(payload.errors)}` : 'Invalid API token');
      } catch {
        isValid = false;
        message = 'Failed to verify API token';
      }
    }

    // Verify GitLab Personal Access Token
    if (appId === 'gitlab' && decryptedData.token) {
      try {
        const baseUrl = String(decryptedData.baseUrl || 'https://gitlab.com').trim().replace(/\/+$/, '') || 'https://gitlab.com';
        const response = await fetch(`${baseUrl}/api/v4/user`, {
          method: 'GET',
          headers: {
            'PRIVATE-TOKEN': String(decryptedData.token),
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid token: ${text}` : 'Invalid token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify token';
      }
    }

    // Verify Bitbucket App Password
    if (appId === 'bitbucket' && decryptedData.username && decryptedData.appPassword) {
      try {
        const auth = `Basic ${Buffer.from(`${String(decryptedData.username)}:${String(decryptedData.appPassword)}`, 'utf8').toString('base64')}`;
        const response = await fetch('https://api.bitbucket.org/2.0/user', {
          method: 'GET',
          headers: { Authorization: auth, Accept: 'application/json' },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid credentials: ${text}` : 'Invalid credentials';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify credentials';
      }
    }

    // Verify ClickUp API token
    if (appId === 'clickup' && decryptedData.apiToken) {
      try {
        const response = await fetch('https://api.clickup.com/api/v2/user', {
          method: 'GET',
          headers: {
            Authorization: String(decryptedData.apiToken),
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid API token: ${text}` : 'Invalid API token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API token';
      }
    }

    // Verify Trello API key + token
    if (appId === 'trello' && decryptedData.apiKey && decryptedData.token) {
      try {
        const url = `https://api.trello.com/1/members/me?key=${encodeURIComponent(String(decryptedData.apiKey))}&token=${encodeURIComponent(String(decryptedData.token))}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid key/token: ${text}` : 'Invalid key/token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify key/token';
      }
    }

    // Verify Airtable Personal Access Token
    if (appId === 'airtable' && decryptedData.apiKey) {
      try {
        // Uses Airtable Meta API; requires appropriate PAT scopes.
        const response = await fetch('https://api.airtable.com/v0/meta/bases?maxRecords=1', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.apiKey)}`,
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid API token: ${text}` : 'Invalid API token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API token';
      }
    }

    // Verify Notion Integration token
    if (appId === 'notion' && decryptedData.apiKey) {
      try {
        const response = await fetch('https://api.notion.com/v1/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.apiKey)}`,
            'Notion-Version': '2022-06-28',
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid API token: ${text}` : 'Invalid API token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API token';
      }
    }

    // Verify Linear API key
    if (appId === 'linear' && decryptedData.apiKey) {
      try {
        const response = await fetch('https://api.linear.app/graphql', {
          method: 'POST',
          headers: {
            Authorization: String(decryptedData.apiKey),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ query: 'query { viewer { id } }' }),
        });

        const payload = (await response.json().catch(() => null)) as any;
        const ok = response.ok && !payload?.errors && payload?.data?.viewer?.id;
        isValid = Boolean(ok);
        message = isValid
          ? 'Credential verified successfully'
          : (payload?.errors ? `Invalid API key: ${JSON.stringify(payload.errors)}` : 'Invalid API key');
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify Telegram bot token
    if (appId === 'telegram' && decryptedData.botToken) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${encodeURIComponent(String(decryptedData.botToken))}/getMe`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );

        const payload = (await response.json().catch(() => null)) as any;
        const ok = response.ok && payload?.ok === true && payload?.result?.id;
        isValid = Boolean(ok);
        message = isValid
          ? 'Credential verified successfully'
          : (payload?.description ? `Invalid bot token: ${payload.description}` : 'Invalid bot token');
      } catch {
        isValid = false;
        message = 'Failed to verify bot token';
      }
    }

    // Verify Discord bot token or webhook URL
    if ((appId === 'discord' || appId === 'discord_bot') && (decryptedData.botToken || decryptedData.webhookUrl)) {
      try {
        if (decryptedData.botToken) {
          const response = await fetch('https://discord.com/api/v10/users/@me', {
            method: 'GET',
            headers: {
              Authorization: `Bot ${String(decryptedData.botToken)}`,
              Accept: 'application/json',
            },
          });

          isValid = response.ok;
          if (isValid) message = 'Credential verified successfully';
          else {
            const text = await response.text().catch(() => '');
            message = text ? `Invalid bot token: ${text}` : 'Invalid bot token';
          }
        } else {
          if (appId === 'discord_bot') {
            isValid = false;
            message = 'Discord Bot requires botToken';
          } else {
          const response = await fetch(String(decryptedData.webhookUrl), {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });

          isValid = response.ok;
          if (isValid) message = 'Credential verified successfully';
          else {
            const text = await response.text().catch(() => '');
            message = text ? `Invalid webhook URL: ${text}` : 'Invalid webhook URL';
          }
          }
        }
      } catch {
        isValid = false;
        message = 'Failed to verify Discord credential';
      }
    }

    // Verify Square access token
    if (appId === 'square' && decryptedData.accessToken) {
      try {
        const environment = String(decryptedData.environment || 'production');
        const baseUrl = environment === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';

        const verifyPromise = fetch(`${baseUrl}/v2/locations`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Square verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid access token: ${text}` : 'Invalid access token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // No-auth: always valid (format-only)
    if (appId === 'webhook_outgoing') {
      isValid = true;
      message = 'No authentication required';
    }

    // Verify Custom API settings (format-only)
    if (appId === 'custom_api' && decryptedData.baseUrl) {
      try {
        new URL(String(decryptedData.baseUrl));

        const rawHeaders = decryptedData.headers;
        if (typeof rawHeaders === 'string' && rawHeaders.trim()) {
          JSON.parse(rawHeaders);
        }

        isValid = true;
        message = 'Settings look valid';
      } catch {
        isValid = false;
        message = 'Invalid Custom API settings';
      }
    }

    // Verify Mailchimp API key
    if (appId === 'mailchimp' && decryptedData.apiKey) {
      try {
        const apiKey = String(decryptedData.apiKey);
        const parts = apiKey.split('-');
        const dc = parts.length > 1 ? parts[parts.length - 1] : '';
        if (!dc) {
          isValid = false;
          message = 'Mailchimp API key must include datacenter suffix like "xxxx-us1"';
        } else {
          const auth = `Basic ${Buffer.from(`anystring:${apiKey}`, 'utf8').toString('base64')}`;
          const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/ping`, {
            method: 'GET',
            headers: { Authorization: auth, Accept: 'application/json' },
          });

          isValid = response.ok;
          if (isValid) message = 'Credential verified successfully';
          else {
            const text = await response.text().catch(() => '');
            message = text ? `Invalid API key: ${text}` : 'Invalid API key';
          }
        }
      } catch {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }

    // Verify Google OAuth access token (tokeninfo)
    if (appId === 'google_sheets' && decryptedData.accessToken) {
      try {
        const response = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(String(decryptedData.accessToken))}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid access token: ${text}` : 'Invalid access token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify HubSpot private app token (also used by HubSpot OAuth/Marketing configs as a fallback)
    if ((appId === 'hubspot' || appId === 'hubspot_oauth' || appId === 'hubspot_marketing') && decryptedData.accessToken) {
      try {
        const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            Accept: 'application/json',
          },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid access token: ${text}` : 'Invalid access token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify Snapchat access token (format-only)
    if (appId === 'snapchat' && decryptedData.accessToken) {
      const token = String(decryptedData.accessToken).trim();
      isValid = token.length > 0;
      message = isValid ? 'Access token looks set' : 'Missing access token';
    }

    // Verify Drift access token (non-destructive)
    if (appId === 'drift' && decryptedData.accessToken) {
      try {
        const verifyPromise = fetch('https://driftapi.com/users/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${String(decryptedData.accessToken)}`,
            Accept: 'application/json',
          },
        });

        const response = await Promise.race([
          verifyPromise,
          new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Drift verify timeout')), 8000)),
        ]);

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid access token: ${text}` : 'Invalid access token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }

    // Verify BigQuery service account by obtaining an access token (and probing datasets)
    if (appId === 'bigquery' && decryptedData.projectId && decryptedData.serviceAccountJson) {
      try {
        const projectId = String(decryptedData.projectId);
        const raw = decryptedData.serviceAccountJson;
        const serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw;

        const token = await Promise.race([
          getServiceAccountAccessToken({
            serviceAccount,
            scopes: ['https://www.googleapis.com/auth/bigquery'],
          }),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('BigQuery verify timeout')), 8000)),
        ]);

        const response = await fetch(
          `https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(projectId)}/datasets?maxResults=1`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${String(token.accessToken)}`,
              Accept: 'application/json',
            },
          }
        );

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid service account/project: ${text}` : 'Invalid service account/project';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify service account';
      }
    }

    // Verify Cosmos DB connection (format-only)
    if (appId === 'cosmosdb' && decryptedData.endpoint && decryptedData.key && decryptedData.databaseId) {
      try {
        new URL(String(decryptedData.endpoint));
        isValid = true;
        message = 'Settings look valid';
      } catch {
        isValid = false;
        message = 'Invalid endpoint URL';
      }
    }

    // Verify PostgreSQL connection
    if (appId === 'postgresql' && decryptedData.host && decryptedData.database && decryptedData.user && decryptedData.password) {
      const client = new PgClient({
        host: String(decryptedData.host),
        port: Number(decryptedData.port || 5432),
        database: String(decryptedData.database),
        user: String(decryptedData.user),
        password: String(decryptedData.password),
        ssl: decryptedData.ssl === false ? undefined : (decryptedData.ssl === true ? { rejectUnauthorized: false } : undefined),
      });

      try {
        const connectPromise = client.connect();
        await Promise.race([
          connectPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('PostgreSQL connect timeout')), 8000)),
        ]);

        const res = await client.query('SELECT 1 AS ok');
        isValid = Boolean(res?.rows?.[0]?.ok === 1 || res?.rows?.[0]?.ok === '1');
        message = isValid ? 'Credential verified successfully' : 'Failed to verify connection';
      } catch {
        isValid = false;
        message = 'Failed to verify PostgreSQL connection';
      } finally {
        await client.end().catch(() => undefined);
      }
    }

    // Verify MySQL connection
    if (appId === 'mysql' && decryptedData.host && decryptedData.database && decryptedData.user && decryptedData.password) {
      try {
        const conn = await Promise.race([
          mysql.createConnection({
            host: String(decryptedData.host),
            port: Number(decryptedData.port || 3306),
            database: String(decryptedData.database),
            user: String(decryptedData.user),
            password: String(decryptedData.password),
            ssl: decryptedData.ssl ? {} : undefined,
          } as any),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('MySQL connect timeout')), 8000)),
        ]);

        try {
          await conn.execute('SELECT 1');
          isValid = true;
          message = 'Credential verified successfully';
        } finally {
          await conn.end().catch(() => undefined);
        }
      } catch {
        isValid = false;
        message = 'Failed to verify MySQL connection';
      }
    }

    // Verify Redis connection
    if (appId === 'redis' && decryptedData.url) {
      const client = createRedisClient({
        url: String(decryptedData.url),
        database: decryptedData.database != null ? Number(decryptedData.database) : undefined,
      });
      client.on('error', () => undefined);

      try {
        const connectPromise = client.connect();
        await Promise.race([
          connectPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connect timeout')), 8000)),
        ]);

        const pong = await client.ping();
        isValid = String(pong).toUpperCase() === 'PONG';
        message = isValid ? 'Credential verified successfully' : 'Failed to verify connection';
      } catch {
        isValid = false;
        message = 'Failed to verify Redis connection';
      } finally {
        await client.quit().catch(() => undefined);
      }
    }

    // Verify DynamoDB credentials
    if (appId === 'dynamodb' && decryptedData.accessKeyId && decryptedData.secretAccessKey && decryptedData.region) {
      try {
        const client = new DynamoDBClient({
          region: String(decryptedData.region),
          credentials: {
            accessKeyId: String(decryptedData.accessKeyId),
            secretAccessKey: String(decryptedData.secretAccessKey),
          },
        });

        const verifyPromise = client.send(new ListTablesCommand({ Limit: 1 }));
        await Promise.race([
          verifyPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('DynamoDB verify timeout')), 8000)),
        ]);

        isValid = true;
        message = 'Credential verified successfully';
      } catch {
        isValid = false;
        message = 'Failed to verify AWS credentials';
      }
    }

    // Verify PayPal client credentials (token request)
    if (appId === 'paypal' && decryptedData.clientId && decryptedData.clientSecret) {
      try {
        const env = String(decryptedData.environment || 'sandbox');
        const base = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        const auth = `Basic ${Buffer.from(`${String(decryptedData.clientId)}:${String(decryptedData.clientSecret)}`, 'utf8').toString('base64')}`;
        const response = await fetch(`${base}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            Authorization: auth,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: 'grant_type=client_credentials',
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid credentials: ${text}` : 'Invalid credentials';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify PayPal credentials';
      }
    }

    // Verify WooCommerce REST API credentials
    if (appId === 'woocommerce' && decryptedData.siteUrl && decryptedData.consumerKey && decryptedData.consumerSecret) {
      try {
        const siteUrl = String(decryptedData.siteUrl).trim().replace(/\/+$/, '');
        const url = new URL(`${siteUrl}/wp-json/wc/v3/system_status`);
        url.searchParams.set('consumer_key', String(decryptedData.consumerKey));
        url.searchParams.set('consumer_secret', String(decryptedData.consumerSecret));

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid credentials: ${text}` : 'Invalid credentials';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify WooCommerce credentials';
      }
    }

    // Verify Zoom credentials
    if (appId === 'zoom' && (decryptedData.accessToken || (decryptedData.accountId && decryptedData.clientId && decryptedData.clientSecret))) {
      try {
        let accessToken = decryptedData.accessToken ? String(decryptedData.accessToken) : '';
        if (!accessToken) {
          const auth = `Basic ${Buffer.from(`${String(decryptedData.clientId)}:${String(decryptedData.clientSecret)}`, 'utf8').toString('base64')}`;
          const url = new URL('https://zoom.us/oauth/token');
          url.searchParams.set('grant_type', 'account_credentials');
          url.searchParams.set('account_id', String(decryptedData.accountId));

          const tokenRes = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              Authorization: auth,
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
            body: '',
          });

          if (!tokenRes.ok) {
            const text = await tokenRes.text().catch(() => '');
            isValid = false;
            message = text ? `Invalid credentials: ${text}` : 'Invalid credentials';
          } else {
            const tokenText = await tokenRes.text().catch(() => '');
            const tokenData = tokenText ? JSON.parse(tokenText) : null;
            accessToken = String(tokenData?.access_token || '');
          }
        }

        if (accessToken) {
          const response = await fetch('https://api.zoom.us/v2/users/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
          });

          isValid = response.ok;
          if (isValid) message = 'Credential verified successfully';
          else {
            const text = await response.text().catch(() => '');
            message = text ? `Invalid credentials: ${text}` : 'Invalid credentials';
          }
        }
      } catch {
        isValid = false;
        message = 'Failed to verify Zoom credentials';
      }
    }

    // Verify Google OAuth access token (tokeninfo) for Drive + Calendar
    if ((appId === 'google_drive' || appId === 'google_calendar') && decryptedData.accessToken) {
      try {
        const response = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(String(decryptedData.accessToken))}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );

        isValid = response.ok;
        if (isValid) message = 'Credential verified successfully';
        else {
          const text = await response.text().catch(() => '');
          message = text ? `Invalid access token: ${text}` : 'Invalid access token';
        }
      } catch {
        isValid = false;
        message = 'Failed to verify access token';
      }
    }
    
    // Update validation status
    await storage.updateCredential(req.params.id, {
      isValid,
      lastValidatedAt: new Date(),
    });
    
    res.json({ isValid, message });
  } catch (error: any) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ message: 'Failed to verify credential' });
  }
});

// ========== WORKFLOWS ROUTES ==========

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
  triggerType: z.enum(['webhook', 'schedule', 'manual', 'event']).optional(),
  triggerConfig: z.record(z.any()).optional(),
  cronExpression: z.string().optional(),
  timezone: z.string().optional(),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
  triggerType: z.enum(['webhook', 'schedule', 'manual', 'event']).optional(),
  triggerConfig: z.record(z.any()).optional(),
  cronExpression: z.string().optional(),
  timezone: z.string().optional(),
});

// Get all workflows for user
router.get('/workflows', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflows = await storage.getWorkflowsByUserId(userId);
    res.json({ workflows });
  } catch (error: any) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ message: 'Failed to fetch workflows' });
  }
});

// Get workflow by ID
router.get('/workflows/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(workflow);
  } catch (error: any) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ message: 'Failed to fetch workflow' });
  }
});

// Create workflow
router.post('/workflows', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const data = createWorkflowSchema.parse(req.body);
    
    const workflow = await storage.createWorkflow(userId, {
      name: data.name,
      description: data.description,
      nodes: data.nodes || [],
      connections: data.connections || [],
      triggerType: data.triggerType,
      triggerConfig: data.triggerConfig,
      cronExpression: data.cronExpression,
      timezone: data.timezone || 'UTC',
    });
    
    res.status(201).json(workflow);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating workflow:', error);
    res.status(500).json({ message: 'Failed to create workflow' });
  }
});

// Update workflow
router.patch('/workflows/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const data = updateWorkflowSchema.parse(req.body);
    const updated = await storage.updateWorkflow(req.params.id, data);
    
    res.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating workflow:', error);
    res.status(500).json({ message: 'Failed to update workflow' });
  }
});

// Delete workflow
router.delete('/workflows/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await storage.deleteWorkflow(req.params.id);
    res.json({ message: 'Workflow deleted' });
  } catch (error: any) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ message: 'Failed to delete workflow' });
  }
});

// Activate/deactivate workflow
router.post('/workflows/:id/toggle', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const updated = await storage.updateWorkflow(req.params.id, {
      isActive: !workflow.isActive,
    });
    
    res.json({ isActive: updated?.isActive });
  } catch (error: any) {
    console.error('Error toggling workflow:', error);
    res.status(500).json({ message: 'Failed to toggle workflow' });
  }
});

// Get workflow executions
router.get('/workflows/:id/executions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const limit = parseInt(req.query.limit as string) || 50;
    const executions = await storage.getExecutionsByWorkflowId(req.params.id, limit);
    
    res.json({ executions });
  } catch (error: any) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ message: 'Failed to fetch executions' });
  }
});

// Execute workflow manually
router.post('/workflows/:id/execute', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Create execution record
    const execution = await storage.createExecution({
      workflowId: workflow.id,
      status: 'pending',
      triggerType: 'manual',
      triggerData: req.body.inputData || {},
      startedAt: new Date(),
    });

    const startedAt = Date.now();
    await storage.updateExecution(execution.id, { status: 'running' });

    try {
      const result = await runWorkflow({
        userId,
        workflowId: workflow.id,
        nodes: workflow.nodes || [],
        connections: workflow.connections || [],
        triggerType: 'manual',
        triggerData: req.body.inputData || {},
      });

      const duration = Date.now() - startedAt;
      await storage.updateExecution(execution.id, {
        status: 'success',
        completedAt: new Date(),
        duration,
        outputData: result.outputData,
        nodeExecutions: result.nodeExecutions,
      });

      await storage.updateWorkflow(workflow.id, {
        executionCount: (workflow.executionCount || 0) + 1,
        lastExecutedAt: new Date(),
        lastExecutionStatus: 'success',
      });

      return res.json({
        executionId: execution.id,
        status: 'success',
        outputData: result.outputData,
        nodeExecutions: result.nodeExecutions,
      });
    } catch (error: any) {
      const duration = Date.now() - startedAt;
      await storage.updateExecution(execution.id, {
        status: 'error',
        completedAt: new Date(),
        duration,
        errorMessage: error?.message || 'Workflow execution failed',
        errorStack: error?.stack ? String(error.stack) : undefined,
      });

      await storage.updateWorkflow(workflow.id, {
        executionCount: (workflow.executionCount || 0) + 1,
        lastExecutedAt: new Date(),
        lastExecutionStatus: 'error',
      });

      return res.status(500).json({ message: error?.message || 'Failed to execute workflow' });
    }
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ message: 'Failed to execute workflow' });
  }
});

export default router;
