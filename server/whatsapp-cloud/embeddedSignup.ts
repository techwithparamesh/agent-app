/**
 * WhatsApp Cloud API - Embedded Signup Service
 * 
 * Handles Meta OAuth flow and Embedded Signup for multi-tenant SaaS.
 * Each tenant gets their own WABA and phone number - no sharing.
 * 
 * Flow:
 * 1. Generate signup URL with state containing tenant_id
 * 2. User completes Meta Embedded Signup popup
 * 3. Meta redirects to callback with auth code
 * 4. Exchange code for access token
 * 5. Fetch WABA and phone number details
 * 6. Store encrypted credentials per tenant
 */

import crypto from 'crypto';
import { encrypt, decrypt, generateSecureToken } from '../utils/encryption';
import type {
  MetaOAuthResponse,
  MetaLongLivedTokenResponse,
  WhatsAppBusinessAccountInfo,
  WhatsAppPhoneNumberInfo,
} from './types';

// ========== CONFIGURATION ==========

interface MetaAppConfig {
  appId: string;
  appSecret: string;
  graphApiVersion: string;
  callbackUrl: string;
  webhookVerifyToken: string;
}

function getMetaConfig(): MetaAppConfig {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const callbackUrl = process.env.META_OAUTH_CALLBACK_URL || `${process.env.APP_URL}/api/whatsapp-cloud/oauth/callback`;
  const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || generateSecureToken(32);

  if (!appId || !appSecret) {
    throw new Error('META_APP_ID and META_APP_SECRET must be configured');
  }

  return {
    appId,
    appSecret,
    graphApiVersion: process.env.META_GRAPH_API_VERSION || 'v18.0',
    callbackUrl,
    webhookVerifyToken,
  };
}

// ========== STATE MANAGEMENT ==========

/**
 * OAuth state store - in production, use Redis or database
 * State links OAuth callback to the correct tenant
 */
const pendingOAuthStates = new Map<string, {
  tenantId: string;
  createdAt: Date;
  nonce: string;
}>();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = new Date();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  
  for (const [state, data] of pendingOAuthStates.entries()) {
    if (now.getTime() - data.createdAt.getTime() > maxAge) {
      pendingOAuthStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

// ========== EMBEDDED SIGNUP URL GENERATION ==========

/**
 * Generate the Meta Embedded Signup URL
 * 
 * @param tenantId - The tenant/user ID in your system
 * @param options - Optional configuration
 * @returns Object containing the signup URL and state for verification
 */
export function generateEmbeddedSignupUrl(
  tenantId: string,
  options: {
    extras?: Record<string, string>;
    featureType?: 'only_waba_sharing';
  } = {}
): { url: string; state: string } {
  const config = getMetaConfig();
  
  // Generate cryptographically secure state parameter
  const state = generateSecureToken(32);
  const nonce = generateSecureToken(16);
  
  // Store state for verification in callback
  pendingOAuthStates.set(state, {
    tenantId,
    createdAt: new Date(),
    nonce,
  });

  // Build the OAuth URL
  // Embedded Signup uses the Facebook Login dialog with special config
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.callbackUrl,
    state,
    response_type: 'code',
    scope: [
      'whatsapp_business_management',
      'whatsapp_business_messaging',
    ].join(','),
    // Embedded Signup specific parameters
    config_id: process.env.META_EMBEDDED_SIGNUP_CONFIG_ID || '',
    ...(options.extras || {}),
  });

  const url = `https://www.facebook.com/${config.graphApiVersion}/dialog/oauth?${params.toString()}`;

  return { url, state };
}

/**
 * Generate the embedded signup initialization data for the Facebook SDK
 * This is used when implementing the popup flow with the FB JS SDK
 */
export function getEmbeddedSignupConfig(tenantId: string): {
  appId: string;
  configId: string;
  state: string;
  extras: object;
} {
  const config = getMetaConfig();
  const state = generateSecureToken(32);
  const nonce = generateSecureToken(16);

  pendingOAuthStates.set(state, {
    tenantId,
    createdAt: new Date(),
    nonce,
  });

  return {
    appId: config.appId,
    configId: process.env.META_EMBEDDED_SIGNUP_CONFIG_ID || '',
    state,
    extras: {
      // Feature type for Embedded Signup
      feature: 'whatsapp_embedded_signup',
      sessionInfoVersion: '2',
    },
  };
}

// ========== OAUTH CALLBACK HANDLING ==========

export interface OAuthCallbackResult {
  success: boolean;
  tenantId?: string;
  wabaId?: string;
  phoneNumberId?: string;
  businessName?: string;
  displayPhoneNumber?: string;
  // Token data for storage (caller encrypts before storing)
  accessToken?: string;
  tokenExpiresAt?: Date | null;
  metaBusinessId?: string | null;
  // Error info
  error?: string;
  errorDescription?: string;
}

/**
 * Handle the OAuth callback from Meta
 * Exchanges the auth code for tokens and fetches account details
 */
