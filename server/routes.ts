import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAgentSchema, insertKnowledgeBaseSchema, insertGeneratedPageSchema, type KnowledgeBase } from "@shared/schema";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import bcrypt from "bcryptjs";
import puppeteer from "puppeteer";
import whatsappRoutes from "./whatsapp/routes";
import bspRoutes from "./bsp/routes";
import billingRoutes from "./billing/routes";
import { integrationRoutes } from "./integrations/routes";
import { stripeService } from "./billing/stripe";
import express from "express";

// Schema for updating agents - only allow safe fields
const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  websiteUrl: z.string().url().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  systemPrompt: z.string().max(5000).optional().nullable(),
  toneOfVoice: z.string().max(100).optional().nullable(),
  purpose: z.string().max(50).optional().nullable(),
  welcomeMessage: z.string().max(500).optional().nullable(),
  suggestedQuestions: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
  // Widget customization
  widgetConfig: z.object({
    displayName: z.string().max(100).optional().nullable(),
    primaryColor: z.string().max(20).optional().nullable(),
    position: z.string().max(20).optional().nullable(),
    avatarUrl: z.string().optional().nullable(),
    showBranding: z.boolean().optional().nullable(),
    autoOpen: z.boolean().optional().nullable(),
    responseFormat: z.string().optional().nullable(),
  }).optional().nullable(),
});

