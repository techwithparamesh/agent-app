/**
 * Server Configuration
 * 
 * Centralized configuration for the server.
 * Uses environment variables with sensible defaults.
 */

// Application
export const APP_CONFIG = {
  port: parseInt(process.env.PORT || '5008', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 5008}`,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
};

// Plan Limits - can be overridden via environment
export const PLAN_LIMITS = {
  free: {
    messages: parseInt(process.env.FREE_PLAN_MESSAGES || '20', 10),
    landingPages: parseInt(process.env.FREE_PLAN_PAGES || '1', 10),
    agents: parseInt(process.env.FREE_PLAN_AGENTS || '1', 10),
  },
  starter: {
    messages: parseInt(process.env.STARTER_PLAN_MESSAGES || '500', 10),
    landingPages: parseInt(process.env.STARTER_PLAN_PAGES || '5', 10),
    agents: parseInt(process.env.STARTER_PLAN_AGENTS || '3', 10),
  },
  pro: {
    messages: parseInt(process.env.PRO_PLAN_MESSAGES || '2000', 10),
    landingPages: parseInt(process.env.PRO_PLAN_PAGES || '20', 10),
    agents: parseInt(process.env.PRO_PLAN_AGENTS || '10', 10),
  },
  enterprise: {
    messages: parseInt(process.env.ENTERPRISE_PLAN_MESSAGES || '10000', 10),
    landingPages: parseInt(process.env.ENTERPRISE_PLAN_PAGES || '100', 10),
    agents: parseInt(process.env.ENTERPRISE_PLAN_AGENTS || '50', 10),
  },
};

// Get plan limits helper
export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
}

// AI Configuration
export const AI_CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  defaultModel: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096', 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
};

// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  baseUrl: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v18.0'}`,
};

// 360Dialog BSP Configuration
export const DIALOG360_CONFIG = {
  partnerId: process.env.DIALOG360_PARTNER_ID || '',
  apiKey: process.env.DIALOG360_API_KEY || '',
  apiUrl: process.env.DIALOG360_API_URL || 'https://waba.360dialog.io',
};

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  isConfigured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
};

// Puppeteer / Scanner Configuration
export const SCANNER_CONFIG = {
  maxPages: parseInt(process.env.SCANNER_MAX_PAGES || '100', 10),
  timeout: parseInt(process.env.SCANNER_TIMEOUT || '30000', 10),
  chromePath: process.env.CHROME_PATH || undefined, // Let puppeteer auto-detect
  userAgent: process.env.SCANNER_USER_AGENT || 'Mozilla/5.0 (compatible; AgentForgeBot/1.0)',
};

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

// Validate configuration on startup
export function validateConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required in production
  if (APP_CONFIG.isProduction) {
    if (!process.env.DATABASE_URL) errors.push('DATABASE_URL');
    if (!process.env.SESSION_SECRET) errors.push('SESSION_SECRET');
  }
  
  // Recommended
  if (!AI_CONFIG.anthropicApiKey) {
    warnings.push('ANTHROPIC_API_KEY not set - AI features disabled');
  }
  if (!STRIPE_CONFIG.isConfigured) {
    warnings.push('Stripe not configured - billing features disabled');
  }
  if (!DIALOG360_CONFIG.apiKey) {
    warnings.push('360Dialog not configured - BSP features disabled');
  }
  
  return { errors, warnings, isValid: errors.length === 0 };
}

export default {
  APP_CONFIG,
  PLAN_LIMITS,
  AI_CONFIG,
  WHATSAPP_CONFIG,
  DIALOG360_CONFIG,
  GOOGLE_CONFIG,
  STRIPE_CONFIG,
  SCANNER_CONFIG,
  RATE_LIMIT_CONFIG,
  getPlanLimits,
  validateConfig,
};