export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<OAuthCallbackResult> {
  const config = getMetaConfig();

  // 1. Verify state and get tenant
  const stateData = pendingOAuthStates.get(state);
  if (!stateData) {
    return {
      success: false,
      error: 'invalid_state',
      errorDescription: 'OAuth state is invalid or expired',
    };
  }

  // Remove used state immediately
  pendingOAuthStates.delete(state);

  const { tenantId } = stateData;

  try {
    // 2. Exchange code for short-lived token
    const tokenResponse = await exchangeCodeForToken(code, config);
    if (!tokenResponse.access_token) {
      return {
        success: false,
        tenantId,
        error: 'token_exchange_failed',
        errorDescription: 'Failed to exchange authorization code for access token',
      };
    }

    // 3. Exchange for long-lived token (recommended for server-side)
    const longLivedToken = await exchangeForLongLivedToken(
      tokenResponse.access_token,
      config
    );

    // 4. Get shared WABA IDs from the debug endpoint
    const sharedWabas = await getSharedWabaIds(longLivedToken.access_token, config);
    
    if (!sharedWabas || sharedWabas.length === 0) {
      return {
        success: false,
        tenantId,
        error: 'no_waba_shared',
        errorDescription: 'No WhatsApp Business Account was shared during signup',
      };
    }

    // 5. Get WABA details (use first shared WABA)
    const wabaId = sharedWabas[0];
    const wabaInfo = await getWabaDetails(wabaId, longLivedToken.access_token, config);

    // 6. Get phone numbers associated with WABA
    const phoneNumbers = await getWabaPhoneNumbers(wabaId, longLivedToken.access_token, config);
    
    if (!phoneNumbers || phoneNumbers.length === 0) {
      return {
        success: false,
        tenantId,
        wabaId,
        error: 'no_phone_numbers',
        errorDescription: 'No phone numbers found for the WhatsApp Business Account',
      };
    }

    // Use first phone number (customer can add more later)
    const phoneNumber = phoneNumbers[0];

    // 7. Subscribe the app to the WABA for webhooks
    await subscribeAppToWaba(wabaId, longLivedToken.access_token, config);

    // 8. Return success with access token for storage
    // Caller is responsible for encrypting token before storage
    return {
      success: true,
      tenantId,
      wabaId,
      phoneNumberId: phoneNumber.id,
      businessName: wabaInfo.name,
      displayPhoneNumber: phoneNumber.display_phone_number,
      // Include token and metadata for caller to store
      accessToken: longLivedToken.access_token,
      tokenExpiresAt: longLivedToken.expires_in
        ? new Date(Date.now() + longLivedToken.expires_in * 1000)
        : null,
      metaBusinessId: wabaInfo.owner_business_info?.id || null,
    };
  } catch (error: any) {
    console.error('[Embedded Signup] OAuth callback error:', error);
    return {
      success: false,
      tenantId,
      error: 'oauth_error',
      errorDescription: error.message || 'An error occurred during OAuth',
    };
  }
}

// ========== META API CALLS ==========

