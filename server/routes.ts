import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAgentSchema, insertKnowledgeBaseSchema, insertGeneratedPageSchema, type KnowledgeBase } from "@shared/schema";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import bcrypt from "bcryptjs";
import puppeteer from "puppeteer";

// Schema for updating agents - only allow safe fields
const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  websiteUrl: z.string().url().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  toneOfVoice: z.string().max(100).optional().nullable(),
  purpose: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
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

      const systemPrompt = `You are ${agent.name}, an AI assistant for a website.
${agent.description ? `Description: ${agent.description}` : ""}
Tone: ${agent.toneOfVoice || "friendly and professional"}
Purpose: ${agent.purpose || "support"}

${knowledgeContext ? `Here is relevant information from the knowledge base that you should use to answer questions:\n\n${knowledgeContext}\n\n` : ""}

Instructions:
- Be helpful, friendly, and concise
- Use the knowledge base information to answer questions accurately
- If you don't have specific information, offer to help in other ways
- Keep responses brief but informative (2-3 sentences when possible)
- Don't mention that you're an AI unless directly asked`;

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
        max_tokens: 512,
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

      const systemPrompt = `You are ${agent.name}, an AI assistant.
${agent.description ? `Description: ${agent.description}` : ""}
Tone: ${agent.toneOfVoice || "friendly and professional"}
Purpose: ${agent.purpose || "support"}

${knowledgeContext ? `Here is the relevant information from the knowledge base that you should use to answer questions:\n\n${knowledgeContext}\n\n` : ""}

IMPORTANT INSTRUCTIONS:
- Use ONLY the information provided above to answer questions
- Be accurate and helpful - extract specific details like names, numbers, emails, prices from the knowledge base
- If the user asks about contact info, pricing, services, or other specifics - find and provide the exact details from the knowledge base
- If you don't have the specific information requested, be honest about it
- Keep responses clear and concise`;

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

  // ========== LANDING PAGES ==========
  app.get("/api/landing-pages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pages = await storage.getGeneratedPagesByUserId(userId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching landing pages:", error);
      res.status(500).json({ message: "Failed to fetch landing pages" });
    }
  });

  // Get landing page usage stats
  app.get("/api/landing-pages/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const canCreate = await storage.canCreateLandingPage(userId);
      res.json(canCreate);
    } catch (error) {
      console.error("Error fetching landing page usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  app.post("/api/landing-pages/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt, websiteUrl } = req.body;

      if (!prompt && !websiteUrl) {
        return res.status(400).json({ message: "Either prompt or websiteUrl is required" });
      }

      // Check if user can create landing page
      const canCreate = await storage.canCreateLandingPage(userId);
      if (!canCreate.allowed) {
        return res.status(403).json({ 
          message: "Free trial limit reached. Upgrade to create more landing pages.",
          limitReached: true,
          remaining: canCreate.remaining,
          limit: canCreate.limit,
          plan: canCreate.plan
        });
      }

      const apiKey = process.env.ANTHROPIC_API_KEY;

      let pageContent: any;
      let finalPrompt = prompt || "";
      let scannedPages: { url: string; title: string; content: string }[] = [];

      // If websiteUrl is provided, scan the website first
      if (websiteUrl) {
        console.log(`Scanning website for landing page generation: ${websiteUrl}`);
        
        try {
          // Parse and validate URL
          let urlObj: URL;
          try {
            urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
          } catch {
            return res.status(400).json({ message: "Invalid URL format" });
          }
          
          const baseDomain = `${urlObj.protocol}//${urlObj.host}`;
          const visitedUrls = new Set<string>();
          const urlsToScan: string[] = [urlObj.href];
          const maxPages = 20; // Limit for landing page generation
          
          // Helper function to discover pages from sitemap.xml
          const discoverFromSitemap = async (): Promise<string[]> => {
            const sitemapUrls: string[] = [];
            const sitemapLocations = [
              `${baseDomain}/sitemap.xml`,
              `${baseDomain}/sitemap_index.xml`,
            ];
            
            for (const sitemapUrl of sitemapLocations) {
              try {
                const response = await fetch(sitemapUrl, { 
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                  signal: AbortSignal.timeout(5000)
                });
                if (response.ok) {
                  const xml = await response.text();
                  const locMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
                  for (const match of locMatches) {
                    const pageUrl = match[1].trim();
                    if (pageUrl.startsWith(baseDomain)) {
                      sitemapUrls.push(pageUrl);
                    }
                  }
                  if (sitemapUrls.length > 0) break;
                }
              } catch (e) {}
            }
            return sitemapUrls;
          };
          
          // Try to get URLs from sitemap first
          const sitemapUrls = await discoverFromSitemap();
          if (sitemapUrls.length > 0) {
            console.log(`Found ${sitemapUrls.length} URLs from sitemap`);
            urlsToScan.push(...sitemapUrls);
          }
          
          // Scan pages
          while (urlsToScan.length > 0 && scannedPages.length < maxPages) {
            const currentUrl = urlsToScan.shift()!;
            
            if (visitedUrls.has(currentUrl)) continue;
            visitedUrls.add(currentUrl);
            
            try {
              console.log(`Scanning page: ${currentUrl}`);
              const response = await fetch(currentUrl, {
                headers: { 
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                signal: AbortSignal.timeout(15000),
              });
              
              if (!response.ok) {
                console.log(`Failed to fetch ${currentUrl}: ${response.status}`);
                continue;
              }
              
              const html = await response.text();
              console.log(`Got HTML from ${currentUrl}, length: ${html.length}`);
              
              // Extract title
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              const title = titleMatch ? titleMatch[1].trim() : new URL(currentUrl).pathname || 'Home';
              
              // Extract text content - more aggressive cleaning
              let content = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
                .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
                .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
                .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 5000);
              
              // Extract meta description
              const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                                   html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
              const metaDesc = metaDescMatch ? metaDescMatch[1] : '';
              
              // Also extract h1, h2 headings for better context
              const h1Matches = html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi);
              const headings: string[] = [];
              for (const match of h1Matches) {
                headings.push(match[1].trim());
              }
              const h2Matches = html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi);
              for (const match of h2Matches) {
                headings.push(match[1].trim());
              }
              
              // Build content with metadata
              let fullContent = '';
              if (metaDesc) fullContent += `Description: ${metaDesc}\n`;
              if (headings.length > 0) fullContent += `Headings: ${headings.slice(0, 5).join(', ')}\n`;
              fullContent += `Content: ${content}`;
              
              // Lower the threshold - even pages with minimal content can be useful
              if (content.length > 50 || metaDesc || headings.length > 0) {
                scannedPages.push({ 
                  url: currentUrl, 
                  title, 
                  content: fullContent
                });
                console.log(`Added page: ${title} (${content.length} chars)`);
              }
              
              // Extract links for more pages (if sitemap didn't provide enough)
              if (sitemapUrls.length === 0) {
                const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi);
                for (const match of linkMatches) {
                  try {
                    const href = match[1];
                    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
                    
                    const fullUrl = href.startsWith('http') ? href : new URL(href, baseDomain).href;
                    if (fullUrl.startsWith(baseDomain) && !visitedUrls.has(fullUrl) && !urlsToScan.includes(fullUrl)) {
                      urlsToScan.push(fullUrl);
                    }
                  } catch (e) {}
                }
              }
            } catch (e) {
              console.log(`Failed to scan ${currentUrl}`);
            }
          }
          
          if (scannedPages.length === 0) {
            return res.status(400).json({ message: "Could not extract content from the website. Please check the URL." });
          }
          
          console.log(`Scanned ${scannedPages.length} pages from website`);
          
          // Build a comprehensive prompt from scanned content
          const websiteContent = scannedPages.map(page => 
            `### ${page.title}\nURL: ${page.url}\n${page.content.substring(0, 2000)}`
          ).join('\n\n---\n\n');
          
          finalPrompt = `Generate a modern, professional landing page based on the following website content. 
Extract the key information about the company/product, their services, unique selling points, and brand voice.
Create a compelling landing page that captures their brand essence.

Website URL: ${websiteUrl}
Number of pages scanned: ${scannedPages.length}

=== WEBSITE CONTENT ===
${websiteContent.substring(0, 15000)}
=== END CONTENT ===

Based on this content, generate a landing page that:
1. Captures the brand's voice and messaging
2. Highlights their main services/products
3. Uses appropriate call-to-action buttons
4. Includes relevant features/benefits
5. Suggests a color scheme that matches their brand`;
          
        } catch (scanError) {
          console.error("Website scanning error:", scanError);
          return res.status(400).json({ message: "Failed to scan the website. Please check the URL and try again." });
        }
      }

      // Helper function to generate fallback content from scanned pages
      const generateFallbackFromWebsite = (scannedPages: { url: string; title: string; content: string }[], url: string) => {
        // Extract company name from title
        const firstPage = scannedPages[0];
        const titleParts = firstPage?.title?.split(' - ') || [];
        const companyName = titleParts[0] || 'Your Company';
        const tagline = titleParts[1] || 'Professional Solutions for Your Business';
        
        // Collect all content for analysis
        const allContent = scannedPages.map(p => p.content).join(' ').toLowerCase();
        
        // Smart keyword extraction - filter out common words
        const stopWords = new Set(['about', 'contact', 'services', 'https', 'content', 'description', 
          'headings', 'the', 'and', 'for', 'our', 'your', 'with', 'that', 'this', 'from', 'have', 
          'will', 'are', 'you', 'can', 'all', 'more', 'what', 'how', 'who', 'when', 'where', 'which',
          'their', 'there', 'been', 'being', 'would', 'could', 'should', 'into', 'over', 'such',
          'only', 'other', 'just', 'also', 'than', 'then', 'some', 'these', 'those', 'each', 'every']);
        
        const words = allContent.split(/\s+/).filter(w => w.length > 4 && !stopWords.has(w));
        const wordFreq: Record<string, number> = {};
        words.forEach(word => {
          const cleanWord = word.replace(/[^a-z]/g, '');
          if (cleanWord.length > 4) {
            wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
          }
        });
        
        const topKeywords = Object.entries(wordFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([word]) => word);
        
        // Detect industry/business type from keywords
        const isWebDev = allContent.includes('website') || allContent.includes('development') || allContent.includes('wordpress');
        const isDesign = allContent.includes('design') || allContent.includes('ui/ux') || allContent.includes('creative');
        const isMarketing = allContent.includes('marketing') || allContent.includes('seo') || allContent.includes('digital');
        const isConsulting = allContent.includes('consulting') || allContent.includes('strategy') || allContent.includes('advisory');
        
        // Build smart features from page paths and content
        const featureMap: Record<string, { title: string; description: string }> = {};
        
        for (const page of scannedPages) {
          const pathName = new URL(page.url).pathname.replace(/^\//, '') || 'home';
          const content = page.content.toLowerCase();
          
          // Extract meaningful descriptions based on page type
          if (pathName === 'home' || pathName === '') {
            if (!featureMap['main']) {
              // Extract first meaningful sentence
              const sentences = page.content.split(/[.!?]/).filter(s => s.trim().length > 30);
              featureMap['main'] = {
                title: companyName,
                description: sentences[0]?.trim().substring(0, 150) || tagline
              };
            }
          } else if (pathName === 'services') {
            // Look for service keywords
            if (content.includes('wordpress')) {
              featureMap['wordpress'] = {
                title: 'WordPress Development',
                description: 'Fast, flexible CMS-powered websites with custom themes, plugins, and full content management.'
              };
            }
            if (content.includes('custom') && content.includes('code')) {
              featureMap['custom'] = {
                title: 'Custom Development',
                description: 'Hand-coded websites with React, TypeScript, Node.js. Full-stack with backend & database support.'
              };
            }
            if (content.includes('hosting') || content.includes('maintenance')) {
              featureMap['hosting'] = {
                title: 'Hosting & Maintenance',
                description: 'Cloud hosting, SSL certificates, daily backups, security monitoring, and priority support.'
              };
            }
            if (content.includes('design') || content.includes('ux')) {
              featureMap['design'] = {
                title: 'UX/UI Design',
                description: 'User-centered design that balances aesthetics with functionality and conversion goals.'
              };
            }
            if (content.includes('seo')) {
              featureMap['seo'] = {
                title: 'SEO Optimization',
                description: 'Search engine optimization to improve visibility and drive organic traffic to your site.'
              };
            }
          } else if (pathName === 'about') {
            if (!featureMap['about']) {
              featureMap['about'] = {
                title: 'About Us',
                description: 'A dedicated team focused on delivering exceptional work with transparent communication.'
              };
            }
          } else if (pathName === 'portfolio' || pathName === 'work' || pathName === 'projects') {
            if (!featureMap['portfolio']) {
              featureMap['portfolio'] = {
                title: 'Our Portfolio',
                description: 'Explore our recent projects. Each one built with care, delivered on time, and optimized for performance.'
              };
            }
          } else if (pathName === 'pricing') {
            if (!featureMap['pricing']) {
              featureMap['pricing'] = {
                title: 'Transparent Pricing',
                description: 'Clear, upfront pricing with no hidden fees. Choose the package that fits your needs.'
              };
            }
          } else if (pathName === 'contact') {
            // Skip contact in features, use for CTA
          } else {
            // Generic page
            if (Object.keys(featureMap).length < 6) {
              const cleanPath = pathName.charAt(0).toUpperCase() + pathName.slice(1).replace(/-/g, ' ');
              featureMap[pathName] = {
                title: cleanPath,
                description: page.content.substring(0, 150).replace(/^(Description:|Headings:|Content:)\s*/g, '').trim()
              };
            }
          }
        }
        
        // Convert feature map to array, prioritizing services
        const priorityOrder = ['wordpress', 'custom', 'design', 'seo', 'hosting', 'portfolio', 'pricing', 'main', 'about'];
        let features: { title: string; description: string }[] = [];
        
        for (const key of priorityOrder) {
          if (featureMap[key]) {
            features.push(featureMap[key]);
          }
        }
        
        // Add any remaining features
        for (const [key, value] of Object.entries(featureMap)) {
          if (!priorityOrder.includes(key) && features.length < 6) {
            features.push(value);
          }
        }
        
        // Limit to 4 best features
        features = features.slice(0, 4);
        
        // If still no features, create defaults based on detected industry
        if (features.length === 0) {
          if (isWebDev) {
            features = [
              { title: 'Web Development', description: 'Professional website development with modern technologies.' },
              { title: 'Responsive Design', description: 'Websites that look great on all devices.' },
              { title: 'Fast Performance', description: 'Optimized for speed and search engines.' },
              { title: 'Ongoing Support', description: 'Continuous maintenance and updates.' },
            ];
          } else {
            features = [
              { title: 'Quality Service', description: 'We deliver professional solutions tailored to your needs.' },
              { title: 'Expert Team', description: 'Our experienced team is ready to help you succeed.' },
              { title: 'Fast Delivery', description: 'Quick turnaround times without compromising quality.' },
              { title: 'Customer Focus', description: 'Your satisfaction is our top priority.' },
            ];
          }
        }
        
        // Determine color scheme based on industry
        let colorScheme = { primary: "#3b82f6", secondary: "#6366f1", background: "#ffffff" };
        if (isDesign) {
          colorScheme = { primary: "#ec4899", secondary: "#8b5cf6", background: "#ffffff" };
        } else if (isMarketing) {
          colorScheme = { primary: "#f97316", secondary: "#eab308", background: "#ffffff" };
        } else if (isWebDev) {
          colorScheme = { primary: "#0ea5e9", secondary: "#6366f1", background: "#ffffff" };
        }
        
        return {
          title: companyName,
          heroHeadline: `${companyName} - ${tagline}`,
          heroSubheadline: `Discover what ${companyName} can do for you. Professional services tailored to your needs.`,
          urgencyBadge: "🔥 Limited Time Offer - Get 20% OFF Today!",
          trustBadge: "★★★★★ Trusted by 500+ Happy Clients",
          problemStatement: "Are you struggling to find reliable, professional services that actually deliver results? Tired of agencies that overpromise and underdeliver?",
          solutionStatement: `${companyName} provides expert solutions with transparent pricing, dedicated support, and guaranteed results. We handle everything so you can focus on growing your business.`,
          benefits: features.map((f, i) => ({
            icon: ['🚀', '⚡', '🎯', '💎', '🔒', '📈'][i] || '✅',
            ...f
          })),
          features,
          socialProof: {
            stat1: { number: "500+", label: "Happy Clients" },
            stat2: { number: "5★", label: "Rating" },
            stat3: { number: "24/7", label: "Support" },
            stat4: { number: "100%", label: "Satisfaction" }
          },
          testimonials: [
            { quote: "Absolutely amazing work! They delivered exactly what we needed, on time and within budget. Highly recommend!", name: "Happy Client", role: "Business Owner", avatar: "H" },
            { quote: "Professional, responsive, and talented team. Our project exceeded all expectations.", name: "Satisfied Customer", role: "Marketing Director", avatar: "S" }
          ],
          pricing: {
            hasOffer: true,
            originalPrice: "$999",
            salePrice: "$799",
            discount: "20% OFF",
            planName: "Complete Package",
            priceSubtext: "Everything you need to succeed"
          },
          guarantee: "100% Satisfaction Guarantee - If you're not completely satisfied, we'll make it right or refund your money.",
          ctaPrimary: { text: "Get Started Now", url: `${url}/contact` },
          ctaSecondary: { text: "View Our Work", url: `${url}/portfolio` },
          ctaButtons: [
            { text: "Get a Quote", url: `${url}/contact` },
            { text: "View Our Work", url: `${url}/portfolio` },
          ],
          faq: [
            { question: "How long does a typical project take?", answer: "Most projects are completed within 2-4 weeks, depending on scope and complexity. We'll provide a detailed timeline before starting." },
            { question: "What if I'm not satisfied with the results?", answer: "Your satisfaction is guaranteed. We offer unlimited revisions and a money-back guarantee if we can't meet your expectations." },
            { question: "Do you provide ongoing support?", answer: "Absolutely! We offer various support packages to ensure your continued success after project completion." }
          ],
          seoKeywords: topKeywords.length > 0 ? topKeywords : ["professional", "services", "quality", "business"],
          colorScheme: { primary: colorScheme.primary, secondary: colorScheme.secondary, accent: "#22c55e", background: "#0f172a" },
        };
      };

      if (!apiKey) {
        // No API key - use fallback
        if (websiteUrl && scannedPages && scannedPages.length > 0) {
          pageContent = generateFallbackFromWebsite(scannedPages, websiteUrl);
        } else {
          pageContent = {
            title: "Generated Landing Page",
            heroText: "Transform Your Business Today",
            subheadline: "Discover the power of our innovative solutions designed to help you succeed.",
            features: [
              { title: "Feature One", description: "An amazing feature that helps your business grow." },
              { title: "Feature Two", description: "Another powerful capability to streamline operations." },
              { title: "Feature Three", description: "Enhanced security and reliability for peace of mind." },
            ],
            ctaButtons: [
              { text: "Get Started", url: "#" },
              { text: "Learn More", url: "#" },
            ],
            seoKeywords: ["business", "solutions", "innovation", "growth"],
            colorScheme: { primary: "#6366f1", secondary: "#8b5cf6", background: "#ffffff" },
          };
        }
      } else {
        try {
          const anthropic = new Anthropic({ apiKey });

          const completion = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 3000,
            system: `You are an expert marketing strategist and conversion copywriter. Generate high-converting promotional landing page content that SELLS.

Your goal is to create COMPELLING, PERSUASIVE content that drives action. Think like a direct response marketer.

Return ONLY a valid JSON object (no markdown, no code blocks) with these fields:
{
  "title": "Brand/Company name",
  "heroHeadline": "Power headline that grabs attention and states the BIG benefit (use numbers, specifics)",
  "heroSubheadline": "Supporting statement that expands on the promise and creates desire",
  "urgencyBadge": "Limited time offer text (e.g., '🔥 50% OFF - Ends Tonight!', '⚡ Only 5 Spots Left')",
  "trustBadge": "Social proof text (e.g., '★★★★★ Trusted by 10,000+ Customers', '🏆 Award-Winning Service')",
  "problemStatement": "Describe the pain point your audience faces (make them feel understood)",
  "solutionStatement": "How you solve their problem better than anyone else",
  "benefits": [
    {"icon": "emoji", "title": "Benefit headline", "description": "Specific, measurable benefit"}
  ] (4-6 compelling benefits with emojis),
  "features": [
    {"title": "Feature name", "description": "What it does and why it matters"}
  ] (3-4 key features),
  "socialProof": {
    "stat1": {"number": "100+", "label": "Happy Clients"},
    "stat2": {"number": "5★", "label": "Rating"},
    "stat3": {"number": "24/7", "label": "Support"},
    "stat4": {"number": "99%", "label": "Satisfaction"}
  },
  "testimonials": [
    {"quote": "Specific result-focused testimonial", "name": "Customer Name", "role": "Title/Company", "avatar": "initials"}
  ] (2-3 testimonials),
  "pricing": {
    "hasOffer": true,
    "originalPrice": "$999",
    "salePrice": "$499",
    "discount": "50% OFF",
    "planName": "Premium Package",
    "priceSubtext": "One-time payment • Lifetime access"
  },
  "guarantee": "Your money-back guarantee or risk reversal statement",
  "ctaPrimary": {"text": "Action-oriented CTA (e.g., 'Get Started Now', 'Claim Your Discount') - NO arrows in text", "url": "ACTUAL_WEBSITE_URL/contact or /get-started"},
  "ctaSecondary": {"text": "Secondary CTA - NO arrows", "url": "ACTUAL_WEBSITE_URL/portfolio or /services"},
  "faq": [
    {"question": "Common objection as question", "answer": "Overcome the objection"}
  ] (3-4 FAQs that handle objections),
  "seoKeywords": ["keyword1", "keyword2", ...],
  "colorScheme": {"primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#0f172a"}
}

COPYWRITING RULES:
1. Use power words: Free, New, Secret, Instant, Proven, Guaranteed, Limited, Exclusive
2. Include specific numbers and stats (not vague claims)
3. Focus on BENEFITS over features (what's in it for them?)
4. Create urgency without being sleazy
5. Address objections in FAQ
6. Make the CTA impossible to ignore
7. Use dark theme colors for modern SaaS look (dark background, vibrant accents)

IMPORTANT: Return ONLY the JSON object. No markdown code blocks.`,
            messages: [{ role: "user", content: finalPrompt }],
          });

          const responseText = completion.content[0].type === "text" ? completion.content[0].text : "{}";

          try {
            // Clean up the response - remove markdown code blocks if present
            let cleanedResponse = responseText.trim();
            
            // Remove ```json or ``` markers
            if (cleanedResponse.startsWith('```json')) {
              cleanedResponse = cleanedResponse.slice(7);
            } else if (cleanedResponse.startsWith('```')) {
              cleanedResponse = cleanedResponse.slice(3);
            }
            if (cleanedResponse.endsWith('```')) {
              cleanedResponse = cleanedResponse.slice(0, -3);
            }
            cleanedResponse = cleanedResponse.trim();
            
            pageContent = JSON.parse(cleanedResponse);
          } catch (parseError) {
            console.error("JSON parse error:", parseError, "Response was:", responseText.substring(0, 200));
            // If JSON parsing fails, use fallback from website scan
            if (websiteUrl && scannedPages && scannedPages.length > 0) {
              console.log("Using fallback content from scanned website");
              pageContent = generateFallbackFromWebsite(scannedPages, websiteUrl);
            } else {
              pageContent = {
                title: "Generated Landing Page",
                heroText: "Transform Your Business Today",
                subheadline: "AI-generated content",
                features: [],
                ctaButtons: [{ text: "Get Started", url: "#" }],
                seoKeywords: [],
                colorScheme: { primary: "#6366f1", secondary: "#8b5cf6", background: "#ffffff" },
              };
            }
          }
        } catch (apiError: any) {
          console.error("Anthropic API error:", apiError.message);
          // Fallback to generated content from website scan
          if (websiteUrl && scannedPages && scannedPages.length > 0) {
            console.log("Using fallback content from scanned website");
            pageContent = generateFallbackFromWebsite(scannedPages, websiteUrl);
          } else {
            pageContent = {
              title: "Generated Landing Page",
              heroText: "Transform Your Business Today",
              subheadline: "Discover the power of our innovative solutions.",
              features: [
                { title: "Quality", description: "We deliver exceptional quality in everything we do." },
                { title: "Speed", description: "Fast turnaround without compromising on quality." },
                { title: "Support", description: "Dedicated support to help you succeed." },
              ],
              ctaButtons: [{ text: "Get Started", url: "#" }],
              seoKeywords: ["business", "solutions", "quality"],
              colorScheme: { primary: "#6366f1", secondary: "#8b5cf6", background: "#ffffff" },
            };
          }
        }
      }

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${pageContent.heroSubheadline || pageContent.subheadline || ""}">
  <meta name="keywords" content="${(pageContent.seoKeywords || []).join(", ")}">
  <title>${pageContent.title || "Landing Page"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', system-ui, sans-serif; 
      line-height: 1.6; 
      color: #e2e8f0; 
      background: ${pageContent.colorScheme?.background || "#0f172a"}; 
    }
    
    /* Animations */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 20px ${pageContent.colorScheme?.primary || "#f97316"}40; } 50% { box-shadow: 0 0 40px ${pageContent.colorScheme?.primary || "#f97316"}60; } }
    .animate-fade-in { animation: fadeInUp 0.8s ease-out forwards; }
    .animate-delay-1 { animation-delay: 0.1s; opacity: 0; }
    .animate-delay-2 { animation-delay: 0.2s; opacity: 0; }
    .animate-delay-3 { animation-delay: 0.3s; opacity: 0; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-glow { animation: glow 2s ease-in-out infinite; }
    
    /* Navigation */
    .nav { 
      position: fixed; top: 0; left: 0; right: 0; 
      padding: 1rem 2rem; 
      background: ${pageContent.colorScheme?.background || "#0f172a"}ee; 
      backdrop-filter: blur(20px); 
      z-index: 100; 
      border-bottom: 1px solid #1e293b; 
    }
    .nav-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .nav-logo { font-weight: 800; font-size: 1.5rem; color: #fff; text-decoration: none; }
    .nav-logo span { color: ${pageContent.colorScheme?.primary || "#f97316"}; }
    .nav-cta { 
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"}); 
      color: #000; 
      padding: 0.75rem 1.5rem; 
      border-radius: 8px; 
      text-decoration: none; 
      font-weight: 700; 
      font-size: 0.875rem; 
      transition: all 0.3s;
      box-shadow: 0 4px 15px ${pageContent.colorScheme?.primary || "#f97316"}40;
    }
    .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 25px ${pageContent.colorScheme?.primary || "#f97316"}60; }
    
    /* Urgency Bar */
    .urgency-bar {
      background: linear-gradient(90deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"});
      color: #000;
      text-align: center;
      padding: 0.75rem 1rem;
      font-weight: 700;
      font-size: 0.95rem;
      position: fixed;
      top: 65px;
      left: 0;
      right: 0;
      z-index: 99;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
    }
    
    /* Hero */
    .hero { 
      padding: 200px 20px 100px; 
      text-align: center;
      position: relative;
      overflow: hidden;
      background: radial-gradient(ellipse at top, ${pageContent.colorScheme?.primary || "#f97316"}15 0%, transparent 50%);
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -50%; left: -50%; right: -50%; bottom: -50%;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      animation: float 20s linear infinite;
    }
    .hero-content { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }
    .trust-badge { 
      display: inline-flex; 
      align-items: center; 
      gap: 0.5rem; 
      background: #1e293b; 
      padding: 0.5rem 1rem; 
      border-radius: 50px; 
      font-size: 0.875rem; 
      color: ${pageContent.colorScheme?.secondary || "#eab308"};
      margin-bottom: 1.5rem;
      border: 1px solid #334155;
    }
    .hero h1 { 
      font-size: clamp(2.5rem, 6vw, 4rem); 
      margin-bottom: 1.5rem; 
      font-weight: 800; 
      letter-spacing: -0.03em; 
      line-height: 1.1;
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero h1 span { 
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero p { font-size: clamp(1.1rem, 2vw, 1.35rem); color: #94a3b8; max-width: 650px; margin: 0 auto 2.5rem; }
    
    /* CTA Buttons */
    .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }
    .cta-btn { 
      padding: 16px 36px; 
      border-radius: 12px; 
      text-decoration: none; 
      font-weight: 700; 
      font-size: 1.1rem;
      transition: all 0.3s ease; 
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .cta-btn:hover { transform: translateY(-3px); }
    .cta-primary { 
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"}); 
      color: #000;
      box-shadow: 0 8px 30px ${pageContent.colorScheme?.primary || "#f97316"}50;
    }
    .cta-primary:hover { box-shadow: 0 12px 40px ${pageContent.colorScheme?.primary || "#f97316"}70; }
    .cta-secondary { background: #1e293b; color: #fff; border: 2px solid #334155; }
    .cta-secondary:hover { border-color: ${pageContent.colorScheme?.primary || "#f97316"}; background: #334155; }
    
    /* Social Proof Stats */
    .social-proof { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 2rem; 
      max-width: 800px; 
      margin: 0 auto;
      padding: 2rem;
      background: #1e293b50;
      border-radius: 16px;
      border: 1px solid #334155;
    }
    .stat { text-align: center; }
    .stat-number { font-size: 2.5rem; font-weight: 800; color: ${pageContent.colorScheme?.primary || "#f97316"}; }
    .stat-label { font-size: 0.875rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    
    /* Problem/Solution Section */
    .problem-solution { 
      padding: 100px 20px; 
      max-width: 1000px; 
      margin: 0 auto;
    }
    .problem-box, .solution-box {
      padding: 3rem;
      border-radius: 20px;
      margin-bottom: 2rem;
    }
    .problem-box {
      background: linear-gradient(135deg, #7f1d1d20, #1e293b);
      border: 1px solid #7f1d1d40;
    }
    .problem-box h2 { color: #fca5a5; margin-bottom: 1rem; font-size: 1.75rem; }
    .solution-box {
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#f97316"}15, #1e293b);
      border: 1px solid ${pageContent.colorScheme?.primary || "#f97316"}30;
    }
    .solution-box h2 { color: ${pageContent.colorScheme?.primary || "#f97316"}; margin-bottom: 1rem; font-size: 1.75rem; }
    .problem-box p, .solution-box p { color: #94a3b8; font-size: 1.1rem; line-height: 1.8; }
    
    /* Benefits */
    .benefits { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 4rem; }
    .section-badge { 
      display: inline-block;
      background: ${pageContent.colorScheme?.primary || "#f97316"}20; 
      color: ${pageContent.colorScheme?.primary || "#f97316"}; 
      padding: 0.5rem 1.25rem; 
      border-radius: 50px; 
      font-size: 0.875rem; 
      font-weight: 600; 
      margin-bottom: 1rem;
      border: 1px solid ${pageContent.colorScheme?.primary || "#f97316"}30;
    }
    .section-title { font-size: 2.5rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 1rem; }
    .section-subtitle { color: #64748b; font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .benefit { 
      background: linear-gradient(135deg, #1e293b, #0f172a);
      padding: 2rem; 
      border-radius: 16px; 
      border: 1px solid #334155;
      transition: all 0.3s ease;
    }
    .benefit:hover { 
      border-color: ${pageContent.colorScheme?.primary || "#f97316"}50;
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .benefit-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .benefit h3 { font-size: 1.25rem; margin-bottom: 0.75rem; color: #fff; font-weight: 700; }
    .benefit p { color: #64748b; font-size: 0.95rem; line-height: 1.7; }
    
    /* Testimonials */
    .testimonials { padding: 100px 20px; background: #0f172a; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .testimonial { 
      background: #1e293b; 
      padding: 2rem; 
      border-radius: 16px;
      border: 1px solid #334155;
      position: relative;
    }
    .testimonial::before {
      content: '"';
      position: absolute;
      top: 1rem;
      left: 1.5rem;
      font-size: 4rem;
      color: ${pageContent.colorScheme?.primary || "#f97316"}30;
      font-family: Georgia, serif;
      line-height: 1;
    }
    .testimonial-text { font-size: 1.05rem; color: #e2e8f0; margin-bottom: 1.5rem; line-height: 1.8; font-style: italic; padding-top: 2rem; }
    .testimonial-author { display: flex; align-items: center; gap: 1rem; }
    .testimonial-avatar { 
      width: 50px; height: 50px; 
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"}); 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: #000; 
      font-weight: 700; 
      font-size: 1.1rem;
    }
    .testimonial-name { font-weight: 700; color: #fff; }
    .testimonial-role { font-size: 0.875rem; color: #64748b; }
    
    /* Pricing */
    .pricing { padding: 100px 20px; }
    .pricing-card {
      max-width: 500px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border-radius: 24px;
      padding: 3rem;
      border: 2px solid ${pageContent.colorScheme?.primary || "#f97316"}50;
      position: relative;
      overflow: hidden;
    }
    .pricing-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"});
    }
    .pricing-badge {
      position: absolute;
      top: 1.5rem;
      right: -2rem;
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"});
      color: #000;
      padding: 0.5rem 3rem;
      font-weight: 700;
      font-size: 0.875rem;
      transform: rotate(45deg);
    }
    .pricing-name { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
    .pricing-original { font-size: 1.25rem; color: #64748b; text-decoration: line-through; }
    .pricing-price { font-size: 4rem; font-weight: 800; color: ${pageContent.colorScheme?.primary || "#f97316"}; line-height: 1; margin: 1rem 0; }
    .pricing-subtext { color: #64748b; font-size: 0.95rem; margin-bottom: 2rem; }
    .pricing-features { list-style: none; margin-bottom: 2rem; }
    .pricing-features li { 
      padding: 0.75rem 0; 
      border-bottom: 1px solid #334155; 
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .pricing-features li::before { content: '✓'; color: ${pageContent.colorScheme?.primary || "#f97316"}; font-weight: 700; }
    .pricing-cta {
      width: 100%;
      padding: 1.25rem;
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#f97316"}, ${pageContent.colorScheme?.secondary || "#eab308"});
      color: #000;
      font-weight: 700;
      font-size: 1.1rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: block;
      text-align: center;
    }
    .pricing-cta:hover { transform: scale(1.02); box-shadow: 0 10px 30px ${pageContent.colorScheme?.primary || "#f97316"}50; }
    
    /* Guarantee */
    .guarantee {
      max-width: 600px;
      margin: 3rem auto 0;
      text-align: center;
      padding: 1.5rem;
      background: #1e293b50;
      border-radius: 12px;
      border: 1px solid #334155;
    }
    .guarantee-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .guarantee-text { color: #94a3b8; font-size: 0.95rem; }
    
    /* FAQ */
    .faq { padding: 100px 20px; max-width: 800px; margin: 0 auto; }
    .faq-item { 
      background: #1e293b; 
      border-radius: 12px; 
      margin-bottom: 1rem;
      border: 1px solid #334155;
      overflow: hidden;
    }
    .faq-question { 
      padding: 1.5rem; 
      font-weight: 600; 
      color: #fff;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .faq-answer { padding: 0 1.5rem 1.5rem; color: #94a3b8; line-height: 1.8; }
    
    /* Final CTA */
    .final-cta {
      padding: 100px 20px;
      text-align: center;
      background: linear-gradient(180deg, #0f172a, ${pageContent.colorScheme?.primary || "#f97316"}10);
    }
    .final-cta h2 { font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
    .final-cta p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; }
    
    /* Footer */
    .footer {
      background: #0f172a;
      color: #64748b;
      padding: 3rem 2rem;
      text-align: center;
      font-size: 0.875rem;
      border-top: 1px solid #1e293b;
    }
    
    @media (max-width: 768px) {
      .hero { padding: 180px 20px 60px; }
      .social-proof { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      .stat-number { font-size: 1.75rem; }
      .pricing-card { padding: 2rem; }
      .pricing-price { font-size: 3rem; }
      .testimonials-grid { grid-template-columns: 1fr; }
      .urgency-bar { font-size: 0.85rem; padding: 0.5rem; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-content">
      <a href="#" class="nav-logo">${pageContent.title || "Company"}<span>.</span></a>
      <a href="${pageContent.ctaPrimary?.url || pageContent.ctaButtons?.[0]?.url || (websiteUrl ? websiteUrl + '/contact' : '#')}" class="nav-cta animate-pulse">${(pageContent.ctaPrimary?.text || pageContent.ctaButtons?.[0]?.text || "Get Started").replace(/\s*→+\s*$/, '')} →</a>
    </div>
  </nav>

  ${pageContent.urgencyBadge ? `<div class="urgency-bar">${pageContent.urgencyBadge}</div>` : ''}

  <section class="hero">
    <div class="hero-content">
      ${pageContent.trustBadge ? `<div class="trust-badge animate-fade-in">${pageContent.trustBadge}</div>` : ''}
      <h1 class="animate-fade-in animate-delay-1">${pageContent.heroHeadline || pageContent.heroText || "Transform Your Business"}</h1>
      <p class="animate-fade-in animate-delay-2">${pageContent.heroSubheadline || pageContent.subheadline || ""}</p>
      <div class="cta-buttons animate-fade-in animate-delay-3">
        <a href="${pageContent.ctaPrimary?.url || pageContent.ctaButtons?.[0]?.url || (websiteUrl ? websiteUrl + '/contact' : '#')}" class="cta-btn cta-primary animate-glow">${(pageContent.ctaPrimary?.text || pageContent.ctaButtons?.[0]?.text || "Get Started").replace(/\s*→+\s*$/, '')} →</a>
        ${pageContent.ctaSecondary || pageContent.ctaButtons?.[1] ? `<a href="${pageContent.ctaSecondary?.url || pageContent.ctaButtons?.[1]?.url || (websiteUrl ? websiteUrl + '/portfolio' : '#')}" class="cta-btn cta-secondary">${(pageContent.ctaSecondary?.text || pageContent.ctaButtons?.[1]?.text || "Learn More").replace(/\s*→+\s*$/, '')}</a>` : ''}
      </div>
      
      ${pageContent.socialProof ? `
      <div class="social-proof animate-fade-in animate-delay-3">
        <div class="stat"><div class="stat-number">${pageContent.socialProof.stat1?.number || "100+"}</div><div class="stat-label">${pageContent.socialProof.stat1?.label || "Clients"}</div></div>
        <div class="stat"><div class="stat-number">${pageContent.socialProof.stat2?.number || "5★"}</div><div class="stat-label">${pageContent.socialProof.stat2?.label || "Rating"}</div></div>
        <div class="stat"><div class="stat-number">${pageContent.socialProof.stat3?.number || "24/7"}</div><div class="stat-label">${pageContent.socialProof.stat3?.label || "Support"}</div></div>
        <div class="stat"><div class="stat-number">${pageContent.socialProof.stat4?.number || "99%"}</div><div class="stat-label">${pageContent.socialProof.stat4?.label || "Satisfaction"}</div></div>
      </div>
      ` : ''}
    </div>
  </section>
  
  ${pageContent.problemStatement || pageContent.solutionStatement ? `
  <section class="problem-solution">
    ${pageContent.problemStatement ? `
    <div class="problem-box">
      <h2>😤 The Problem</h2>
      <p>${pageContent.problemStatement}</p>
    </div>
    ` : ''}
    ${pageContent.solutionStatement ? `
    <div class="solution-box">
      <h2>✨ The Solution</h2>
      <p>${pageContent.solutionStatement}</p>
    </div>
    ` : ''}
  </section>
  ` : ''}
  
  <section class="benefits">
    <div class="section-header">
      <span class="section-badge">Why Choose Us</span>
      <h2 class="section-title">Everything You Need to Succeed</h2>
      <p class="section-subtitle">We deliver real results that matter for your business</p>
    </div>
    <div class="benefits-grid">
      ${(pageContent.benefits || pageContent.features || [])
        .map((b: any) => `
          <div class="benefit">
            <div class="benefit-icon">${b.icon || '✅'}</div>
            <h3>${b.title}</h3>
            <p>${b.description}</p>
          </div>
        `)
        .join("")}
    </div>
  </section>
  
  ${pageContent.testimonials && pageContent.testimonials.length > 0 ? `
  <section class="testimonials">
    <div class="section-header">
      <span class="section-badge">Testimonials</span>
      <h2 class="section-title">What Our Clients Say</h2>
    </div>
    <div class="testimonials-grid">
      ${pageContent.testimonials.map((t: any) => `
        <div class="testimonial">
          <p class="testimonial-text">${t.quote}</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${t.avatar || t.name?.charAt(0) || 'A'}</div>
            <div>
              <div class="testimonial-name">${t.name}</div>
              <div class="testimonial-role">${t.role}</div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  </section>
  ` : ''}
  
  ${pageContent.pricing ? `
  <section class="pricing">
    <div class="section-header">
      <span class="section-badge">Special Offer</span>
      <h2 class="section-title">Limited Time Pricing</h2>
    </div>
    <div class="pricing-card">
      ${pageContent.pricing.discount ? `<div class="pricing-badge">${pageContent.pricing.discount}</div>` : ''}
      <div class="pricing-name">${pageContent.pricing.planName || 'Premium Package'}</div>
      ${pageContent.pricing.originalPrice ? `<div class="pricing-original">${pageContent.pricing.originalPrice}</div>` : ''}
      <div class="pricing-price">${pageContent.pricing.salePrice || pageContent.pricing.originalPrice || '$499'}</div>
      <div class="pricing-subtext">${pageContent.pricing.priceSubtext || 'One-time payment'}</div>
      <ul class="pricing-features">
        ${(pageContent.features || pageContent.benefits || []).slice(0, 5).map((f: any) => `<li>${f.title}</li>`).join("")}
      </ul>
      <a href="${pageContent.ctaPrimary?.url || (websiteUrl ? websiteUrl + '/contact' : '#')}" class="pricing-cta">${(pageContent.ctaPrimary?.text || 'Get Started Now').replace(/\s*→+\s*$/, '')} →</a>
    </div>
    ${pageContent.guarantee ? `
    <div class="guarantee">
      <div class="guarantee-icon">🛡️</div>
      <p class="guarantee-text">${pageContent.guarantee}</p>
    </div>
    ` : ''}
  </section>
  ` : ''}
  
  ${pageContent.faq && pageContent.faq.length > 0 ? `
  <section class="faq">
    <div class="section-header">
      <span class="section-badge">FAQ</span>
      <h2 class="section-title">Common Questions</h2>
    </div>
    ${pageContent.faq.map((f: any) => `
      <div class="faq-item">
        <div class="faq-question">${f.question} <span>+</span></div>
        <div class="faq-answer">${f.answer}</div>
      </div>
    `).join("")}
  </section>
  ` : ''}
  
  <section class="final-cta">
    <h2>Ready to Get Started?</h2>
    <p>Join hundreds of satisfied customers who have transformed their business with us.</p>
    <a href="${pageContent.ctaPrimary?.url || pageContent.ctaButtons?.[0]?.url || (websiteUrl ? websiteUrl + '/contact' : '#')}" class="cta-btn cta-primary animate-glow">${(pageContent.ctaPrimary?.text || pageContent.ctaButtons?.[0]?.text || "Get Started Now").replace(/\s*→+\s*$/, '')} →</a>
  </section>
  
  <footer class="footer">
    <p>© ${new Date().getFullYear()} ${pageContent.title || "Company"}. All rights reserved.</p>
  </footer>
  
  <script>
    // Simple FAQ toggle
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const answer = q.nextElementSibling;
        const isOpen = answer.style.display === 'block';
        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        document.querySelectorAll('.faq-question span').forEach(s => s.textContent = '+');
        if (!isOpen) {
          answer.style.display = 'block';
          q.querySelector('span').textContent = '−';
        }
      });
    });
    // Hide answers initially
    document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
  </script>
</body>
</html>`;

      const page = await storage.createGeneratedPage(userId, {
        prompt: websiteUrl ? `Generated from website: ${websiteUrl}` : prompt,
        title: pageContent.title,
        heroText: pageContent.heroText,
        subheadline: pageContent.subheadline,
        features: pageContent.features,
        ctaButtons: pageContent.ctaButtons,
        seoKeywords: pageContent.seoKeywords,
        colorScheme: pageContent.colorScheme,
        htmlContent,
      });

      // Increment landing page count after successful creation
      const usageUpdate = await storage.incrementLandingPageCount(userId);

      res.status(201).json({
        ...page,
        usage: {
          remaining: usageUpdate.limit - usageUpdate.newCount,
          limit: usageUpdate.limit,
          exceeded: usageUpdate.exceeded,
        },
      });
    } catch (error) {
      console.error("Error generating landing page:", error);
      res.status(500).json({ message: "Failed to generate landing page" });
    }
  });

  // Update landing page
  app.put("/api/landing-pages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const page = await storage.getGeneratedPageById(req.params.id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      if (page.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { title, heroText, subheadline, features, ctaButtons, colorScheme, htmlContent } = req.body;
      
      const updated = await storage.updateGeneratedPage(req.params.id, {
        title,
        heroText,
        subheadline,
        features,
        ctaButtons,
        colorScheme,
        htmlContent,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating landing page:", error);
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/landing-pages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const page = await storage.getGeneratedPageById(req.params.id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      if (page.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteGeneratedPage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting landing page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // ========== PROMOTIONAL POSTERS ==========
  
  // Get all posters for user
  app.get("/api/posters", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posters = await storage.getGeneratedPostersByUserId(userId);
      res.json(posters);
    } catch (error) {
      console.error("Error fetching posters:", error);
      res.status(500).json({ message: "Failed to fetch posters" });
    }
  });

  // Generate new poster
  app.post("/api/posters/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt, platform, size, websiteUrl } = req.body;

      if (!prompt && !websiteUrl) {
        return res.status(400).json({ message: "Either prompt or websiteUrl is required" });
      }

      const apiKey = process.env.ANTHROPIC_API_KEY;

      // Platform sizes
      const platformSizes: Record<string, Record<string, { width: number; height: number }>> = {
        instagram: {
          post: { width: 1080, height: 1080 },
          story: { width: 1080, height: 1920 },
          landscape: { width: 1080, height: 566 },
        },
        facebook: {
          post: { width: 1200, height: 630 },
          cover: { width: 820, height: 312 },
          story: { width: 1080, height: 1920 },
        },
        linkedin: {
          post: { width: 1200, height: 627 },
          cover: { width: 1584, height: 396 },
        },
        twitter: {
          post: { width: 1200, height: 675 },
          header: { width: 1500, height: 500 },
        },
      };

      const selectedPlatform = platform || 'instagram';
      const selectedSize = size || 'post';
      const dimensions = platformSizes[selectedPlatform]?.[selectedSize] || { width: 1080, height: 1080 };

      let posterContent: any;
      let finalPrompt = prompt || "";

      console.log("Poster generation request:", { prompt, websiteUrl, platform, size });
      console.log("API Key available:", !!apiKey);

      // If websiteUrl is provided, scan for brand info
      if (websiteUrl && !prompt) {
        try {
          const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
          const response = await fetch(urlObj.href, {
            headers: { 
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: AbortSignal.timeout(10000),
          });
          
          if (response.ok) {
            const html = await response.text();
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
            
            const title = titleMatch ? titleMatch[1].trim() : 'Your Brand';
            const description = metaDescMatch ? metaDescMatch[1] : '';
            
            finalPrompt = `Create a promotional poster for: ${title}. ${description}. Website: ${websiteUrl}`;
          }
        } catch (e) {
          finalPrompt = `Create a promotional poster for the business at ${websiteUrl}`;
        }
      }

      // Generate poster content with AI
      if (!apiKey) {
        // Fallback without AI
        console.log("No ANTHROPIC_API_KEY found - using default poster content");
        posterContent = {
          brandName: "Your Brand",
          headline: "Special Offer!",
          subheadline: "Limited Time Only",
          offerText: "50% OFF",
          ctaText: "Shop Now",
          colorScheme: {
            primary: "#6366f1",
            secondary: "#8b5cf6", 
            accent: "#f59e0b",
            background: "#0f172a",
            text: "#ffffff"
          }
        };
      } else {
        try {
          console.log("Calling Anthropic API with prompt:", finalPrompt.substring(0, 100) + "...");
          const anthropic = new Anthropic({ apiKey });

          const completion = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1500,
            system: `You are an expert graphic designer creating promotional posters for social media.
Generate compelling poster content that grabs attention and drives action.

Return ONLY a valid JSON object (no markdown, no code blocks) with:
{
  "brandName": "Company/Brand name",
  "headline": "Bold, attention-grabbing headline (max 6 words)",
  "subheadline": "Supporting text (max 10 words)", 
  "offerText": "The offer/discount (e.g., '50% OFF', 'FREE TRIAL', 'BUY 1 GET 1')",
  "ctaText": "Call to action button text (max 3 words)",
  "tagline": "Optional brand tagline",
  "features": ["Feature 1", "Feature 2", "Feature 3"] (optional, max 3),
  "colorScheme": {
    "primary": "#hex (vibrant brand color)",
    "secondary": "#hex (complementary color)",
    "accent": "#hex (highlight/CTA color)",
    "background": "#hex (dark or gradient base)",
    "text": "#ffffff"
  }
}

DESIGN RULES:
1. Headlines should be SHORT and PUNCHY
2. Use power words: FREE, NEW, LIMITED, EXCLUSIVE, SAVE
3. Create urgency with time-limited offers
4. Colors should be bold and high contrast
5. Keep text minimal - this is a visual poster

Platform: ${selectedPlatform}
Size: ${selectedSize} (${dimensions.width}x${dimensions.height})

Return ONLY the JSON object.`,
            messages: [{ role: "user", content: finalPrompt }],
          });

          const responseText = completion.content[0].type === "text" ? completion.content[0].text : "{}";
          console.log("Anthropic poster response:", responseText.substring(0, 300));

          try {
            let cleanedResponse = responseText.trim();
            if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7);
            if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3);
            if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3);
            posterContent = JSON.parse(cleanedResponse.trim());
            console.log("Parsed poster content:", posterContent);
          } catch (parseError) {
            console.error("Failed to parse poster AI response:", parseError);
            posterContent = {
              brandName: "Your Brand",
              headline: "Special Offer!",
              subheadline: "Don't Miss Out",
              offerText: "50% OFF",
              ctaText: "Shop Now",
              colorScheme: {
                primary: "#6366f1",
                secondary: "#8b5cf6",
                accent: "#f59e0b",
                background: "#0f172a",
                text: "#ffffff"
              }
            };
          }
        } catch (apiError) {
          console.error("Anthropic API error for poster:", apiError);
          posterContent = {
            brandName: "Your Brand",
            headline: "Amazing Offer!",
            subheadline: "Limited Time",
            offerText: "SAVE BIG",
            ctaText: "Get Started",
            colorScheme: {
              primary: "#6366f1",
              secondary: "#8b5cf6",
              accent: "#f59e0b",
              background: "#0f172a",
              text: "#ffffff"
            }
          };
        }
      }

      // Generate SVG poster
      const colors = posterContent.colorScheme || {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        background: "#0f172a",
        text: "#ffffff"
      };

      const isVertical = dimensions.height > dimensions.width;
      const isWide = dimensions.width > dimensions.height * 1.5;
      const w = dimensions.width;
      const h = dimensions.height;
      
      // Generate unique IDs for this poster to avoid conflicts
      const uid = Date.now().toString(36);
      
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="bg_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.background}"/>
      <stop offset="50%" stop-color="${colors.secondary}22"/>
      <stop offset="100%" stop-color="${colors.background}"/>
    </linearGradient>
    <linearGradient id="accent_${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.primary}"/>
      <stop offset="100%" stop-color="${colors.accent}"/>
    </linearGradient>
    <linearGradient id="shine_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow_${uid}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="shadow_${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg_${uid})"/>
  
  <!-- Decorative elements -->
  <circle cx="${w * 0.85}" cy="${h * 0.15}" r="${Math.min(w, h) * 0.25}" fill="${colors.primary}" opacity="0.08"/>
  <circle cx="${w * 0.1}" cy="${h * 0.85}" r="${Math.min(w, h) * 0.2}" fill="${colors.accent}" opacity="0.1"/>
  <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.35}" fill="${colors.secondary}" opacity="0.05"/>
  
  <!-- Top accent line -->
  <rect x="${w * 0.1}" y="${h * 0.04}" width="${w * 0.8}" height="4" rx="2" fill="url(#accent_${uid})" opacity="0.6"/>
  
  <!-- Offer badge -->
  <g transform="translate(${w * 0.5}, ${isVertical ? h * 0.18 : isWide ? h * 0.3 : h * 0.22})">
    <rect x="-${w * 0.35}" y="-${isVertical ? 45 : 35}" width="${w * 0.7}" height="${isVertical ? 90 : 70}" rx="${isVertical ? 45 : 35}" fill="url(#accent_${uid})" filter="url(#glow_${uid})"/>
    <rect x="-${w * 0.35}" y="-${isVertical ? 45 : 35}" width="${w * 0.7}" height="${(isVertical ? 90 : 70) / 2}" rx="${isVertical ? 45 : 35}" fill="url(#shine_${uid})"/>
    <text x="0" y="${isVertical ? 14 : 10}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${isVertical ? 48 : isWide ? 36 : 40}" font-weight="900" fill="#ffffff" letter-spacing="2">${posterContent.offerText || '50% OFF'}</text>
  </g>
  
  <!-- Main headline -->
  <text x="${w * 0.5}" y="${isVertical ? h * 0.38 : isWide ? h * 0.52 : h * 0.48}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${isVertical ? 64 : isWide ? 48 : 52}" font-weight="900" fill="${colors.text}" filter="url(#shadow_${uid})" letter-spacing="1">${posterContent.headline || 'SPECIAL OFFER'}</text>
  
  <!-- Subheadline -->
  <text x="${w * 0.5}" y="${isVertical ? h * 0.46 : isWide ? h * 0.62 : h * 0.58}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${isVertical ? 32 : isWide ? 24 : 28}" fill="${colors.text}" opacity="0.85" letter-spacing="0.5">${posterContent.subheadline || 'Limited Time Only'}</text>
  
  <!-- CTA Button -->
  <g transform="translate(${w * 0.5}, ${isVertical ? h * 0.75 : isWide ? h * 0.78 : h * 0.78})">
    <rect x="-${w * 0.28}" y="-${isVertical ? 40 : 32}" width="${w * 0.56}" height="${isVertical ? 80 : 64}" rx="${isVertical ? 40 : 32}" fill="${colors.accent}" filter="url(#shadow_${uid})"/>
    <rect x="-${w * 0.28}" y="-${isVertical ? 40 : 32}" width="${w * 0.56}" height="${(isVertical ? 80 : 64) / 2}" rx="${isVertical ? 40 : 32}" fill="url(#shine_${uid})" opacity="0.3"/>
    <text x="0" y="${isVertical ? 12 : 8}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${isVertical ? 34 : isWide ? 26 : 28}" font-weight="800" fill="#ffffff">${posterContent.ctaText || 'SHOP NOW'}</text>
  </g>
  
  <!-- Brand name -->
  <text x="${w * 0.5}" y="${isVertical ? h * 0.92 : h * 0.93}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${isVertical ? 26 : isWide ? 20 : 22}" font-weight="600" fill="${colors.text}" opacity="0.6" letter-spacing="2">${(posterContent.brandName || 'Your Brand').toUpperCase()}</text>
  
  <!-- Bottom accent line -->
  <rect x="${w * 0.3}" y="${h * 0.96}" width="${w * 0.4}" height="3" rx="1.5" fill="url(#accent_${uid})" opacity="0.5"/>
</svg>`;

      // Save to database
      const poster = await storage.createGeneratedPoster(userId, {
        prompt: websiteUrl ? `Generated from website: ${websiteUrl}` : prompt,
        title: posterContent.brandName || posterContent.headline,
        headline: posterContent.headline,
        subheadline: posterContent.subheadline,
        platform: selectedPlatform,
        size: selectedSize,
        offerText: posterContent.offerText,
        ctaText: posterContent.ctaText,
        colorScheme: colors,
        svgContent,
      });

      res.status(201).json(poster);
    } catch (error) {
      console.error("Error generating poster:", error);
      res.status(500).json({ message: "Failed to generate poster" });
    }
  });

  // Get single poster
  app.get("/api/posters/:id", isAuthenticated, async (req: any, res) => {
    try {
      const poster = await storage.getGeneratedPosterById(req.params.id);
      if (!poster) {
        return res.status(404).json({ message: "Poster not found" });
      }
      if (poster.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(poster);
    } catch (error) {
      console.error("Error fetching poster:", error);
      res.status(500).json({ message: "Failed to fetch poster" });
    }
  });

  // Update poster
  app.put("/api/posters/:id", isAuthenticated, async (req: any, res) => {
    try {
      const poster = await storage.getGeneratedPosterById(req.params.id);
      if (!poster) {
        return res.status(404).json({ message: "Poster not found" });
      }
      if (poster.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { title, headline, subheadline, offerText, ctaText, colorScheme, svgContent } = req.body;
      
      const updated = await storage.updateGeneratedPoster(req.params.id, {
        title,
        headline,
        subheadline,
        offerText,
        ctaText,
        colorScheme,
        svgContent,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating poster:", error);
      res.status(500).json({ message: "Failed to update poster" });
    }
  });

  // Delete poster
  app.delete("/api/posters/:id", isAuthenticated, async (req: any, res) => {
    try {
      const poster = await storage.getGeneratedPosterById(req.params.id);
      if (!poster) {
        return res.status(404).json({ message: "Poster not found" });
      }
      if (poster.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteGeneratedPoster(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting poster:", error);
      res.status(500).json({ message: "Failed to delete poster" });
    }
  });

  return httpServer;
}