// Auth schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth middleware
  await setupAuth(app);

  // ========== WHATSAPP WEBHOOK ROUTES ==========
  // Mount WhatsApp routes (before auth middleware for webhook verification)
  app.use("/api/whatsapp", whatsappRoutes);

  // ========== STRIPE WEBHOOK (raw body needed) ==========
  app.post("/api/billing/webhook", 
    express.raw({ type: 'application/json' }), 
    async (req: any, res) => {
      try {
        const signature = req.headers['stripe-signature'] as string;
        await stripeService.handleWebhook(req.body, signature);
        res.sendStatus(200);
      } catch (error: any) {
        console.error('[Stripe Webhook] Error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    }
  );

  // ========== BSP/SAAS ROUTES ==========
  // Mount BSP routes for WhatsApp Business Account management
  app.use("/api/bsp", isAuthenticated, bspRoutes);

  // ========== PUBLIC BILLING ROUTES ==========
  // Plans endpoint is public (for pricing page)
  app.get("/api/billing/plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json({ plans });
    } catch (error: any) {
      console.error('[Billing] Plans error:', error);
      res.status(500).json({ message: 'Failed to fetch plans' });
    }
  });

  // ========== BILLING ROUTES ==========
  // Mount billing routes for subscription management (authenticated)
  app.use("/api/billing", isAuthenticated, billingRoutes);

  // ========== INTEGRATION ROUTES ==========
  // Mount integration routes for Google Sheets, Webhooks, etc.
  app.use("/api/integrations", isAuthenticated, integrationRoutes);

  // ========== AUTH ROUTES ==========
  
  // Signup route
  app.post("/api/auth/signup", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        profileImageUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
      });
      
      // Set session and save it
      req.session.userId = user.id;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
        }
        // Return user without password
        const { password: _, ...userWithoutPassword } = user as any;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login route
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, (user as any).password || "");
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set session and save it
      req.session.userId = user.id;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
        }
        // Return user without password
        const { password: _, ...userWithoutPassword } = user as any;
        return res.json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Return user without password
      const { password: _, ...userWithoutPassword } = user as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user usage stats
  app.get("/api/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getUserUsage(userId);
      if (!usage) {
        return res.status(404).json({ message: "Usage data not found" });
      }
      res.json(usage);
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // Get dashboard stats (conversations, visitors, etc.)
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // ========== AGENTS ==========
  app.get("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agents = await storage.getAgentsByUserId(userId);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentById(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      if (agent.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Creating agent for user:", userId);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      const validated = insertAgentSchema.parse(req.body);
      console.log("Validated data:", JSON.stringify(validated, null, 2));
      const agent = await storage.createAgent(userId, validated);
      console.log("Agent created:", JSON.stringify(agent, null, 2));
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating agent:", error);
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.patch("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentById(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      if (agent.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      // Validate update payload - only allow safe fields
      const validated = updateAgentSchema.parse(req.body);
      const updated = await storage.updateAgent(req.params.id, validated);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors));
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating agent:", error);
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  app.delete("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentById(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      if (agent.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteAgent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // ========== CONVERSATIONS ==========
  // Get all conversations for user (optionally filtered by agent)
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agentId = req.query.agentId as string | undefined;
      const conversations = await storage.getConversationsByUserId(userId, agentId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get messages for a specific conversation
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversation = await storage.getConversationById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      // Verify user owns the agent
      const agent = await storage.getAgentById(conversation.agentId);
      if (!agent || agent.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const messages = await storage.getMessagesByConversationId(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Delete a specific conversation
  app.delete("/api/conversations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversation = await storage.getConversationById(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      // Verify user owns the agent
      const agent = await storage.getAgentById(conversation.agentId);
      if (!agent || agent.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteConversation(req.params.id);
      res.json({ success: true, message: "Conversation deleted" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Delete all conversations for an agent
  app.delete("/api/conversations/agent/:agentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agent = await storage.getAgentById(req.params.agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      if (agent.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const deletedCount = await storage.deleteConversationsByAgentId(req.params.agentId);
      res.json({ success: true, message: `Deleted ${deletedCount} conversations` });
    } catch (error) {
      console.error("Error deleting conversations:", error);
      res.status(500).json({ message: "Failed to delete conversations" });
    }
  });

  // ========== KNOWLEDGE BASE ==========
  app.get("/api/agents/:agentId/knowledge", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentById(req.params.agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      if (agent.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const entries = await storage.getKnowledgeByAgentId(req.params.agentId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base" });
    }
  });

  app.delete("/api/knowledge/:id", isAuthenticated, async (req: any, res) => {
    try {
      const entry = await storage.getKnowledgeById(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      const agent = await storage.getAgentById(entry.agentId);
      if (!agent || agent.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteKnowledgeEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knowledge entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // ========== WEBSITE SCANNER WITH SSE PROGRESS ==========
  
  // SSE endpoint for real-time scan progress
  app.get("/api/scan/stream", isAuthenticated, async (req: any, res) => {
    const { agentId, url, rescan, additionalUrls: additionalUrlsParam } = req.query;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();
    
    // Helper to send SSE message with immediate flush
    const sendProgress = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      // Force flush to prevent buffering
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    };
    
    try {
      if (!agentId || !url) {
        sendProgress({ type: 'error', message: 'Agent ID and URL are required' });
        res.end();
        return;
      }
      
      const agent = await storage.getAgentById(agentId as string);
      if (!agent) {
        sendProgress({ type: 'error', message: 'Agent not found' });
        res.end();
        return;
      }
      if (agent.userId !== req.user.claims.sub) {
        sendProgress({ type: 'error', message: 'Forbidden' });
        res.end();
        return;
      }
      
      // Update agent scan status to scanning
      await storage.updateAgent(agentId as string, {
        scanStatus: 'scanning',
        scanProgress: 2,
        scanMessage: 'Starting scan...',
      });
      
      sendProgress({ type: 'status', message: 'Starting scan...', progress: 2 });
      
      // If rescan is true, delete all existing knowledge entries
      let deletedEntries = 0;
      if (rescan === 'true') {
        deletedEntries = await storage.deleteAllKnowledgeByAgentId(agentId as string);
        sendProgress({ type: 'status', message: `Cleared ${deletedEntries} old entries`, progress: 5 });
      }
      
      // Parse additional URLs from query param
      let additionalUrls: string[] = [];
      if (additionalUrlsParam) {
        try {
          additionalUrls = JSON.parse(additionalUrlsParam as string);
        } catch (e) {}
      }

      // Normalize URL - add https:// if missing
      let normalizedUrl = (url as string).trim();
      if (!normalizedUrl.match(/^https?:\/\//i)) {
        // Remove www. prefix if present to avoid https://www.www.
        normalizedUrl = normalizedUrl.replace(/^www\./i, '');
        normalizedUrl = 'https://' + normalizedUrl;
      }
      console.log(`Normalized URL: ${url} -> ${normalizedUrl}`);

      // Parse the base URL to get the domain
      let baseUrl: URL;
      try {
        baseUrl = new URL(normalizedUrl);
      } catch (e) {
        sendProgress({ type: 'error', message: 'Invalid URL format. Please enter a valid website address.' });
        res.end();
        return;
      }
      const baseDomain = baseUrl.origin;
      
      // Track visited URLs and pages to scan
      const visitedUrls = new Set<string>();
      const urlsToScan: string[] = [normalizedUrl];
      
      // Add any additional URLs provided by the user
      for (const additionalUrl of additionalUrls) {
        if (additionalUrl && typeof additionalUrl === 'string') {
          try {
            let fullUrl = additionalUrl.trim();
            // Normalize additional URL too
            if (!fullUrl.match(/^https?:\/\//i)) {
              if (fullUrl.startsWith('/')) {
                // Relative path
                fullUrl = new URL(fullUrl, baseDomain).href;
              } else {
                // Domain without protocol
                fullUrl = 'https://' + fullUrl.replace(/^www\./i, '');
              }
            }
            if (!urlsToScan.includes(fullUrl)) {
              urlsToScan.push(fullUrl);
            }
          } catch (e) {}
        }
      }
      
      // ========== PUPPETEER BROWSER FOR UNIVERSAL SCANNING ==========
      // ALWAYS use Puppeteer by default for maximum compatibility
      // This ensures we can scan ANY website: React, Vue, Angular, WordPress, Shopify, etc.
      let browser: any = null;
      let usePuppeteer = true; // DEFAULT TO TRUE - scan everything with JS rendering
      let puppeteerAvailable = true; // Track if Puppeteer can be used
      
      // Helper function to fetch page with Puppeteer (for SPAs)
      const fetchWithPuppeteer = async (pageUrl: string): Promise<{ html: string; links: string[]; textContent: string }> => {
        if (!puppeteerAvailable) {
          throw new Error('Puppeteer not available');
        }
        
        if (!browser) {
          try {
            // Use the verified Chrome path directly
            const executablePath = '/root/.cache/puppeteer/chrome/linux-143.0.7499.42/chrome-linux64/chrome';
            
            // Check if it exists, fall back to auto-detection if not
            const fs = await import('fs');
            const chromePath = fs.existsSync(executablePath) ? executablePath : undefined;
            
            if (chromePath) {
              console.log(`Using Chrome at: ${chromePath}`);
            } else {
              console.log('Chrome not found at expected path, using auto-detection');
            }
            
            // Puppeteer launch options optimized for Linux VPS as root with stealth
            const launchOptions: any = {
              headless: 'new',
              executablePath: chromePath,
              ignoreHTTPSErrors: true,
              args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--disable-background-networking',
                '--disable-default-apps',
                '--disable-extensions',
                '--disable-sync',
                '--disable-translate',
                '--metrics-recording-only',
                '--mute-audio',
                '--safebrowsing-disable-auto-update',
                '--window-size=1920,1080',
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--enable-features=NetworkService,NetworkServiceInProcess',
              ]
            };
            
            browser = await puppeteer.launch(launchOptions);
            console.log('Puppeteer browser launched successfully');
            sendProgress({ type: 'status', message: 'Browser launched for JavaScript rendering', progress: 10 });
          } catch (e: any) {
            console.error('Failed to launch Puppeteer:', e.message);
            puppeteerAvailable = false;
            sendProgress({ type: 'status', message: 'Puppeteer unavailable, using standard fetch', progress: 10 });
            throw e;
          }
        }
        
        let page;
        try {
          page = await browser.newPage();
          console.log(`Page created for: ${pageUrl}`);
        } catch (pageErr: any) {
          console.error(`Failed to create page: ${pageErr.message}`);
          throw pageErr;
        }
        
        // Set viewport and user agent to look like a real browser
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Set extra HTTP headers to look more like a real browser
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        });
        
        // Comprehensive anti-detection settings
        await page.evaluateOnNewDocument(`
          // Override webdriver detection
          Object.defineProperty(navigator, 'webdriver', { get: () => false });
          
          // Chrome runtime
          window.chrome = { runtime: {}, loadTimes: function(){}, csi: function(){} };
          
          // Override permissions
          const originalQuery = window.navigator.permissions.query;
          window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
              Promise.resolve({ state: Notification.permission }) :
              originalQuery(parameters)
          );
          
          // Override plugins to look like real browser
          Object.defineProperty(navigator, 'plugins', {
            get: () => [
              { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
              { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
              { name: 'Native Client', filename: 'internal-nacl-plugin' }
            ]
          });
          
          // Override languages
          Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
          
          // Override platform
          Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
          
          // Override hardware concurrency
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
          
          // Override device memory
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
          
          // Fix iframe contentWindow
          const originalContentWindow = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
          Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
            get: function() {
              const win = originalContentWindow.get.call(this);
              if (win) {
                Object.defineProperty(win.navigator, 'webdriver', { get: () => false });
              }
              return win;
            }
          });
        `);
        
        try {
          console.log(`Navigating to: ${pageUrl}`);
          await page.goto(pageUrl, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
          });
          console.log(`Navigation completed: ${pageUrl}`);
          
          // Wait for JavaScript to render content (longer for heavy SPAs like Flipkart)
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Scroll multiple times to trigger lazy loading
          await page.evaluate(`window.scrollTo(0, 500)`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await page.evaluate(`window.scrollTo(0, 1500)`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await page.evaluate(`window.scrollTo(0, 3000)`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await page.evaluate(`window.scrollTo(0, 0)`); // Scroll back to top
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const html = await page.content();
          
          // Extract text content directly from the rendered DOM
          // Using a string function to avoid esbuild's __name injection
          const textContent = await page.evaluate(`
            (function() {
              // Remove ONLY script/style tags, keep navigation for link discovery
              var unwanted = document.querySelectorAll('script, style, noscript, iframe, svg, path');
              unwanted.forEach(function(el) { el.remove(); });
              
              // Simple text extraction - get ALL visible text
              function getAllText(element) {
                var text = '';
                
                // Skip if element is not visible
                try {
                  var style = window.getComputedStyle(element);
                  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    return '';
                  }
                } catch(e) {}
                
                // Get direct text nodes
                for (var i = 0; i < element.childNodes.length; i++) {
                  var node = element.childNodes[i];
                  if (node.nodeType === 3) { // Text node
                    var nodeText = (node.textContent || '').trim();
                    if (nodeText.length > 0) {
                      text += nodeText + ' ';
                    }
                  } else if (node.nodeType === 1) { // Element node
                    text += getAllText(node);
                  }
                }
                
                return text;
              }
              
              // Get meta description
              var metaEl = document.querySelector('meta[name="description"]');
              var metaDesc = metaEl ? (metaEl.getAttribute('content') || '') : '';
              
              // Get OG description as fallback
              var ogEl = document.querySelector('meta[property="og:description"]');
              var ogDesc = ogEl ? (ogEl.getAttribute('content') || '') : '';
              
              // Get main content areas - try multiple selectors
              var mainSelectors = ['main', '[role="main"]', '#main', '#content', '.main', '.content', 'article', '.container', '#root', '#app'];
              var main = null;
              for (var i = 0; i < mainSelectors.length; i++) {
                main = document.querySelector(mainSelectors[i]);
                if (main) break;
              }
              
              var content = '';
              if (main) {
                content = getAllText(main);
              }
              
              // If main content is too short, get from body
              if (content.length < 100) {
                content = getAllText(document.body);
              }
              
              // Get all headings
              var headings = [];
              document.querySelectorAll('h1, h2, h3, h4, h5').forEach(function(h) {
                var hText = (h.textContent || '').trim();
                if (hText && hText.length > 2 && hText.length < 300) {
                  headings.push(hText);
                }
              });
              
              // Get all links text (useful for navigation/category pages)
              var linkTexts = [];
              document.querySelectorAll('a').forEach(function(a) {
                var aText = (a.textContent || '').trim();
                if (aText && aText.length > 3 && aText.length < 100) {
                  linkTexts.push(aText);
                }
              });
              
              var fullText = '';
              if (metaDesc) fullText += metaDesc + '. ';
              if (ogDesc && ogDesc !== metaDesc) fullText += ogDesc + '. ';
              if (headings.length > 0) fullText += 'Sections: ' + headings.slice(0, 15).join(', ') + '. ';
              fullText += content;
              
              // ========== UNIVERSAL LINK EXTRACTION ==========
              // Extract ALL links with their text - works for ANY website
              var allLinksWithText = [];
              
              document.querySelectorAll('a[href]').forEach(function(a) {
                var href = a.getAttribute('href');
                var text = (a.textContent || '').trim().replace(/\\s+/g, ' ');
                
                // Skip empty, javascript, mailto, tel links
                if (!href || href.startsWith('#') || href.startsWith('javascript:') || 
                    href.startsWith('mailto:') || href.startsWith('tel:')) return;
                
                // Build absolute URL
                var absoluteUrl = '';
                try {
                  if (href.startsWith('http')) {
                    absoluteUrl = href;
                  } else {
                    absoluteUrl = new URL(href, window.location.origin).href;
                  }
                } catch(e) { return; }
                
                // Get meaningful text - try multiple sources
                if (!text || text.length < 3) {
                  text = a.getAttribute('title') || a.getAttribute('aria-label') || '';
                }
                if (!text || text.length < 3) {
                  var img = a.querySelector('img');
                  if (img) text = img.getAttribute('alt') || '';
                }
                
                // Only include if we have meaningful text
                if (text && text.length >= 3 && text.length < 200) {
                  allLinksWithText.push(text + ' | URL: ' + absoluteUrl);
                }
              });
              
              // ========== UNIVERSAL ITEM/PRODUCT EXTRACTION ==========
              // Look for any card-like containers with links and prices
              var itemsWithDetails = [];
              
              // Generic selectors that work across most sites
              var cardSelectors = [
                '[class*="card"]', '[class*="item"]', '[class*="product"]',
                '[class*="listing"]', '[class*="result"]', '[class*="tile"]',
                '[class*="box"]', 'article', '[role="listitem"]',
                'li > a', '.grid > div', '[class*="col"] > div'
              ];
              
              document.querySelectorAll(cardSelectors.join(', ')).forEach(function(el) {
                var link = el.querySelector('a[href]') || (el.tagName === 'A' ? el : null) || el.closest('a');
                if (!link) return;
                
                var href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
                
                // Get title from various sources
                var title = '';
                var titleSources = ['h1', 'h2', 'h3', 'h4', '[class*="title"]', '[class*="name"]', 
                                   '[class*="brand"]', '[class*="heading"]', 'strong', 'b'];
                for (var i = 0; i < titleSources.length; i++) {
                  var titleEl = el.querySelector(titleSources[i]);
                  if (titleEl) {
                    title = (titleEl.textContent || '').trim();
                    if (title.length >= 3) break;
                  }
                }
                if (!title) title = (link.textContent || '').trim().substring(0, 100);
                
                // Get price if available
                var price = '';
                var priceEl = el.querySelector('[class*="price"], [class*="cost"], [class*="amount"]');
                if (priceEl) {
                  price = (priceEl.textContent || '').trim();
                  // Validate it looks like a price
                  if (!price.match(/[₹$€£¥]|\\d/)) price = '';
                }
                
                // Build absolute URL
                var absoluteUrl = '';
                try {
                  absoluteUrl = href.startsWith('http') ? href : new URL(href, window.location.origin).href;
                } catch(e) { return; }
                
                if (title && title.length >= 3 && title.length < 300) {
                  var itemInfo = title;
                  if (price) itemInfo += ' - ' + price;
                  itemInfo += ' | URL: ' + absoluteUrl;
                  itemsWithDetails.push(itemInfo);
                }
              });
              
              // Add items/products to output
              if (itemsWithDetails.length > 0) {
                var uniqueItems = itemsWithDetails.filter(function(v, i, a) { return a.indexOf(v) === i; }).slice(0, 25);
                fullText += ' ITEMS: ' + uniqueItems.join(' || ') + '.';
              }
              
              // Add all other links for reference
              if (allLinksWithText.length > 0) {
                var uniqueLinks = allLinksWithText.filter(function(v, i, a) { return a.indexOf(v) === i; }).slice(0, 30);
                fullText += ' LINKS: ' + uniqueLinks.join(' || ') + '.';
              }
              
              // Clean up excessive whitespace
              return fullText.replace(/\\s+/g, ' ').trim();
            })()
          `);
          
          const links = await page.evaluate(`
            (function() {
              var baseDomainArg = "${baseDomain}";
              var anchors = document.querySelectorAll('a[href]');
              var foundLinks = [];
              var productLinks = [];
              
              anchors.forEach(function(a) {
                var href = a.getAttribute('href');
                if (href && href.indexOf('#') !== 0 && href.indexOf('javascript:') !== 0 && 
                    href.indexOf('mailto:') !== 0 && href.indexOf('tel:') !== 0) {
                  try {
                    var absoluteUrl = new URL(href, window.location.origin);
                    if (absoluteUrl.origin === baseDomainArg) {
                      var urlPath = absoluteUrl.pathname.toLowerCase();
                      
                      // Prioritize product/category links for e-commerce
                      if (urlPath.includes('/product') || urlPath.includes('/dp/') || 
                          urlPath.includes('/item') || urlPath.includes('/p/') ||
                          urlPath.includes('/collection') || urlPath.includes('/category') ||
                          urlPath.includes('/shop') || urlPath.includes('/gp/')) {
                        productLinks.push(absoluteUrl.href);
                      } else {
                        foundLinks.push(absoluteUrl.href);
                      }
                    }
                  } catch (e) {}
                }
              });
              
              // Return product links first, then other links (all unique)
              var allLinks = productLinks.concat(foundLinks);
              return allLinks.filter(function(v, i, a) { return a.indexOf(v) === i; });
            })()
          `);
          
          await page.close();
          console.log(`Page closed after success: ${pageUrl}`);
          return { html, links, textContent };
        } catch (e: any) {
          console.error(`Navigation/content error for ${pageUrl}: ${e.message}`);
          await page.close();
          throw e;
        }
      };
      
      // Helper functions (same as original endpoint)
      const discoverFromSitemap = async (): Promise<string[]> => {
        const urls: string[] = [];
        const sitemapUrls = [
          `${baseDomain}/sitemap.xml`,
          `${baseDomain}/sitemap_index.xml`,
          `${baseDomain}/sitemap/sitemap.xml`,
        ];
        
        for (const sitemapUrl of sitemapUrls) {
          try {
            const response = await fetch(sitemapUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(10000)
            });
            if (response.ok) {
              const xml = await response.text();
              const urlMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
              for (const match of urlMatches) {
                const pageUrl = match[1].trim();
                if (pageUrl.startsWith('http') && !pageUrl.endsWith('.xml')) {
                  urls.push(pageUrl);
                }
              }
              if (urls.length > 0) break;
            }
          } catch (e) {}
        }
        return urls;
      };
      
      // Simple website type detection - just for logging, we use Puppeteer for everything
      const detectWebsiteType = (html: string): { type: string; needsJS: boolean } => {
        const lowerHtml = html.toLowerCase();
        
        // Check for common frameworks/platforms (for logging only)
        if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) {
          return { type: 'wordpress', needsJS: true };
        }
        if (lowerHtml.includes('shopify') || lowerHtml.includes('cdn.shopify')) {
          return { type: 'shopify', needsJS: true };
        }
        if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixsite')) {
          return { type: 'wix', needsJS: true };
        }
        if (lowerHtml.includes('squarespace')) {
          return { type: 'squarespace', needsJS: true };
        }
        if (html.includes('__next') || html.includes('_next/')) {
          return { type: 'nextjs', needsJS: true };
        }
        if (html.includes('__nuxt') || html.includes('nuxt')) {
          return { type: 'nuxtjs', needsJS: true };
        }
        if (html.includes('@vite') || html.includes('react')) {
          return { type: 'react', needsJS: true };
        }
        if (html.includes('ng-version') || html.includes('angular')) {
          return { type: 'angular', needsJS: true };
        }
        if (html.includes('vue')) {
          return { type: 'vue', needsJS: true };
        }
        
        // Check if content is sparse (likely needs JS)
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
          const cleanBody = bodyMatch[1]
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
          if (cleanBody.length < 500) {
            return { type: 'spa-detected', needsJS: true };
          }
        }
        
        // Default - treat as dynamic, use Puppeteer anyway for best results
        return { type: 'website', needsJS: true };
      };
      
      // Universal route discovery - extract only REAL links from HTML, no guessing
      const getCommonRoutes = (html: string, baseUrl: string): string[] => {
        const routes: string[] = [];
        const baseDomainUrl = new URL(baseUrl).origin;
        
        // Extract ALL internal links from the HTML - both relative and absolute
        const linkMatches = html.matchAll(/href=["']([^"']+)["']/gi);
        for (const match of linkMatches) {
          let href = match[1].trim();
          
          // Skip non-navigable links
          if (href.startsWith('#') || href.startsWith('javascript:') || 
              href.startsWith('mailto:') || href.startsWith('tel:') ||
              href.startsWith('data:')) {
            continue;
          }
          
          try {
            // Convert to absolute URL
            const absoluteUrl = new URL(href, baseUrl);
            
            // Only include links from same domain
            if (absoluteUrl.origin === baseDomainUrl) {
              // Skip static assets
              if (!absoluteUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|pdf|css|js|ico|woff|woff2|ttf|mp4|mp3|zip|exe)$/i)) {
                // Clean the URL - remove hash, keep path
                absoluteUrl.hash = '';
                const cleanUrl = absoluteUrl.href;
                if (cleanUrl !== baseUrl && cleanUrl !== baseDomainUrl + '/') {
                  routes.push(cleanUrl);
                }
              }
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
        
        console.log(`Discovered ${routes.length} real links from page HTML`);
        return [...new Set(routes)]; // Remove duplicates
      };
      
      // Extract all links from HTML
      const extractLinks = (html: string, currentUrl: string): string[] => {
        const links: string[] = [];
        const foundHrefs = new Set<string>();
        
        // Find all href attributes
        const linkRegex = /href=["']([^"']+)["']/gi;
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
          foundHrefs.add(match[1].trim());
        }
        
        for (let href of foundHrefs) {
          if (href.startsWith('#') || href.startsWith('javascript:') || 
              href.startsWith('mailto:') || href.startsWith('tel:')) continue;
          
          try {
            const absoluteUrl = new URL(href, currentUrl);
            if (absoluteUrl.origin === baseDomain) {
              absoluteUrl.hash = '';
              const normalizedUrl = absoluteUrl.href;
              // Skip static assets
              if (!normalizedUrl.match(/\.(jpg|jpeg|png|gif|svg|webp|pdf|css|js|ico|woff|woff2|ttf|mp4|mp3)$/i)) {
                links.push(normalizedUrl);
              }
            }
          } catch (e) {}
        }
        
        return [...new Set(links)];
      };
      
      const isErrorPage = (html: string, content: string): boolean => {
        const combined = (html + ' ' + content).toLowerCase();
        
        // More specific error patterns - avoid false positives
        const errorPatterns = [
          /404\s*(page)?\s*(not)?\s*found/i,
          /page\s*(not)?\s*found/i,
          /error\s*404/i,
          /page\s*does\s*not\s*exist/i,
          /nothing\s*(was)?\s*found\s*(here)?/i,
          /this\s*page\s*(doesn't|does\s*not)\s*exist/i,
          /we\s*couldn't\s*find/i,
          /sorry.*page.*not.*available/i,
        ];
        
        // Check if it looks like an actual error page (short content with error message)
        for (const pattern of errorPatterns) {
          if (pattern.test(combined)) {
            // Only consider it an error page if content is also very short
            const cleanContent = content.replace(/<[^>]+>/g, '').trim();
            if (cleanContent.length < 500) {
              return true;
            }
          }
        }
        return false;
      };
      
      const getContentHash = (content: string): string => {
        return content.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 500);
      };
      
      const extractContent = (html: string): { title: string; content: string } => {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        let title = titleMatch ? titleMatch[1].trim() : "Untitled Page";
        title = title.replace(/\s+/g, ' ').replace(/\|.*$/, '').replace(/-.*$/, '').trim() || "Untitled Page";
        
        // Detect website type for optimized extraction
        const { type: siteType } = detectWebsiteType(html);
        
        // Try multiple meta description patterns
        const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
        
        // Also try OG description
        const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
        const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : "";
        
        let bodyContent = "";
        
        // WordPress-specific extraction
        if (siteType === 'wordpress') {
          // Try WordPress-specific content containers
          const wpContentMatch = html.match(/<div[^>]*class=["'][^"']*(?:entry-content|post-content|page-content|the-content|content-area)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
          const wpMainMatch = html.match(/<main[^>]*id=["'](?:main|content|primary)[^"']*["'][^>]*>([\s\S]*?)<\/main>/i);
          const wpArticleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
          
          if (wpContentMatch) {
            bodyContent = wpContentMatch[1];
          } else if (wpMainMatch) {
            bodyContent = wpMainMatch[1];
          } else if (wpArticleMatch) {
            bodyContent = wpArticleMatch[1];
          }
        }
        
        // Shopify-specific extraction
        if (siteType === 'shopify' && !bodyContent) {
          const shopifyMainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
          const productMatch = html.match(/<div[^>]*class=["'][^"']*product[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
          
          if (shopifyMainMatch) {
            bodyContent = shopifyMainMatch[1];
          } else if (productMatch) {
            bodyContent = productMatch.join(' ');
          }
        }
        
        // Webflow-specific extraction  
        if (siteType === 'webflow' && !bodyContent) {
          const wfMainMatch = html.match(/<div[^>]*class=["'][^"']*(?:main-wrapper|page-wrapper|body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
          if (wfMainMatch) {
            bodyContent = wfMainMatch[1];
          }
        }
        
        // E-commerce / Amazon-specific extraction
        if (!bodyContent) {
          // Amazon product grid/search results
          const amazonResults = html.match(/<div[^>]*data-component-type=["']s-search-result["'][^>]*>([\s\S]*?)<\/div>/gi);
          if (amazonResults && amazonResults.length > 0) {
            bodyContent = amazonResults.join(' ');
          }
          
          // Generic product containers
          if (!bodyContent) {
            const productContainers = html.match(/<div[^>]*class=["'][^"']*(?:product-card|product-item|product-grid|product-list|item-card)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
            if (productContainers && productContainers.length > 0) {
              bodyContent = productContainers.join(' ');
            }
          }
          
          // Category/collection pages
          if (!bodyContent) {
            const categoryContent = html.match(/<div[^>]*class=["'][^"']*(?:category|collection|catalog|shop-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
            if (categoryContent && categoryContent.length > 0) {
              bodyContent = categoryContent.join(' ');
            }
          }
        }
        
        // Generic fallback extraction strategies
        if (!bodyContent) {
          const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
          const articleMatches = html.match(/<article[^>]*>([\s\S]*?)<\/article>/gi);
          const sectionMatches = html.match(/<section[^>]*>([\s\S]*?)<\/section>/gi);
          const contentDivMatch = html.match(/<div[^>]*(?:class|id)=["'][^"']*(?:content|main|page|wrapper|container)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          
          if (mainMatch) {
            bodyContent = mainMatch[1];
          } else if (articleMatches && articleMatches.length > 0) {
            bodyContent = articleMatches.join(' ');
          } else if (contentDivMatch && contentDivMatch.length > 0) {
            bodyContent = contentDivMatch.join(' ');
          } else if (sectionMatches && sectionMatches.length > 0) {
            bodyContent = sectionMatches.join(' ');
          } else if (bodyMatch) {
            bodyContent = bodyMatch[1];
          } else {
            bodyContent = html;
          }
        }
        
        // Remove unwanted elements
        bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
        bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
        bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
        bodyContent = bodyContent.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");
        bodyContent = bodyContent.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");
        bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/gi, "");
        // Remove WordPress-specific widgets and sidebars
        bodyContent = bodyContent.replace(/<div[^>]*class=["'][^"']*(?:sidebar|widget|wp-block-sidebar)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");
        
        // Extract headings for better context
        const headings: string[] = [];
        const headingMatches = bodyContent.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi);
        for (const match of headingMatches) {
          const headingText = match[1].replace(/<[^>]+>/g, '').trim();
          if (headingText.length > 0 && headingText.length < 200) {
            headings.push(headingText);
          }
        }
        
        // Extract list items for services/features
        const listItems: string[] = [];
        const liMatches = bodyContent.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
        for (const match of liMatches) {
          const liText = match[1].replace(/<[^>]+>/g, '').trim();
          if (liText.length > 10 && liText.length < 300) {
            listItems.push(liText);
          }
        }
        
        // Extract paragraphs
        const paragraphs: string[] = [];
        const pMatches = bodyContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        for (const match of pMatches) {
          const pText = match[1].replace(/<[^>]+>/g, '').trim();
          if (pText.length > 20) {
            paragraphs.push(pText);
          }
        }
        
        // E-commerce: Extract products WITH URLs
        const productsWithUrls: string[] = [];
        
        // Extract product links with titles - Amazon format
        const amazonProductLinks = bodyContent.matchAll(/<a[^>]*href=["']([^"']*\/dp\/[^"']+)["'][^>]*>[\s\S]*?<span[^>]*class=["'][^"']*a-text-normal[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi);
        for (const match of amazonProductLinks) {
          const href = match[1];
          const titleText = match[2].replace(/<[^>]+>/g, '').trim();
          if (titleText.length > 10 && titleText.length < 300) {
            const fullUrl = href.startsWith('http') ? href : baseDomain + href;
            productsWithUrls.push(`${titleText} | Link: ${fullUrl}`);
          }
        }
        
        // Extract product links - generic format
        const genericProductLinks = bodyContent.matchAll(/<a[^>]*href=["']([^"']*(?:\/product|\/p\/|\/item)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi);
        for (const match of genericProductLinks) {
          const href = match[1];
          const titleText = match[2].replace(/<[^>]+>/g, '').trim();
          if (titleText.length > 5 && titleText.length < 300) {
            const fullUrl = href.startsWith('http') ? href : baseDomain + href;
            productsWithUrls.push(`${titleText} | Link: ${fullUrl}`);
          }
        }
        
        // Fallback: Extract product names without URLs
        const productNames: string[] = [];
        if (productsWithUrls.length === 0) {
          // Amazon product titles
          const amazonTitles = bodyContent.matchAll(/<span[^>]*class=["'][^"']*a-text-normal[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi);
          for (const match of amazonTitles) {
            const titleText = match[1].replace(/<[^>]+>/g, '').trim();
            if (titleText.length > 10 && titleText.length < 300) {
              productNames.push(titleText);
            }
          }
          // Generic product titles
          const prodTitles = bodyContent.matchAll(/<[^>]*class=["'][^"']*(?:product-title|product-name|item-title|item-name)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi);
          for (const match of prodTitles) {
            const titleText = match[1].replace(/<[^>]+>/g, '').trim();
            if (titleText.length > 5 && titleText.length < 300) {
              productNames.push(titleText);
            }
          }
        }
        
        // E-commerce: Extract prices
        const prices: string[] = [];
        const priceMatches = bodyContent.matchAll(/<[^>]*class=["'][^"']*(?:price|a-price|product-price)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi);
        for (const match of priceMatches) {
          const priceText = match[1].replace(/<[^>]+>/g, '').trim();
          if (priceText.match(/[₹$€£]|\d+/) && priceText.length < 50) {
            prices.push(priceText);
          }
        }
        
        // Strip all remaining HTML tags
        bodyContent = bodyContent.replace(/<[^>]+>/g, " ");
        
        // Decode HTML entities
        bodyContent = bodyContent
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, "/")
          .replace(/&rsquo;/g, "'")
          .replace(/&lsquo;/g, "'")
          .replace(/&rdquo;/g, '"')
          .replace(/&ldquo;/g, '"')
          .replace(/&ndash;/g, "-")
          .replace(/&mdash;/g, "-")
          .replace(/\s+/g, " ")
          .trim();
        
        // Build comprehensive content
        let fullContent = "";
        
        // Add meta description first
        if (metaDesc) {
          fullContent += metaDesc + ". ";
        } else if (ogDesc) {
          fullContent += ogDesc + ". ";
        }
        
        // Add headings as section context
        if (headings.length > 0) {
          fullContent += "Page sections: " + headings.slice(0, 10).join(", ") + ". ";
        }
        
        // Add main body content
        fullContent += bodyContent;
        
        // Add list items if they provide additional context
        if (listItems.length > 0 && listItems.length <= 20) {
          fullContent += " Key points: " + listItems.slice(0, 10).join("; ") + ".";
        }
        
        // Add e-commerce product info WITH URLs (priority)
        if (productsWithUrls.length > 0) {
          const uniqueProducts = [...new Set(productsWithUrls)].slice(0, 20);
          fullContent += " PRODUCTS WITH LINKS: " + uniqueProducts.join(" || ") + ".";
        } else if (productNames.length > 0) {
          // Fallback: products without URLs
          const uniqueProducts = [...new Set(productNames)].slice(0, 25);
          fullContent += " Products available: " + uniqueProducts.join(", ") + ".";
        }
        
        if (prices.length > 0) {
          const uniquePrices = [...new Set(prices)].slice(0, 15);
          fullContent += " Price range: " + uniquePrices.join(", ") + ".";
        }
        
        // If still too short, use meta description with title
        if (fullContent.trim().length < 50 && (metaDesc || ogDesc)) {
          fullContent = `${title}. ${metaDesc || ogDesc}`;
        }
        
        return { title, content: fullContent };
      };
      
      const scannedPages: { url: string; title: string; content: string }[] = [];
      const seenContentHashes = new Set<string>();
      const maxPages = 100;
      const sitemapUrlsSet = new Set<string>();
      
      // STEP 1: Look for sitemap
      sendProgress({ type: 'status', message: 'Looking for sitemap.xml...', progress: 8 });
      const sitemapUrls = await discoverFromSitemap();
      for (const sitemapUrl of sitemapUrls) {
        if (!urlsToScan.includes(sitemapUrl)) {
          urlsToScan.push(sitemapUrl);
          sitemapUrlsSet.add(sitemapUrl);
        }
      }
      
      if (sitemapUrls.length > 0) {
        sendProgress({ type: 'status', message: `Found ${sitemapUrls.length} pages in sitemap`, progress: 12 });
      } else {
        sendProgress({ type: 'status', message: 'No sitemap found, discovering pages...', progress: 12 });
      }
      
      // STEP 2: Analyze homepage with Puppeteer (universal scanning)
      sendProgress({ type: 'status', message: 'Loading homepage with JavaScript rendering...', progress: 15 });
      let homepageHtml = '';
      
      // Always use Puppeteer for the homepage to ensure we get all content
      if (puppeteerAvailable) {
        try {
          sendProgress({ type: 'status', message: 'Launching browser for full content extraction...', progress: 16 });
          const homeResult = await fetchWithPuppeteer(url as string);
          homepageHtml = homeResult.html;
          
          // Detect website type for logging
          const { type: detectedType } = detectWebsiteType(homepageHtml);
          console.log(`Website detected as: ${detectedType}`);
          sendProgress({ type: 'status', message: `Detected: ${detectedType} - extracting content...`, progress: 17 });
          
          // Add discovered links from Puppeteer
          for (const link of homeResult.links) {
            if (!urlsToScan.includes(link)) {
              urlsToScan.push(link);
            }
          }
          console.log(`Homepage loaded with Puppeteer: ${homepageHtml.length} chars, ${homeResult.links.length} links found`);
          
          // Also extract and save homepage content immediately
          if (homeResult.textContent && homeResult.textContent.length > 50) {
            const titleMatch = homepageHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
            const homeTitle = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ').replace(/\|.*$/, '').replace(/-.*$/, '').trim() : 'Homepage';
            scannedPages.push({ 
              url: url as string, 
              title: homeTitle, 
              content: homeResult.textContent 
            });
            visitedUrls.add(url as string);
            sendProgress({ type: 'found', message: `Found content: ${homeTitle}`, pagesFound: 1, progress: 18 });
          }
        } catch (e: any) {
          console.log(`Puppeteer homepage fetch failed: ${e.message}, trying regular fetch`);
          puppeteerAvailable = false;
        }
      }
      
      // Fallback to regular fetch only if Puppeteer failed
      if (!homepageHtml && !puppeteerAvailable) {
        try {
          const homeResponse = await fetch(url as string, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(15000)
          });
          if (homeResponse.ok) {
            homepageHtml = await homeResponse.text();
            console.log(`Homepage loaded with regular fetch: ${homepageHtml.length} chars`);
          }
        } catch (e) {
          console.log('Regular homepage fetch also failed');
        }
      }
      
      // Get common routes from homepage HTML
      if (homepageHtml) {
        const commonRoutes = getCommonRoutes(homepageHtml, url as string);
        for (const route of commonRoutes) {
          // Routes are already absolute URLs now
          if (!urlsToScan.includes(route)) {
            urlsToScan.push(route);
          }
        }
      }
      
      const totalToScan = Math.min(urlsToScan.length, maxPages);
      sendProgress({ 
        type: 'status', 
        message: `Found ${urlsToScan.length} pages to scan`, 
        progress: 20, 
        totalPages: totalToScan,
        scannedCount: 0
      });
      
      // STEP 3: Crawl all pages with progress updates
      let scannedCount = 0;
      let lastProgressUpdate = Date.now();
      
      while (urlsToScan.length > 0 && scannedPages.length < maxPages) {
        const currentUrl = urlsToScan.shift()!;
        
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);
        
        scannedCount++;
        const progressPercent = Math.min(20 + Math.floor((scannedCount / Math.max(totalToScan, 1)) * 70), 90);
        
        // Send progress update immediately for each page
        sendProgress({ 
          type: 'scanning', 
          message: `Scanning page ${scannedCount} of ${totalToScan}: ${new URL(currentUrl).pathname || '/'}`,
          currentUrl: currentUrl,
          scannedCount: scannedCount,
          totalPages: totalToScan,
          progress: progressPercent,
          pagesFound: scannedPages.length
        });
        
        try {
          let html = '';
          let discoveredLinks: string[] = [];
          let puppeteerTextContent = '';
          
          if (usePuppeteer && puppeteerAvailable) {
            try {
              const result = await fetchWithPuppeteer(currentUrl);
              html = result.html;
              discoveredLinks = result.links;
              puppeteerTextContent = result.textContent || '';
              console.log(`Puppeteer successfully fetched: ${currentUrl} (${html.length} chars)`);
            } catch (e: any) {
              // Puppeteer failed - log the actual error and fallback to regular fetch
              console.log(`Puppeteer failed for ${currentUrl}: ${e.message}`);
              try {
                const response = await fetch(currentUrl, {
                  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                  signal: AbortSignal.timeout(30000),
                });
                if (response.ok) {
                  const contentType = response.headers.get('content-type') || '';
                  if (contentType.includes('text/html')) {
                    html = await response.text();
                    console.log(`Regular fetch succeeded: ${currentUrl} (${html.length} chars)`);
                  }
                }
              } catch (fetchErr) {
                continue;
              }
              if (!html) continue;
            }
          } else {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            try {
              const response = await fetch(currentUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
              
              if (!response.ok) continue;
              
              const contentType = response.headers.get('content-type') || '';
              if (!contentType.includes('text/html')) continue;
              
              html = await response.text();
              
              // Check if content is too sparse (might need JS rendering)
              const quickExtract = extractContent(html);
              if (quickExtract.content.length < 100 && puppeteerAvailable && !usePuppeteer) {
                // Try Puppeteer for this page as fallback
                console.log(`Content too sparse for ${currentUrl}, trying Puppeteer...`);
                try {
                  const puppeteerResult = await fetchWithPuppeteer(currentUrl);
                  if (puppeteerResult.textContent && puppeteerResult.textContent.length > quickExtract.content.length) {
                    html = puppeteerResult.html;
                    puppeteerTextContent = puppeteerResult.textContent;
                    discoveredLinks = puppeteerResult.links;
                  }
                } catch (puppeteerErr) {
                  // Puppeteer fallback failed, continue with sparse content
                  console.log(`Puppeteer fallback failed for ${currentUrl}`);
                }
              }
            } catch (e) {
              clearTimeout(timeoutId);
              continue;
            }
          }
          
          if (isErrorPage(html, '')) continue;
          
          // For SPAs with Puppeteer, prefer the directly extracted text content
          let title: string;
          let content: string;
          
          if (puppeteerTextContent && puppeteerTextContent.length > 30) {
            // Use the text content extracted directly from rendered DOM
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            title = titleMatch ? titleMatch[1].trim() : "Untitled Page";
            title = title.replace(/\s+/g, ' ').replace(/\|.*$/, '').replace(/-.*$/, '').trim() || "Untitled Page";
            content = puppeteerTextContent;
            console.log(`Using Puppeteer text content for ${currentUrl}: ${content.length} chars`);
          } else {
            console.log(`Puppeteer text content too short for ${currentUrl}: ${puppeteerTextContent?.length || 0} chars, using HTML extraction`);
            const extracted = extractContent(html);
            title = extracted.title;
            content = extracted.content;
            console.log(`HTML extraction for ${currentUrl}: ${content.length} chars`);
          }
          
          if (isErrorPage('', content)) {
            console.log(`Skipping ${currentUrl} - detected as error page`);
            continue;
          }
          
          const urlPath = new URL(currentUrl).pathname;
          const contentHashBase = usePuppeteer ? `${urlPath}:${content.substring(0, 200)}` : content;
          const contentHash = getContentHash(contentHashBase);
          
          const isTrustedUrl = sitemapUrlsSet.has(currentUrl);
          
          if (!isTrustedUrl && !usePuppeteer && seenContentHashes.has(contentHash)) continue;
          
          const pageTitle = urlPath === '/' ? title : `${title} - ${urlPath.replace(/\//g, ' ').trim()}`;
          
          if (content.length > 30) {
            seenContentHashes.add(contentHash);
            scannedPages.push({ url: currentUrl, title: pageTitle, content });
            sendProgress({ 
              type: 'found', 
              message: `Found content: ${pageTitle.substring(0, 50)}...`,
              pagesFound: scannedPages.length,
              progress: progressPercent
            });
          } else {
            console.log(`Skipping ${currentUrl} - content too short (${content.length} chars)`);
          }
          
          const links = usePuppeteer ? discoveredLinks : extractLinks(html, currentUrl);
          for (const link of links) {
            if (!visitedUrls.has(link) && !urlsToScan.includes(link)) {
              urlsToScan.push(link);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Always send progress after each iteration, even if no content found
          sendProgress({
            type: 'progress',
            message: `Progress: ${progressPercent}%`,
            scannedCount,
            totalPages: totalToScan,
            progress: progressPercent
          });
        } catch (error: any) {
          continue;
        }
      }
      
      // Close Puppeteer browser
      if (browser) {
        try {
          await browser.close();
        } catch (e) {}
      }
      
      sendProgress({ type: 'status', message: 'Saving content to knowledge base...', progress: 92 });
      
      // Save content to database
      let entriesCreated = 0;
      
      for (const page of scannedPages) {
        const chunks: string[] = [];
        
        if (page.content.length <= 2000) {
          chunks.push(page.content);
        } else {
          const sentences = page.content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);
          let currentChunk = "";
          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > 2000) {
              if (currentChunk) chunks.push(currentChunk.trim());
              currentChunk = sentence;
            } else {
              currentChunk += " " + sentence;
            }
          }
          if (currentChunk) chunks.push(currentChunk.trim());
        }
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          if (chunk.length < 30) continue;
          
          const entryTitle = chunks.length > 1 ? `${page.title} (Part ${i + 1})` : page.title;
          
          try {
            await storage.createKnowledgeEntry({
              agentId: agentId as string,
              title: entryTitle,
              content: chunk,
              sourceUrl: page.url,
              contentType: "website",
            });
            entriesCreated++;
          } catch (e: any) {
            console.error('Failed to save knowledge entry:', e.message);
          }
        }
      }
      
      console.log(`Scan complete. Pages scanned: ${scannedPages.length}, Entries created: ${entriesCreated}`);
      
      // Update agent scan status to complete
      await storage.updateAgent(agentId as string, {
        scanStatus: 'complete',
        scanProgress: 100,
        scanMessage: `Scan complete! Created ${entriesCreated} knowledge entries.`,
        lastScannedAt: new Date(),
      });
      
      sendProgress({ 
        type: 'complete', 
        message: `Scan complete! Created ${entriesCreated} knowledge entries.`,
        progress: 100,
        entriesCreated,
        pagesScanned: scannedPages.length,
        pagesFound: urlsToScan.length + scannedCount,
        deletedEntries
      });
      
      res.end();
      
    } catch (error: any) {
      console.error("Scan stream error:", error);
      
      // Update agent scan status to error
      if (agentId) {
        await storage.updateAgent(agentId as string, {
          scanStatus: 'error',
          scanProgress: 0,
          scanMessage: error.message || 'Scan failed',
        });
      }
      
      sendProgress({ type: 'error', message: error.message || 'Scan failed' });
      res.end();
    }
  });

  // Original scan endpoint (kept for fallback)
  app.post("/api/scan", isAuthenticated, async (req: any, res) => {
    try {
      const { agentId, url, rescan = false, additionalUrls = [] } = req.body;

      if (!agentId || !url) {
        return res.status(400).json({ message: "Agent ID and URL are required" });
      }

      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      if (agent.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // If rescan is true, delete all existing knowledge entries for this agent
      let deletedEntries = 0;
      if (rescan) {
        deletedEntries = await storage.deleteAllKnowledgeByAgentId(agentId);
        console.log(`Rescan: Deleted ${deletedEntries} existing entries`);
      }

      // Normalize URL - add https:// if missing
      let normalizedUrl = url.trim();
      if (!normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = normalizedUrl.replace(/^www\./i, '');
        normalizedUrl = 'https://' + normalizedUrl;
      }
      console.log(`Normalized URL: ${url} -> ${normalizedUrl}`);

      // Parse the base URL to get the domain
      let baseUrl: URL;
      try {
        baseUrl = new URL(normalizedUrl);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid URL format. Please enter a valid website address.' });
      }
      const baseDomain = baseUrl.origin;
      
      // Track visited URLs and pages to scan
      const visitedUrls = new Set<string>();
      const urlsToScan: string[] = [normalizedUrl];
      
      // Add any additional URLs provided by the user (for SPAs where links are JS-rendered)
      if (additionalUrls && Array.isArray(additionalUrls)) {
        for (const additionalUrl of additionalUrls) {
          if (additionalUrl && typeof additionalUrl === 'string') {
            try {
              let fullUrl = additionalUrl.trim();
              // Normalize additional URL too
              if (!fullUrl.match(/^https?:\/\//i)) {
                if (fullUrl.startsWith('/')) {
                  fullUrl = new URL(fullUrl, baseDomain).href;
                } else {
                  fullUrl = 'https://' + fullUrl.replace(/^www\./i, '');
                }
              }
              if (!urlsToScan.includes(fullUrl)) {
                urlsToScan.push(fullUrl);
              }
            } catch (e) {
              console.log(`Invalid additional URL: ${additionalUrl}`);
            }
          }
        }
      }
      
      // ========== PUPPETEER BROWSER FOR UNIVERSAL SCANNING ==========
      // ALWAYS use Puppeteer by default for maximum compatibility
      // This ensures we can scan ANY website: React, Vue, Angular, WordPress, Shopify, etc.
      let browser: any = null;
      let usePuppeteer = true; // DEFAULT TO TRUE - scan everything with JS rendering
      let puppeteerAvailable = true; // Track if Puppeteer can be used
      
      // Helper function to fetch page with Puppeteer (for SPAs)
      const fetchWithPuppeteer = async (pageUrl: string): Promise<{ html: string; links: string[] }> => {
        if (!puppeteerAvailable) {
          throw new Error('Puppeteer not available');
        }
        
        if (!browser) {
          try {
            // Use the verified Chrome path directly
            const executablePath = '/root/.cache/puppeteer/chrome/linux-143.0.7499.42/chrome-linux64/chrome';
            
            // Check if it exists, fall back to auto-detection if not
            const fs = await import('fs');
            const chromePath = fs.existsSync(executablePath) ? executablePath : undefined;
            
            if (chromePath) {
              console.log(`Using Chrome at: ${chromePath}`);
            } else {
              console.log('Chrome not found at expected path, using auto-detection');
            }
            
            // Puppeteer launch options optimized for Linux VPS as root with stealth
            const launchOptions: any = {
              headless: 'new',
              executablePath: chromePath,
              ignoreHTTPSErrors: true,
              args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--disable-background-networking',
                '--disable-default-apps',
                '--disable-extensions',
                '--disable-sync',
                '--disable-translate',
                '--metrics-recording-only',
                '--mute-audio',
                '--safebrowsing-disable-auto-update',
                '--window-size=1920,1080',
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--enable-features=NetworkService,NetworkServiceInProcess',
              ]
            };
            
            browser = await puppeteer.launch(launchOptions);
            console.log('Puppeteer browser launched successfully for SPA scanning');
          } catch (e: any) {
            console.error('Failed to launch Puppeteer:', e.message);
            puppeteerAvailable = false;
            throw e;
          }
        }
        
        let page;
        try {
          page = await browser.newPage();
          console.log(`Page created for: ${pageUrl}`);
        } catch (pageErr: any) {
          console.error(`Failed to create page: ${pageErr.message}`);
          throw pageErr;
        }
        
        // Set viewport and user agent to look like a real browser
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Set extra HTTP headers to look more like a real browser
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        });
        
        // Comprehensive anti-detection settings
        await page.evaluateOnNewDocument(`
          // Override webdriver detection
          Object.defineProperty(navigator, 'webdriver', { get: () => false });
          
          // Chrome runtime
          window.chrome = { runtime: {}, loadTimes: function(){}, csi: function(){} };
          
          // Override permissions
          const originalQuery = window.navigator.permissions.query;
          window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
              Promise.resolve({ state: Notification.permission }) :
              originalQuery(parameters)
          );
          
          // Override plugins to look like real browser
          Object.defineProperty(navigator, 'plugins', {
            get: () => [
              { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
              { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
              { name: 'Native Client', filename: 'internal-nacl-plugin' }
            ]
          });
          
          // Override languages
          Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
          
          // Override platform
          Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
          
          // Override hardware concurrency
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
          
          // Override device memory
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        `);
        
        try {
          console.log(`Navigating to: ${pageUrl}`);
          await page.goto(pageUrl, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
          });
          console.log(`Navigation completed: ${pageUrl}`);
          
          // Wait for JavaScript to render content
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Scroll to trigger lazy loading
          await page.evaluate(`window.scrollTo(0, 500)`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await page.evaluate(`window.scrollTo(0, 1500)`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await page.evaluate(`window.scrollTo(0, 3000)`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await page.evaluate(`window.scrollTo(0, 0)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get rendered HTML
          const html = await page.content();
          
          console.log(`Page HTML length: ${html.length} chars`);
          
          // Extract all links from rendered page (using string to avoid esbuild __name issue)
          const links = await page.evaluate(`
            (function() {
              var baseDomainArg = "${baseDomain}";
              var anchors = document.querySelectorAll('a[href]');
              var foundLinks = [];
              anchors.forEach(function(a) {
                var href = a.getAttribute('href');
                if (href && href.indexOf('#') !== 0 && href.indexOf('javascript:') !== 0 && 
                    href.indexOf('mailto:') !== 0 && href.indexOf('tel:') !== 0) {
                  try {
                    var absoluteUrl = new URL(href, window.location.origin);
                    if (absoluteUrl.origin === baseDomainArg) {
                      foundLinks.push(absoluteUrl.href);
                    }
                  } catch (e) {}
                }
              });
              // Return unique links
              return foundLinks.filter(function(v, i, a) { return a.indexOf(v) === i; });
            })()
          `);
          
          await page.close();
          console.log(`Page closed after success: ${pageUrl}`);
          return { html, links };
        } catch (e: any) {
          console.error(`Navigation/content error for ${pageUrl}: ${e.message}`);
          await page.close();
          throw e;
        }
      };

      // Helper function to discover pages from sitemap.xml
      const discoverFromSitemap = async (): Promise<string[]> => {
        const sitemapUrls: string[] = [];
        const sitemapLocations = [
          `${baseDomain}/sitemap.xml`,
          `${baseDomain}/sitemap_index.xml`,
          `${baseDomain}/sitemap/sitemap.xml`,
        ];
        
        for (const sitemapUrl of sitemapLocations) {
          try {
            const response = await fetch(sitemapUrl, { 
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(5000)
            });
            if (response.ok) {
              const xml = await response.text();
              // Extract URLs from sitemap
              const locMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
              for (const match of locMatches) {
                const pageUrl = match[1].trim();
                if (pageUrl.startsWith(baseDomain)) {
                  sitemapUrls.push(pageUrl);
                }
              }
              if (sitemapUrls.length > 0) {
                console.log(`Found ${sitemapUrls.length} URLs from sitemap: ${sitemapUrl}`);
                break;
              }
            }
          } catch (e) {
            // Sitemap not found or error, continue
          }
        }
        return sitemapUrls;
      };
      
      // Helper function to detect if site is an SPA
      const isSPASite = (html: string): boolean => {
        // Check for SPA indicators
        const spaIndicators = [
          /<div\s+id=["'](?:root|app|__next|__nuxt)["']/i,
          /createHotContext|injectIntoGlobalHook/i,
          /@vite\/client/i,
          /react-refresh/i,
          /<script\s+type=["']module["']/i,
          /window\.__INITIAL_STATE__|window\.__NEXT_DATA__|window\.__NUXT__/i,
        ];
        
        // Check for empty body (SPA shell)
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : '';
        const cleanBody = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                                     .replace(/<[^>]+>/g, '')
                                     .replace(/\s+/g, '')
                                     .trim();
        
        // If body has very little text but has SPA indicators, it's an SPA
        for (const indicator of spaIndicators) {
          if (indicator.test(html)) {
            console.log('Detected SPA site (has SPA indicator)');
            return true;
          }
        }
        
        if (cleanBody.length < 100 && html.includes('<script')) {
          console.log('Detected SPA site (empty body with scripts)');
          return true;
        }
        
        return false;
      };
      
      // Universal route discovery - extract only REAL links from HTML, no guessing
      const getCommonSPARoutes = (html: string, baseUrl: string): string[] => {
        const routes: string[] = [];
        const baseDomainUrl = new URL(baseUrl).origin;
        
        // Extract ALL internal links from the HTML - both relative and absolute
        const linkMatches = html.matchAll(/href=["']([^"']+)["']/gi);
        for (const match of linkMatches) {
          let href = match[1].trim();
          
          // Skip non-navigable links
          if (href.startsWith('#') || href.startsWith('javascript:') || 
              href.startsWith('mailto:') || href.startsWith('tel:') ||
              href.startsWith('data:')) {
            continue;
          }
          
          try {
            // Convert to absolute URL
            const absoluteUrl = new URL(href, baseUrl);
            
            // Only include links from same domain
            if (absoluteUrl.origin === baseDomainUrl) {
              // Skip static assets
              if (!absoluteUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|pdf|css|js|ico|woff|woff2|ttf|mp4|mp3|zip|exe)$/i)) {
                // Clean the URL - remove hash, keep path
                absoluteUrl.hash = '';
                const cleanUrl = absoluteUrl.href;
                if (cleanUrl !== baseUrl && cleanUrl !== baseDomainUrl + '/') {
                  routes.push(cleanUrl);
                }
              }
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
        
        console.log(`Discovered ${routes.length} real links from page HTML`);
        return [...new Set(routes)]; // Remove duplicates
      };
      
      // Helper function to extract routes from JavaScript bundles (for SPAs)
      const discoverFromJavaScript = async (html: string): Promise<string[]> => {
        const routes: string[] = [];
        
        // Find all script sources
        const scriptMatches = html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi);
        const scriptUrls: string[] = [];
        
        for (const match of scriptMatches) {
          const src = match[1];
          if (src.includes('.js') && !src.includes('analytics') && !src.includes('gtag')) {
            try {
              const scriptUrl = src.startsWith('http') ? src : new URL(src, baseDomain).href;
              scriptUrls.push(scriptUrl);
            } catch (e) {}
          }
        }
        
        // Fetch main JS bundles and extract routes
        for (const scriptUrl of scriptUrls.slice(0, 5)) { // Increased to 5 scripts
          try {
            const response = await fetch(scriptUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(10000)
            });
            if (response.ok) {
              const jsCode = await response.text();
              
              // Look for route patterns in React/Vue/etc apps
              const routePatterns = [
                // React Router paths: path: "/about" or path:"/services"
                /path:\s*["'](\/[a-z][a-z0-9-/]*)["']/gi,
                // to="/about" links
                /to=["'](\/[a-z][a-z0-9-/]*)["']/gi,
                // href="/about" 
                /href=["'](\/[a-z][a-z0-9-/]*)["']/gi,
                // navigate("/about")
                /navigate\(["'](\/[a-z][a-z0-9-/]*)["']\)/gi,
                // Link patterns with common page names
                /["'](\/(?:about|services|contact|portfolio|blog|pricing|team|faq|home|work|projects|gallery|clients|testimonials|modular-kitchen|bedroom|wardrobe|tv-unit|book-consultation)[a-z0-9-/]*)["']/gi,
                // Any path that looks like a route
                /["'](\/[a-z][a-z0-9-]{2,20})["']/gi,
              ];
              
              for (const pattern of routePatterns) {
                const matches = jsCode.matchAll(pattern);
                for (const match of matches) {
                  const route = match[1];
                  if (route && route.length > 1 && route.length < 50 && !route.includes('.')) {
                    routes.push(route);
                  }
                }
              }
            }
          } catch (e) {
            // Script fetch failed, continue
          }
        }
        
        // Also check inline scripts in the HTML
        const inlineScriptMatches = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
        for (const match of inlineScriptMatches) {
          const jsCode = match[1];
          // Look for navigation links
          const navLinkPattern = /["'](\/[a-z][a-z0-9-]*)["']/gi;
          const navMatches = jsCode.matchAll(navLinkPattern);
          for (const navMatch of navMatches) {
            const route = navMatch[1];
            if (route && route.length > 1 && route.length < 30) {
              routes.push(route);
            }
          }
        }
        
        // Return unique routes
        return [...new Set(routes)];
      };
      
      const scannedPages: { url: string; title: string; content: string }[] = [];
      const seenContentHashes = new Set<string>(); // Track unique content to avoid duplicates
      const maxPages = 100; // Allow up to 100 pages for full website crawl
      const timeout = 30000; // 30 second timeout per page
      const sitemapUrlsSet = new Set<string>(); // Track URLs from sitemap (trusted sources)
      
      // Helper function to check if content looks like a 404/error page
      const isErrorPage = (html: string, content: string): boolean => {
        const combined = (html + ' ' + content).toLowerCase();
        
        // More specific error patterns - avoid false positives
        const errorPatterns = [
          /404\s*(page)?\s*(not)?\s*found/i,
          /page\s*(not)?\s*found/i,
          /error\s*404/i,
          /page\s*does\s*not\s*exist/i,
          /nothing\s*(was)?\s*found\s*(here)?/i,
          /this\s*page\s*(doesn't|does\s*not)\s*exist/i,
          /we\s*couldn't\s*find/i,
          /sorry.*page.*not.*available/i,
        ];
        
        // Check if it looks like an actual error page (short content with error message)
        for (const pattern of errorPatterns) {
          if (pattern.test(combined)) {
            // Only consider it an error page if content is also very short
            const cleanContent = content.replace(/<[^>]+>/g, '').trim();
            if (cleanContent.length < 500) {
              return true;
            }
          }
        }
        return false;
      };
      
      // Helper function to create a simple hash of content for duplicate detection
      const getContentHash = (content: string): string => {
        // Normalize content and create a simple hash
        const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 500);
        return normalized;
      };
      
      // Helper function to extract links from HTML
      const extractLinks = (html: string, currentUrl: string): string[] => {
        const links: string[] = [];
        // Multiple regex patterns to catch different href formats
        const linkPatterns = [
          /<a[^>]+href=["']([^"']+)["'][^>]*>/gi,
          /<a\s+href=["']([^"']+)["'][^>]*>/gi,
          /href=["']([^"']+)["']/gi
        ];
        
        // Also look for routes in JavaScript (for SPAs)
        const jsRoutePatterns = [
          /["'](\/[a-z0-9-]+)["']/gi,  // Simple paths like "/about"
          /path:\s*["'](\/[a-z0-9-/]+)["']/gi,  // React Router paths
          /to=["'](\/[a-z0-9-/]+)["']/gi,  // Link to prop
          /navigate\(["'](\/[a-z0-9-/]+)["']\)/gi,  // navigate calls
          /href:\s*["'](\/[a-z0-9-/]+)["']/gi  // href in objects
        ];
        
        const foundHrefs = new Set<string>();
        
        for (const linkRegex of linkPatterns) {
          let match;
          while ((match = linkRegex.exec(html)) !== null) {
            foundHrefs.add(match[1].trim());
          }
        }
        
        // Extract JS routes for SPAs
        for (const routeRegex of jsRoutePatterns) {
          let match;
          while ((match = routeRegex.exec(html)) !== null) {
            const path = match[1].trim();
            // Only add valid looking paths (not just /)
            if (path.length > 1 && !path.includes('.')) {
              foundHrefs.add(path);
            }
          }
        }
        
        for (let href of foundHrefs) {
          // Skip anchor-only links
          if (href.startsWith('#')) continue;
          
          // Skip non-http links
          if (href.startsWith('javascript:') || 
              href.startsWith('mailto:') || 
              href.startsWith('tel:') ||
              href.startsWith('data:') ||
              href.startsWith('whatsapp:') ||
              href.startsWith('@')) {
            continue;
          }
          
          // Convert relative URLs to absolute
          try {
            const absoluteUrl = new URL(href, currentUrl);
            
            // Only include links from the same domain
            if (absoluteUrl.origin === baseDomain) {
              // Remove hash for cleaner URLs
              absoluteUrl.hash = '';
              const normalizedUrl = absoluteUrl.href;
              
              // Skip common non-content URLs (assets)
              if (!normalizedUrl.match(/\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|css|js|ico|woff|woff2|ttf|eot|mp4|mp3|avi|mov)$/i) &&
                  !normalizedUrl.includes('/@fs/')) {
                links.push(normalizedUrl);
              }
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
        
        if (links.length > 0) {
          console.log(`Found ${links.length} internal links on ${currentUrl}:`, links.slice(0, 10));
        }
        
        return [...new Set(links)]; // Remove duplicates
      };
      
      // Helper function to extract content from HTML
      const extractContent = (html: string): { title: string; content: string } => {
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        let title = titleMatch ? titleMatch[1].trim() : "Untitled Page";
        // Clean title
        title = title.replace(/\s+/g, ' ').replace(/\|.*$/, '').replace(/-.*$/, '').trim() || "Untitled Page";
        
        // Extract meta description
        const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
        
        // Extract Open Graph description as fallback
        const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
        const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : "";
        
        // Extract main content areas (prioritize main, article, section, then body)
        let bodyContent = "";
        
        // Try to find main content containers
        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        const articleMatches = html.match(/<article[^>]*>([\s\S]*?)<\/article>/gi);
        const sectionMatches = html.match(/<section[^>]*>([\s\S]*?)<\/section>/gi);
        const divContentMatch = html.match(/<div[^>]*(?:class|id)=["'][^"']*(?:content|main|page|wrapper)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        
        if (mainMatch) {
          bodyContent = mainMatch[1];
        } else if (articleMatches && articleMatches.length > 0) {
          bodyContent = articleMatches.join(" ");
        } else if (divContentMatch && divContentMatch.length > 0) {
          bodyContent = divContentMatch.join(" ");
        } else if (sectionMatches && sectionMatches.length > 0) {
          bodyContent = sectionMatches.join(" ");
        } else if (bodyMatch) {
          bodyContent = bodyMatch[1];
        } else {
          bodyContent = html;
        }
        
        // Remove unwanted elements
        bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
        bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
        bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
        bodyContent = bodyContent.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");
        bodyContent = bodyContent.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");
        bodyContent = bodyContent.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, "");
        bodyContent = bodyContent.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
        bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/gi, "");
        
        // Extract headings for better context
        const headings: string[] = [];
        const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
        let headingMatch;
        while ((headingMatch = headingRegex.exec(bodyContent)) !== null) {
          const headingText = headingMatch[1].replace(/<[^>]+>/g, "").trim();
          if (headingText.length > 0 && headingText.length < 200) {
            headings.push(headingText);
          }
        }
        
        // Extract list items for services/features pages
        const listItems: string[] = [];
        const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let liMatch;
        while ((liMatch = liRegex.exec(bodyContent)) !== null) {
          const liText = liMatch[1].replace(/<[^>]+>/g, "").trim();
          if (liText.length > 10 && liText.length < 300) {
            listItems.push(liText);
          }
        }
        
        // Extract paragraphs
        const paragraphs: string[] = [];
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let pMatch;
        while ((pMatch = pRegex.exec(bodyContent)) !== null) {
          const pText = pMatch[1].replace(/<[^>]+>/g, "").trim();
          if (pText.length > 20) {
            paragraphs.push(pText);
          }
        }
        
        // Remove remaining HTML tags
        bodyContent = bodyContent.replace(/<[^>]+>/g, " ");
        
        // Clean up whitespace and decode HTML entities
        bodyContent = bodyContent
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, "/")
          .replace(/&rsquo;/g, "'")
          .replace(/&lsquo;/g, "'")
          .replace(/&rdquo;/g, '"')
          .replace(/&ldquo;/g, '"')
          .replace(/&ndash;/g, "-")
          .replace(/&mdash;/g, "-")
          .replace(/\s+/g, " ")
          .trim();
        
        // Build comprehensive content
        let fullContent = "";
        
        // Add meta description
        if (metaDesc) fullContent += metaDesc + ". ";
        else if (ogDesc) fullContent += ogDesc + ". ";
        
        // Add headings summary
        if (headings.length > 0) {
          fullContent += "Page sections: " + headings.slice(0, 10).join(", ") + ". ";
        }
        
        // Add main content
        fullContent += bodyContent;
        
        // Add list items if they add value
        if (listItems.length > 0 && listItems.length <= 20) {
          fullContent += " Key points: " + listItems.slice(0, 10).join("; ") + ".";
        }
        
        // SPA FALLBACK: If content is too short but we have meta description, use it
        // This handles SPAs where content is JavaScript-rendered
        if (fullContent.trim().length < 50 && (metaDesc || ogDesc)) {
          const desc = metaDesc || ogDesc;
          // Create content from title and description
          fullContent = `${title}. ${desc}`;
          console.log(`SPA fallback: Using meta description for content`);
        }
        
        return { title, content: fullContent };
      };
      
      // STEP 1: Try to discover pages from sitemap first
      console.log(`Starting full website scan for: ${baseDomain}`);
      console.log('Step 1: Looking for sitemap.xml...');
      
      const sitemapUrls = await discoverFromSitemap();
      for (const sitemapUrl of sitemapUrls) {
        if (!urlsToScan.includes(sitemapUrl)) {
          urlsToScan.push(sitemapUrl);
          sitemapUrlsSet.add(sitemapUrl); // Mark as trusted sitemap URL
        }
      }
      
      if (sitemapUrls.length > 0) {
        console.log(`Found ${sitemapUrls.length} pages from sitemap`);
      } else {
        console.log('No sitemap found, will discover pages from JavaScript bundles...');
      }
      
      // STEP 2: Fetch the homepage first to discover JS routes
      console.log('Step 2: Analyzing homepage for navigation links...');
      let homepageHtml = '';
      try {
        const homeResponse = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(15000)
        });
        if (homeResponse.ok) {
          homepageHtml = await homeResponse.text();
          
          // Check if site needs JavaScript rendering (SPA detection)
          const { type: detectedType, needsJS } = detectWebsiteType(homepageHtml);
          console.log(`Detected website type: ${detectedType}, needsJS: ${needsJS}`);
          
          if (needsJS) {
            console.log(`SPA detected (${detectedType}) - enabling Puppeteer for JavaScript rendering...`);
            usePuppeteer = true;
          } else {
            // Also check body content - if it's empty/sparse, enable Puppeteer
            const bodyMatch = homepageHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (bodyMatch) {
              const cleanBody = bodyMatch[1]
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, '')
                .trim();
              
              if (cleanBody.length < 200) {
                console.log(`Sparse content detected (${cleanBody.length} chars) - enabling Puppeteer...`);
                usePuppeteer = true;
              }
            }
          }
          
          // Discover routes from JavaScript
          const jsRoutes = await discoverFromJavaScript(homepageHtml);
          console.log(`Found ${jsRoutes.length} potential routes from JavaScript:`, jsRoutes);
          
          for (const route of jsRoutes) {
            try {
              const fullUrl = new URL(route, baseDomain).href;
              if (!urlsToScan.includes(fullUrl) && !visitedUrls.has(fullUrl)) {
                urlsToScan.push(fullUrl);
              }
            } catch (e) {}
          }
          
          // Add common routes based on website type
          const commonRoutes = getCommonSPARoutes(homepageHtml, url);
          for (const route of commonRoutes) {
            // Routes are already absolute URLs now
            if (!urlsToScan.includes(route) && !visitedUrls.has(route)) {
              urlsToScan.push(route);
            }
          }
          console.log(`Added ${commonRoutes.length} common routes`);
        }
      } catch (e) {
        console.log('Could not fetch homepage for route discovery');
      }
      
      console.log(`Total URLs to scan: ${urlsToScan.length}`);
      
      // STEP 3: Crawl all discovered pages
      while (urlsToScan.length > 0 && scannedPages.length < maxPages) {
        const currentUrl = urlsToScan.shift()!;
        
        // Skip if already visited
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);
        
        try {
          console.log(`[${scannedPages.length + 1}/${maxPages}] Scanning: ${currentUrl}`);
          
          let html = '';
          let discoveredLinks: string[] = [];
          
          // Use Puppeteer for SPAs to render JavaScript
          if (usePuppeteer && puppeteerAvailable) {
            try {
              const result = await fetchWithPuppeteer(currentUrl);
              html = result.html;
              discoveredLinks = result.links;
              console.log(`  Puppeteer rendered ${html.length} chars, found ${discoveredLinks.length} links`);
            } catch (e: any) {
              console.error(`  Puppeteer failed for ${currentUrl}:`, e.message);
              if (e.stack) console.error('  Stack:', e.stack.split('\n').slice(0, 3).join('\n'));
              console.log(`  Trying regular fetch...`);
              // Fallback to regular fetch
              try {
                const response = await fetch(currentUrl, {
                  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                  signal: AbortSignal.timeout(30000),
                });
                if (response.ok) {
                  const contentType = response.headers.get('content-type') || '';
                  if (contentType.includes('text/html')) {
                    html = await response.text();
                  }
                }
              } catch (fetchErr) {
                continue;
              }
              if (!html) continue;
            }
          } else {
            // Regular fetch for non-SPA sites
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(currentUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
              },
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) continue;
            
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('text/html')) continue;
            
            html = await response.text();
          }
          
          // Check if this is a 404/error page (SPAs often return 200 for all routes)
          if (isErrorPage(html, '')) {
            console.log(`Skipping ${currentUrl} - detected as 404/error page`);
            continue;
          }
          
          // Extract content
          const { title, content } = extractContent(html);
          
          // Check content for 404 indicators
          if (isErrorPage('', content)) {
            console.log(`Skipping ${currentUrl} - content indicates 404/error page`);
            continue;
          }
          
          // For SPA websites: Use URL path as part of content hash to differentiate pages
          const urlPath = new URL(currentUrl).pathname;
          const contentHashBase = usePuppeteer 
            ? `${urlPath}:${content.substring(0, 200)}` // Include URL path for SPAs
            : content;
          const contentHash = getContentHash(contentHashBase);
          
          // For SPA websites: URLs from sitemap are trusted - skip duplicate check
          const isTrustedUrl = sitemapUrlsSet.has(currentUrl);
          
          if (!isTrustedUrl && !usePuppeteer && seenContentHashes.has(contentHash)) {
            console.log(`Skipping ${currentUrl} - duplicate content detected (not in sitemap)`);
            continue;
          }
          
          // Extract the path to create unique title for each page
          const pageTitle = urlPath === '/' ? title : `${title} - ${urlPath.replace(/\//g, ' ').trim()}`;
          
          // Only save if there's meaningful content (more than 30 chars - reduced for SPAs)
          if (content.length > 30) {
            seenContentHashes.add(contentHash);
            scannedPages.push({ url: currentUrl, title: pageTitle, content });
            console.log(`Saved page: ${currentUrl} (${isTrustedUrl ? 'from sitemap' : 'discovered'})`);
          } else {
            console.log(`Skipping ${currentUrl} - content too short (${content.length} chars)`);
          }
          
          // Extract links and add to queue
          // For Puppeteer, use links discovered from rendered page
          const links = usePuppeteer ? discoveredLinks : extractLinks(html, currentUrl);
          for (const link of links) {
            if (!visitedUrls.has(link) && !urlsToScan.includes(link)) {
              urlsToScan.push(link);
            }
          }
          
          // Small delay to be respectful to the server
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log(`Timeout scanning ${currentUrl}`);
          } else {
            console.error(`Error scanning ${currentUrl}:`, error.message);
          }
          // Continue with next URL
        }
      }
      
      // Close Puppeteer browser if it was used
      if (browser) {
        try {
          await browser.close();
          console.log('Puppeteer browser closed');
        } catch (e) {
          console.error('Error closing Puppeteer browser:', e);
        }
      }
      
      console.log(`Scan complete. Found ${scannedPages.length} pages with content.`);
      
      // Process and save content
      let entriesCreated = 0;
      
      for (const page of scannedPages) {
        // Split content into chunks for better retrieval
        const chunks: string[] = [];
        
        // If content is short, keep as single chunk
        if (page.content.length <= 2000) {
          chunks.push(page.content);
        } else {
          // Split into sentences and create chunks
          const sentences = page.content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);
          
          let currentChunk = "";
          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > 2000) {
              if (currentChunk) chunks.push(currentChunk.trim());
              currentChunk = sentence;
            } else {
              currentChunk += " " + sentence;
            }
          }
          if (currentChunk) chunks.push(currentChunk.trim());
        }
        
        // Save all chunks for each page
        for (let i = 0; i < chunks.length; i++) {
          if (chunks[i].length < 30) continue; // Skip very short chunks
          
          await storage.createKnowledgeEntry({
            agentId,
            sourceUrl: page.url,
            title: chunks.length > 1 ? `${page.title} - Part ${i + 1}` : page.title,
            section: `Section ${i + 1}`,
            content: chunks[i],
            contentType: "text",
            metadata: { 
              source: "web_scan", 
              pageUrl: page.url,
              scannedAt: new Date().toISOString(),
            },
          });
          entriesCreated++;
        }
      }

      // Update agent's website URL if not set
      if (!agent.websiteUrl) {
        await storage.updateAgent(agentId, { websiteUrl: baseDomain });
      }

      res.json({
        success: true,
        entriesCreated,
        pagesScanned: scannedPages.length,
        pagesFound: visitedUrls.size,
        deletedEntries: rescan ? deletedEntries : 0,
        scannedUrls: scannedPages.map(p => ({ url: p.url, title: p.title })),
      });
    } catch (error) {
      // Ensure Puppeteer browser is closed on error
      if (browser) {
        try {
          await browser.close();
        } catch (e) {}
      }
      console.error("Error scanning website:", error);
      res.status(500).json({ message: "Failed to scan website" });
    }
  });

  // ========== CHAT ==========
  
  // Helper function to find relevant knowledge entries based on user query
  function findRelevantKnowledge(knowledge: KnowledgeBase[], userQuery: string, maxEntries: number = 15): KnowledgeBase[] {
    if (knowledge.length === 0) return [];
    
    // Extract keywords from user query (remove common words)
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with',
      'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
      'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until',
      'while', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'your', 'yours', 'you',
      'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours', 'they', 'them', 'their', 'theirs', 'it', 'its',
      'he', 'him', 'his', 'she', 'her', 'hers', 'about', 'please', 'tell', 'know', 'want', 'like', 'get']);
    
    const queryWords = userQuery.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Score each knowledge entry
    const scoredKnowledge = knowledge.map(entry => {
      const contentLower = (entry.content || '').toLowerCase();
      const titleLower = (entry.title || '').toLowerCase();
      const sectionLower = (entry.section || '').toLowerCase();
      
      let score = 0;
      
      // Check for keyword matches
      for (const word of queryWords) {
        // Exact word match in content (higher weight)
        const contentMatches = (contentLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        score += contentMatches * 2;
        
        // Title match (highest weight)
        if (titleLower.includes(word)) {
          score += 10;
        }
        
        // Section match (high weight)
        if (sectionLower.includes(word)) {
          score += 5;
        }
      }
      
      // Boost for common query patterns
      const lowerQuery = userQuery.toLowerCase();
      if (lowerQuery.includes('contact') && (contentLower.includes('email') || contentLower.includes('phone') || contentLower.includes('@'))) {
        score += 20;
      }
      if (lowerQuery.includes('price') || lowerQuery.includes('pricing') || lowerQuery.includes('cost')) {
        if (contentLower.includes('price') || contentLower.includes('$') || contentLower.includes('cost') || contentLower.includes('plan')) {
          score += 20;
        }
      }
      if (lowerQuery.includes('service') || lowerQuery.includes('offer') || lowerQuery.includes('provide')) {
        if (contentLower.includes('service') || titleLower.includes('service')) {
          score += 15;
        }
      }
      if (lowerQuery.includes('about') || lowerQuery.includes('who')) {
        if (titleLower.includes('about') || contentLower.includes('about us') || contentLower.includes('who we are')) {
          score += 15;
        }
      }
      if (lowerQuery.includes('location') || lowerQuery.includes('address') || lowerQuery.includes('where')) {
        if (contentLower.includes('address') || contentLower.includes('location') || contentLower.includes('street')) {
          score += 15;
        }
      }
      if (lowerQuery.includes('hour') || lowerQuery.includes('open') || lowerQuery.includes('timing')) {
        if (contentLower.includes('hour') || contentLower.includes('open') || contentLower.includes('am') || contentLower.includes('pm')) {
          score += 15;
        }
      }
      
      return { entry, score };
    });
    
    // Sort by score and take top entries
    scoredKnowledge.sort((a, b) => b.score - a.score);
    
    // Get top relevant entries (score > 0), plus some general entries
    const relevant = scoredKnowledge
      .filter(sk => sk.score > 0)
      .slice(0, maxEntries)
      .map(sk => sk.entry);
    
    // If not enough relevant entries, add some general ones
    if (relevant.length < 5) {
      const general = scoredKnowledge
        .slice(0, 5 - relevant.length)
        .map(sk => sk.entry);
      return [...relevant, ...general].slice(0, maxEntries);
    }
    
    return relevant;
  }
  
  // ========== WIDGET CHAT (for embedded chatbots - no auth required) ==========
  app.post("/api/widget/chat", async (req: any, res) => {
    // Enable CORS for widget
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    
    try {
      const { agentId, message, sessionId: clientSessionId } = req.body;

      if (!agentId || !message) {
        return res.status(400).json({ message: "Agent ID and message are required" });
      }

      // Use provided session ID or generate one
      const sessionId = clientSessionId || `widget_${crypto.randomUUID()}`;

      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Check if agent is active
      if (!agent.isActive) {
        return res.json({
          response: "This assistant is currently unavailable. Please try again later.",
          sessionId,
        });
      }

      // Track conversation and messages
      const conversation = await storage.getOrCreateConversation(agentId, sessionId);
      
      // Save user message
      await storage.addMessage({
        conversationId: conversation.id,
        role: 'user',
        content: message,
      });

      const allKnowledge = await storage.getKnowledgeByAgentId(agentId);
      // Use smart search to find relevant knowledge based on user's query
      const relevantKnowledge = findRelevantKnowledge(allKnowledge, message, 15);
      const knowledgeContext = relevantKnowledge
        .map((k) => `[${k.title || 'Info'}${k.section ? ' - ' + k.section : ''}]\n${k.content}`)
        .join("\n\n---\n\n");

      // Use custom systemPrompt if available, otherwise generate one
      const basePrompt = agent.systemPrompt || `You are ${agent.name}, a helpful AI assistant.
${agent.description ? `About: ${agent.description}` : ""}
Tone: ${agent.toneOfVoice || "friendly and professional"}

CRITICAL RESPONSE RULES:
1. Keep responses SHORT - maximum 3-4 sentences for simple questions
2. Use bullet points for listing items (use - for each item)
3. NO headers (avoid # or ##) unless absolutely necessary
4. NO long paragraphs - break into short bullet points
5. Answer the specific question directly first
6. Be conversational, not formal

Example good response for "What services do you offer?":
We offer:
- Web Development
- Digital Marketing  
- SEO Services
- Mobile App Development

Let me know which one interests you!

Example BAD response (too long, too formal):
## Our Services
We are a comprehensive digital agency offering a wide range of services including web development where we create custom WordPress sites...

Remember: SHORT, CLEAR, BULLET POINTS when listing things.`;

      const systemPrompt = `${basePrompt}

${knowledgeContext ? `Here is relevant information from the knowledge base that you should use to answer questions:\n\n${knowledgeContext}` : ""}`;

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        const fallbackResponse = `Hi! I'm ${agent.name}. I'd be happy to help you! What would you like to know?`;
        // Save assistant response
        await storage.addMessage({
          conversationId: conversation.id,
          role: 'assistant',
          content: fallbackResponse,
        });
        return res.json({
          response: fallbackResponse,
          sessionId,
        });
      }

      const anthropic = new Anthropic({ apiKey });

      const completion = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      });

      const responseText =
        completion.content[0].type === "text"
          ? completion.content[0].text
          : "I apologize, but I couldn't generate a response.";

      // Save assistant response
      await storage.addMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: responseText,
      });

      res.json({ response: responseText, sessionId });
    } catch (error: any) {
      console.error("Error in widget chat:", error);
      
      // Check for specific error types
      if (error?.message?.includes('credit balance is too low') || 
          error?.error?.error?.message?.includes('credit balance')) {
        return res.json({
          response: "I'm currently experiencing some technical difficulties. Please try again in a moment or contact us directly."
        });
      }
      
      res.json({
        response: "I apologize, but I'm having trouble responding right now. Please try again in a moment."
      });
    }
  });

  // Handle OPTIONS request for CORS preflight
  app.options("/api/widget/chat", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
  });

  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { agentId, message, sessionId: clientSessionId } = req.body;
      const userId = req.user.claims.sub;

      if (!agentId || !message) {
        return res.status(400).json({ message: "Agent ID and message are required" });
      }

      // Use provided session ID or generate one based on user
      const sessionId = clientSessionId || `dashboard_${userId}_${Date.now()}`;

      // Check message limit
      const usageCheck = await storage.canSendMessage(userId);
      if (!usageCheck.allowed) {
        return res.status(403).json({ 
          message: "Message limit reached",
          limitReached: true,
          remaining: 0,
          limit: usageCheck.limit,
          plan: usageCheck.plan,
        });
      }

      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Track conversation and messages
      const conversation = await storage.getOrCreateConversation(agentId, sessionId);
      
      // Save user message
      await storage.addMessage({
        conversationId: conversation.id,
        role: 'user',
        content: message,
      });

      const allKnowledge = await storage.getKnowledgeByAgentId(agentId);
      // Use smart search to find relevant knowledge based on user's query
      const relevantKnowledge = findRelevantKnowledge(allKnowledge, message, 15);
      const knowledgeContext = relevantKnowledge
        .map((k) => `[${k.title || 'Info'}${k.section ? ' - ' + k.section : ''}]\n${k.content}`)
        .join("\n\n---\n\n");

      // Use custom systemPrompt if available, otherwise generate one
      const basePrompt = agent.systemPrompt || `You are ${agent.name}, an AI assistant.
${agent.description ? `Description: ${agent.description}` : ""}
Tone: ${agent.toneOfVoice || "friendly and professional"}
Purpose: ${agent.purpose || "support"}

IMPORTANT INSTRUCTIONS:
- Use ONLY the information provided above to answer questions
- Be accurate and helpful - extract specific details like names, numbers, emails, prices from the knowledge base
- If the user asks about contact info, pricing, services, or other specifics - find and provide the exact details from the knowledge base
- If you don't have the specific information requested, be honest about it
- Keep responses clear and concise`;

      const systemPrompt = `${basePrompt}

${knowledgeContext ? `Here is the relevant information from the knowledge base that you should use to answer questions:\n\n${knowledgeContext}` : ""}`;

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        // Increment count even for fallback responses
        await storage.incrementMessageCount(userId);
        const updatedUsage = await storage.canSendMessage(userId);
        
        const fallbackResponse = `I'm ${agent.name}. I'd be happy to help you! However, the AI service is not configured yet. Please add your Anthropic API key to enable intelligent responses.`;
        
        // Save assistant response
        await storage.addMessage({
          conversationId: conversation.id,
          role: 'assistant',
          content: fallbackResponse,
        });
        
        return res.json({
          response: fallbackResponse,
          sessionId,
          usage: {
            remaining: updatedUsage.remaining,
            limit: updatedUsage.limit,
          },
        });
      }

      const anthropic = new Anthropic({ apiKey });

      const completion = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      });

      const responseText =
        completion.content[0].type === "text"
          ? completion.content[0].text
          : "I apologize, but I couldn't generate a response.";

      // Save assistant response
      await storage.addMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: responseText,
      });

      // Increment message count after successful response
      await storage.incrementMessageCount(userId);
      const updatedUsage = await storage.canSendMessage(userId);

      res.json({ 
        response: responseText,
        sessionId,
        usage: {
          remaining: updatedUsage.remaining,
          limit: updatedUsage.limit,
        },
      });
    } catch (error: any) {
      console.error("Error in chat:", error);
      console.error("Error details:", JSON.stringify({
        message: error?.message,
        status: error?.status,
        error: error?.error,
        type: error?.type,
        name: error?.name
      }, null, 2));
      
      // Check for specific error types
      if (error?.message?.includes('credit balance is too low') || 
          error?.error?.error?.message?.includes('credit balance')) {
        return res.json({
          response: "I'm sorry, but the AI service is currently unavailable due to insufficient API credits. Please contact the administrator to resolve this issue."
        });
      }
      
      if (error?.status === 401 || error?.message?.includes('invalid_api_key') || error?.message?.includes('authentication')) {
        return res.json({
          response: "The AI service is not properly configured. Please check the API key configuration."
        });
      }
      
      // Return actual error for debugging
      res.status(500).json({ message: "Failed to process chat message", error: error?.message });
    }
  });

  return httpServer;
}
