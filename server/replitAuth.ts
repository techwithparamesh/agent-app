import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
// @ts-ignore - no type declarations available
import MySQLStoreFactory from "express-mysql-session";
import { storage } from "./storage";
import { pool } from "./db";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MySQLStore = MySQLStoreFactory(session);
  const sessionStore = new MySQLStore({
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data"
      }
    }
  }, pool);
  
  const isProduction = process.env.NODE_ENV === "production";
  
  // Session secret MUST be set in environment
  const sessionSecret = process.env.SESSION_SECRET;
  
  if (!sessionSecret) {
    if (isProduction) {
      throw new Error("SESSION_SECRET environment variable is required in production");
    }
    console.warn("[SECURITY WARNING] SESSION_SECRET not set. Using default for development only.");
  }
  
  // Use a stable default for development (not random) to preserve sessions across restarts
  const secret = sessionSecret || "dev-session-secret-change-in-production";
  
  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // Only secure in production (HTTPS)
      sameSite: isProduction ? "strict" : "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Universal logout route (works for both session-based and Replit auth)
  app.get("/api/logout", (req: any, res) => {
    // Destroy session
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
      // Clear cookie and redirect
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });

  // Skip OIDC setup if REPL_ID is not configured
  if (!process.env.REPL_ID) {
    console.log("⚠️  REPL_ID not configured - Replit Auth disabled");
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Check for session-based authentication (local login)
  if ((req as any).session?.userId) {
    // User is logged in via local auth
    const userId = (req as any).session.userId;
    (req as any).user = {
      claims: {
        sub: userId,
      }
    };
    return next();
  }

  // Development mode: bypass authentication if REPL_ID is not set
  if (!process.env.REPL_ID && process.env.NODE_ENV === "development") {
    // Import storage dynamically to avoid circular dependency
    const { storage } = await import("./storage");
    
    // Check if dev user exists in database, create if not
    const DEV_USER_ID = "dev-user-001";
    let devUser = await storage.getUser(DEV_USER_ID);
    
    if (!devUser) {
      // Create the dev user in the database
      console.log("Creating development user in database...");
      devUser = await storage.upsertUser({
        id: DEV_USER_ID,
        email: "dev@example.com",
        firstName: "Development",
        lastName: "User",
        profileImageUrl: "https://ui-avatars.com/api/?name=Dev+User",
      });
      console.log("Development user created:", devUser?.id);
    }
    
    const mockUser = {
      claims: {
        sub: DEV_USER_ID,
        email: "dev@example.com",
        name: "Development User",
        profile_image_url: "https://ui-avatars.com/api/?name=Dev+User"
      },
      access_token: "dev-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };
    (req as any).user = mockUser;
    
    return next();
  }

  // Skip Replit Auth if not configured
  if (!process.env.REPL_ID) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
