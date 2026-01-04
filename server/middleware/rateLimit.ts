/**
 * Simple in-memory rate limiter for protection against brute force attacks.
 * For production with multiple servers, consider using Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (req: any) => string;
  message?: string;
}

/**
 * Creates a rate limiting middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => req.ip || req.socket?.remoteAddress || 'unknown',
    message = 'Too many requests, please try again later.',
  } = options;

  return (req: any, res: any, next: () => void) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));
      
      return res.status(429).json({ 
        message,
        retryAfter,
      });
    }

    entry.count++;
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - entry.count));
    res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetTime / 1000)));
    
    next();
  };
}

function parsePositiveInt(value: unknown): number | undefined {
  const n = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function getAppEnv(): string {
  return String(process.env.APP_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development').toLowerCase();
}

function isStagingEnv(env: string): boolean {
  return ['staging', 'stage', 'preview', 'preprod', 'qa', 'test'].includes(env);
}

function passThroughLimiter() {
  return (_req: any, _res: any, next: () => void) => next();
}

// Pre-configured rate limiters for common use cases

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/**
 * Rate limiter for signup - prevents mass account creation
 * Defaults:
 * - production: 10 signups per hour per IP
 * - staging: 5 signups per hour per IP
 * - development: disabled (avoid blocking local testing)
 *
 * Override via:
 * - SIGNUP_RATE_LIMIT_MAX
 * - SIGNUP_RATE_LIMIT_WINDOW_MS
 */
const appEnv = getAppEnv();
const signupWindowMs = parsePositiveInt(process.env.SIGNUP_RATE_LIMIT_WINDOW_MS) ?? 60 * 60 * 1000;
const signupDefaultMax = appEnv === 'production' ? 10 : (isStagingEnv(appEnv) ? 5 : Number.POSITIVE_INFINITY);
const signupMax = parsePositiveInt(process.env.SIGNUP_RATE_LIMIT_MAX) ?? signupDefaultMax;

export const signupRateLimiter = Number.isFinite(signupMax)
  ? createRateLimiter({
      windowMs: signupWindowMs,
      maxRequests: signupMax,
      message: 'Too many accounts created. Please try again later.',
    })
  : passThroughLimiter();

/**
 * Rate limiter for password reset - prevents email spam
 * 3 requests per hour per IP
 */
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many password reset requests. Please try again later.',
});

/**
 * Rate limiter for verification email resend - prevents email spam
 * 2 requests per 5 minutes per user (fallback to IP)
 */
export const emailVerificationRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 2,
  keyGenerator: (req) => {
    const userId = req?.user?.claims?.sub || req?.session?.userId;
    return userId ? `user:${userId}` : (req.ip || req.socket?.remoteAddress || 'unknown');
  },
  message: 'Too many verification emails requested. Please try again shortly.',
});

/**
 * Rate limiter for API endpoints
 * 100 requests per minute per IP
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many requests. Please slow down.',
});

/**
 * Rate limiter for webhook endpoints
 * 1000 requests per minute (more lenient for legitimate webhooks)
 */
export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000,
  message: 'Webhook rate limit exceeded.',
});