async function exchangeCodeForToken(
  code: string,
  config: MetaAppConfig
): Promise<MetaOAuthResponse> {
  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.callbackUrl,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/${config.graphApiVersion}/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function exchangeForLongLivedToken(
  shortLivedToken: string,
  config: MetaAppConfig
): Promise<MetaLongLivedTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/${config.graphApiVersion}/oauth/access_token?${params.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Long-lived token exchange failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Get WABA IDs shared during Embedded Signup
 * Uses the debug_token endpoint to find granular scopes/shared WABAs
 */
async function getSharedWabaIds(
  accessToken: string,
  config: MetaAppConfig
): Promise<string[]> {
  const wabaIds: string[] = [];

  // Method 1: Try debug_token endpoint to get shared WABAs from granular scopes
  try {
    const debugResponse = await fetch(
      `https://graph.facebook.com/${config.graphApiVersion}/debug_token?input_token=${accessToken}&access_token=${config.appId}|${config.appSecret}`
    );

    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      const granularScopes = debugData.data?.granular_scopes || [];
      
      // Look for whatsapp_business_management scope which contains WABA IDs
      for (const scope of granularScopes) {
        if (scope.scope === 'whatsapp_business_management' && scope.target_ids) {
          wabaIds.push(...scope.target_ids);
        }
      }

      if (wabaIds.length > 0) {
        console.log('[Embedded Signup] Found WABAs from debug_token:', wabaIds);
        return wabaIds;
      }
    }
  } catch (e) {
    console.log('[Embedded Signup] debug_token method failed, trying alternatives');
  }

  // Method 2: Try to get WABAs via the shared_waba_ids endpoint
  try {
    const sharedResponse = await fetch(
      `https://graph.facebook.com/${config.graphApiVersion}/me?fields=id,name&access_token=${accessToken}`
    );

    if (sharedResponse.ok) {
      const userData = await sharedResponse.json();
      console.log('[Embedded Signup] User data:', userData);
      
      // Try to get WABAs the user has access to via the token
      const wabaResponse = await fetch(
        `https://graph.facebook.com/${config.graphApiVersion}/me/whatsapp_business_accounts?access_token=${accessToken}`
      );

      if (wabaResponse.ok) {
        const wabaData = await wabaResponse.json();
        for (const waba of wabaData.data || []) {
          wabaIds.push(waba.id);
        }
        if (wabaIds.length > 0) {
          console.log('[Embedded Signup] Found WABAs from /me/whatsapp_business_accounts:', wabaIds);
          return wabaIds;
        }
      }
    }
  } catch (e) {
    console.log('[Embedded Signup] /me endpoint method failed');
  }

  // Method 3: For Embedded Signup, check if WABA was passed in the OAuth response
  // The WABA ID might be in token's associated data
  console.log('[Embedded Signup] No WABAs found through standard methods');
  return wabaIds;
}

async function getWabaDetails(
  wabaId: string,
  accessToken: string,
  config: MetaAppConfig
): Promise<WhatsAppBusinessAccountInfo> {
  const response = await fetch(
    `https://graph.facebook.com/${config.graphApiVersion}/${wabaId}?` +
    `fields=id,name,currency,timezone_id,message_template_namespace,account_review_status,business_verification_status,on_behalf_of_business_info&` +
    `access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get WABA details: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function getWabaPhoneNumbers(
  wabaId: string,
  accessToken: string,
  config: MetaAppConfig
): Promise<WhatsAppPhoneNumberInfo[]> {
  const response = await fetch(
    `https://graph.facebook.com/${config.graphApiVersion}/${wabaId}/phone_numbers?` +
    `fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type,throughput,name_status&` +
    `access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get phone numbers: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.data || [];
}

async function subscribeAppToWaba(
  wabaId: string,
  accessToken: string,
  config: MetaAppConfig
): Promise<void> {
  const response = await fetch(
    `https://graph.facebook.com/${config.graphApiVersion}/${wabaId}/subscribed_apps`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.warn(`[Embedded Signup] Failed to subscribe app to WABA: ${JSON.stringify(error)}`);
    // Don't throw - this might fail if already subscribed
  }
}

// ========== SYSTEM USER TOKEN GENERATION ==========

/**
 * Generate a system user token for long-term API access
 * This is the recommended approach for server-to-server communication
 * 
 * Note: This requires creating a system user in Meta Business Manager first
 */
export async function generateSystemUserToken(
  businessId: string,
  systemUserId: string,
  accessToken: string
): Promise<string> {
  const config = getMetaConfig();
  
  const response = await fetch(
    `https://graph.facebook.com/${config.graphApiVersion}/${systemUserId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_app: config.appId,
        scope: 'whatsapp_business_management,whatsapp_business_messaging',
        access_token: accessToken,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to generate system user token: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.access_token;
}

// ========== PERMISSION VERIFICATION ==========

/**
 * Verify that the access token has the required permissions
 */
export async function verifyTokenPermissions(accessToken: string): Promise<{
  valid: boolean;
  permissions: string[];
  expiresAt?: Date;
}> {
  const config = getMetaConfig();

  const response = await fetch(
    `https://graph.facebook.com/debug_token?` +
    `input_token=${accessToken}&` +
    `access_token=${config.appId}|${config.appSecret}`
  );

  if (!response.ok) {
    return { valid: false, permissions: [] };
  }

  const data = await response.json();
  const tokenData = data.data;

  if (!tokenData.is_valid) {
    return { valid: false, permissions: [] };
  }

  return {
    valid: true,
    permissions: tokenData.scopes || [],
    expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : undefined,
  };
}

/**
 * Refresh an expiring token before it expires
 */
export async function refreshTokenIfNeeded(
  encryptedToken: string,
  expiresAt: Date | null
): Promise<{ token: string; newExpiresAt?: Date } | null> {
  // If no expiration or more than 7 days left, no refresh needed
  if (!expiresAt) return null;
  
  const daysUntilExpiry = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiry > 7) return null;

  const config = getMetaConfig();
  const currentToken = decrypt(encryptedToken);

  try {
    const newTokenData = await exchangeForLongLivedToken(currentToken, config);
    
    return {
      token: encrypt(newTokenData.access_token),
      newExpiresAt: new Date(Date.now() + newTokenData.expires_in * 1000),
    };
  } catch (error) {
    console.error('[Embedded Signup] Token refresh failed:', error);
    return null;
  }
}

// ========== PUBLIC WABA DATA ACCESSORS ==========

/**
 * Fetch phone numbers for a WABA
 * @param wabaId - WhatsApp Business Account ID
 * @param accessToken - Valid access token
 */
export async function fetchWabaPhoneNumbers(
  wabaId: string,
  accessToken: string
): Promise<WhatsAppPhoneNumberInfo[]> {
  const config = getMetaConfig();
  return getWabaPhoneNumbers(wabaId, accessToken, config);
}

/**
 * Fetch WABA details
 * @param wabaId - WhatsApp Business Account ID
 * @param accessToken - Valid access token
 */
export async function fetchWabaDetails(
  wabaId: string,
  accessToken: string
): Promise<WhatsAppBusinessAccountInfo | null> {
  const config = getMetaConfig();
  return getWabaDetails(wabaId, accessToken, config);
}
