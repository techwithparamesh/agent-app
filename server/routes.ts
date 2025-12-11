import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAgentSchema, insertKnowledgeBaseSchema, insertGeneratedPageSchema } from "@shared/schema";
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
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();
    
    // Helper to send SSE message
    const sendProgress = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
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

      // Parse the base URL to get the domain
      const baseUrl = new URL(url as string);
      const baseDomain = baseUrl.origin;
      
      // Track visited URLs and pages to scan
      const visitedUrls = new Set<string>();
      const urlsToScan: string[] = [url as string];
      
      // Add any additional URLs provided by the user
      for (const additionalUrl of additionalUrls) {
        if (additionalUrl && typeof additionalUrl === 'string') {
          try {
            const fullUrl = additionalUrl.startsWith('http') 
              ? additionalUrl 
              : new URL(additionalUrl, baseDomain).href;
            if (!urlsToScan.includes(fullUrl)) {
              urlsToScan.push(fullUrl);
            }
          } catch (e) {}
        }
      }
      
      // ========== PUPPETEER BROWSER FOR SPA SCANNING ==========
      let browser: any = null;
      let usePuppeteer = false;
      let puppeteerAvailable = true; // Track if Puppeteer can be used
      
      // Helper function to fetch page with Puppeteer (for SPAs)
      const fetchWithPuppeteer = async (pageUrl: string): Promise<{ html: string; links: string[] }> => {
        if (!puppeteerAvailable) {
          throw new Error('Puppeteer not available');
        }
        
        if (!browser) {
          try {
            // Try to find system Chromium on Linux
            const chromiumPaths = [
              '/usr/bin/chromium-browser',
              '/usr/bin/chromium',
              '/snap/bin/chromium',
              '/usr/bin/google-chrome',
              '/usr/bin/google-chrome-stable',
            ];
            let executablePath: string | undefined;
            for (const p of chromiumPaths) {
              try {
                const fs = await import('fs');
                if (fs.existsSync(p)) {
                  executablePath = p;
                  break;
                }
              } catch (e) {}
            }
            
            browser = await puppeteer.launch({
              headless: true,
              executablePath,
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
            });
            sendProgress({ type: 'status', message: 'Browser launched for JavaScript rendering', progress: 10 });
          } catch (e: any) {
            console.error('Failed to launch Puppeteer:', e.message);
            puppeteerAvailable = false;
            sendProgress({ type: 'status', message: 'Puppeteer unavailable, using standard fetch', progress: 10 });
            throw e;
          }
        }
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        try {
          await page.goto(pageUrl, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const html = await page.content();
          
          const links = await page.evaluate((baseDomainArg: string) => {
            const anchors = document.querySelectorAll('a[href]');
            const foundLinks: string[] = [];
            anchors.forEach((a) => {
              const href = a.getAttribute('href');
              if (href && !href.startsWith('#') && !href.startsWith('javascript:') && 
                  !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                try {
                  const absoluteUrl = new URL(href, window.location.origin);
                  if (absoluteUrl.origin === baseDomainArg) {
                    foundLinks.push(absoluteUrl.href);
                  }
                } catch (e) {}
              }
            });
            return [...new Set(foundLinks)];
          }, baseDomain);
          
          await page.close();
          return { html, links };
        } catch (e) {
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
      
      const isSPASite = (html: string): boolean => {
        const spaIndicators = [
          /<div\s+id=["']root["']/i,
          /<div\s+id=["']app["']/i,
          /<div\s+id=["']__next["']/i,
          /react/i,
          /@vite\/client/i,
          /vue/i,
          /angular/i,
          /window\.__INITIAL_STATE__/i,
          /window\.__NUXT__/i,
        ];
        
        for (const indicator of spaIndicators) {
          if (indicator.test(html)) {
            console.log(`Detected SPA site (has SPA indicator)`);
            return true;
          }
        }
        
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          const cleanBody = bodyMatch[1]
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
          
          if (cleanBody.length < 100 && html.includes('<script')) {
            return true;
          }
        }
        
        return false;
      };
      
      const getCommonSPARoutes = (html: string): string[] => {
        const routes: string[] = [];
        const commonRoutes = [
          '/about', '/services', '/contact', '/portfolio', '/pricing',
          '/blog', '/team', '/faq', '/gallery', '/work', '/projects'
        ];
        
        const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
        const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.toLowerCase() || '';
        const combined = metaDesc + ' ' + title;
        
        if (combined.includes('interior') || combined.includes('design') || combined.includes('kitchen')) {
          routes.push('/modular-kitchen', '/bedroom', '/living-room', '/wardrobe', '/wardrobes',
            '/tv-unit', '/pooja-mandir', '/bathroom', '/book-consultation', '/our-work', '/testimonials');
        }
        
        if (combined.includes('shop') || combined.includes('store') || combined.includes('product')) {
          routes.push('/products', '/shop', '/cart', '/categories', '/collections');
        }
        
        if (combined.includes('agency') || combined.includes('company') || combined.includes('marketing')) {
          routes.push('/case-studies', '/clients', '/careers', '/testimonials', '/our-work');
        }
        
        return [...commonRoutes, ...routes];
      };
      
      const isErrorPage = (html: string, content: string): boolean => {
        const errorPatterns = [
          /404\s*(page)?\s*(not)?\s*found/i,
          /page\s*(not)?\s*found/i,
          /error\s*404/i,
        ];
        
        for (const pattern of errorPatterns) {
          if (pattern.test(html) || pattern.test(content)) {
            return true;
          }
        }
        return false;
      };
      
      const getContentHash = (content: string): string => {
        return content.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 500);
      };
      
      const extractLinks = (html: string, currentUrl: string): string[] => {
        const links: string[] = [];
        const linkPatterns = [/<a[^>]+href=["']([^"']+)["'][^>]*>/gi, /href=["']([^"']+)["']/gi];
        const foundHrefs = new Set<string>();
        
        for (const linkRegex of linkPatterns) {
          let match;
          while ((match = linkRegex.exec(html)) !== null) {
            foundHrefs.add(match[1].trim());
          }
        }
        
        for (let href of foundHrefs) {
          if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
          
          try {
            const absoluteUrl = new URL(href, currentUrl);
            if (absoluteUrl.origin === baseDomain) {
              absoluteUrl.hash = '';
              const normalizedUrl = absoluteUrl.href;
              if (!normalizedUrl.match(/\.(jpg|jpeg|png|gif|svg|webp|pdf|css|js|ico|woff|woff2|ttf|mp4|mp3)$/i)) {
                links.push(normalizedUrl);
              }
            }
          } catch (e) {}
        }
        
        return [...new Set(links)];
      };
      
      const extractContent = (html: string): { title: string; content: string } => {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        let title = titleMatch ? titleMatch[1].trim() : "Untitled Page";
        title = title.replace(/\s+/g, ' ').replace(/\|.*$/, '').replace(/-.*$/, '').trim() || "Untitled Page";
        
        const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
        
        let bodyContent = "";
        const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        
        if (mainMatch) {
          bodyContent = mainMatch[1];
        } else if (bodyMatch) {
          bodyContent = bodyMatch[1];
        } else {
          bodyContent = html;
        }
        
        bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
        bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
        bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
        bodyContent = bodyContent.replace(/<[^>]+>/g, " ");
        bodyContent = bodyContent.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
        
        let fullContent = metaDesc ? metaDesc + ". " : "";
        fullContent += bodyContent;
        
        if (fullContent.trim().length < 50 && metaDesc) {
          fullContent = `${title}. ${metaDesc}`;
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
      
      // STEP 2: Analyze homepage
      sendProgress({ type: 'status', message: 'Analyzing homepage...', progress: 15 });
      let homepageHtml = '';
      try {
        const homeResponse = await fetch(url as string, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(15000)
        });
        if (homeResponse.ok) {
          homepageHtml = await homeResponse.text();
          
          if (sitemapUrls.length === 0 && isSPASite(homepageHtml)) {
            sendProgress({ type: 'status', message: 'SPA detected - enabling JavaScript rendering...', progress: 18 });
            usePuppeteer = true;
            const commonRoutes = getCommonSPARoutes(homepageHtml);
            for (const route of commonRoutes) {
              try {
                const fullUrl = new URL(route, baseDomain).href;
                if (!urlsToScan.includes(fullUrl)) {
                  urlsToScan.push(fullUrl);
                }
              } catch (e) {}
            }
          }
        }
      } catch (e) {}
      
      sendProgress({ type: 'status', message: `Found ${urlsToScan.length} pages to scan`, progress: 20, totalPages: urlsToScan.length });
      
      // STEP 3: Crawl all pages with progress updates
      let scannedCount = 0;
      const totalToScan = Math.min(urlsToScan.length, maxPages);
      
      while (urlsToScan.length > 0 && scannedPages.length < maxPages) {
        const currentUrl = urlsToScan.shift()!;
        
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);
        
        scannedCount++;
        const progressPercent = Math.min(20 + Math.floor((scannedCount / totalToScan) * 70), 90);
        
        try {
          sendProgress({ 
            type: 'scanning', 
            message: `Scanning: ${new URL(currentUrl).pathname || '/'}`,
            currentUrl: currentUrl,
            scannedCount: scannedCount,
            totalPages: totalToScan,
            progress: progressPercent
          });
          
          let html = '';
          let discoveredLinks: string[] = [];
          
          if (usePuppeteer && puppeteerAvailable) {
            try {
              const result = await fetchWithPuppeteer(currentUrl);
              html = result.html;
              discoveredLinks = result.links;
            } catch (e: any) {
              // Puppeteer failed - fallback to regular fetch for this page
              console.log(`Puppeteer failed for ${currentUrl}, trying regular fetch...`);
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            try {
              const response = await fetch(currentUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
              
              if (!response.ok) continue;
              
              const contentType = response.headers.get('content-type') || '';
              if (!contentType.includes('text/html')) continue;
              
              html = await response.text();
            } catch (e) {
              clearTimeout(timeoutId);
              continue;
            }
          }
          
          if (isErrorPage(html, '')) continue;
          
          const { title, content } = extractContent(html);
          
          if (isErrorPage('', content)) continue;
          
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
              type: "website",
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

      // Parse the base URL to get the domain
      const baseUrl = new URL(url);
      const baseDomain = baseUrl.origin;
      
      // Track visited URLs and pages to scan
      const visitedUrls = new Set<string>();
      const urlsToScan: string[] = [url];
      
      // Add any additional URLs provided by the user (for SPAs where links are JS-rendered)
      if (additionalUrls && Array.isArray(additionalUrls)) {
        for (const additionalUrl of additionalUrls) {
          if (additionalUrl && typeof additionalUrl === 'string') {
            // If it's a relative path, convert to absolute
            try {
              const fullUrl = additionalUrl.startsWith('http') 
                ? additionalUrl 
                : new URL(additionalUrl, baseDomain).href;
              if (!urlsToScan.includes(fullUrl)) {
                urlsToScan.push(fullUrl);
              }
            } catch (e) {
              console.log(`Invalid additional URL: ${additionalUrl}`);
            }
          }
        }
      }
      
      // ========== PUPPETEER BROWSER FOR SPA SCANNING ==========
      let browser: any = null;
      let usePuppeteer = false;
      let puppeteerAvailable = true; // Track if Puppeteer can be used
      
      // Helper function to fetch page with Puppeteer (for SPAs)
      const fetchWithPuppeteer = async (pageUrl: string): Promise<{ html: string; links: string[] }> => {
        if (!puppeteerAvailable) {
          throw new Error('Puppeteer not available');
        }
        
        if (!browser) {
          try {
            // Try to find system Chromium on Linux
            const chromiumPaths = [
              '/usr/bin/chromium-browser',
              '/usr/bin/chromium',
              '/snap/bin/chromium',
              '/usr/bin/google-chrome',
              '/usr/bin/google-chrome-stable',
            ];
            let executablePath: string | undefined;
            for (const p of chromiumPaths) {
              try {
                const fs = await import('fs');
                if (fs.existsSync(p)) {
                  executablePath = p;
                  break;
                }
              } catch (e) {}
            }
            
            browser = await puppeteer.launch({
              headless: true,
              executablePath,
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
            });
            console.log('Puppeteer browser launched for SPA scanning');
          } catch (e: any) {
            console.error('Failed to launch Puppeteer:', e.message);
            puppeteerAvailable = false;
            throw e;
          }
        }
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        try {
          // Navigate and wait for network to be idle (JavaScript rendered)
          await page.goto(pageUrl, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          
          // Wait a bit more for any lazy-loaded content
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Get rendered HTML
          const html = await page.content();
          
          // Extract all links from rendered page
          const links = await page.evaluate((baseDomain: string) => {
            const anchors = document.querySelectorAll('a[href]');
            const foundLinks: string[] = [];
            anchors.forEach((a) => {
              const href = a.getAttribute('href');
              if (href && !href.startsWith('#') && !href.startsWith('javascript:') && 
                  !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                try {
                  const absoluteUrl = new URL(href, window.location.origin);
                  if (absoluteUrl.origin === baseDomain) {
                    foundLinks.push(absoluteUrl.href);
                  }
                } catch (e) {}
              }
            });
            return [...new Set(foundLinks)];
          }, baseDomain);
          
          await page.close();
          return { html, links };
        } catch (e) {
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
      
      // Common routes to try for SPAs without sitemaps
      const getCommonSPARoutes = (html: string): string[] => {
        const routes: string[] = [];
        
        // Standard pages most sites have
        const commonRoutes = [
          '/about', '/services', '/contact', '/portfolio', '/pricing',
          '/blog', '/team', '/faq', '/gallery', '/work', '/projects'
        ];
        
        // Detect industry from meta tags and add industry-specific routes
        const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
        const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.toLowerCase() || '';
        const combined = metaDesc + ' ' + title;
        
        // Interior design specific routes
        if (combined.includes('interior') || combined.includes('design') || combined.includes('kitchen') || 
            combined.includes('furniture') || combined.includes('home')) {
          routes.push(
            '/modular-kitchen', '/bedroom', '/living-room', '/wardrobe', '/wardrobes',
            '/tv-unit', '/pooja-mandir', '/bathroom', '/living-room/hall',
            '/book-consultation', '/our-work', '/testimonials'
          );
        }
        
        // E-commerce routes
        if (combined.includes('shop') || combined.includes('store') || combined.includes('buy') ||
            combined.includes('product')) {
          routes.push('/products', '/shop', '/cart', '/categories', '/collections');
        }
        
        // Agency/business routes
        if (combined.includes('agency') || combined.includes('company') || combined.includes('digital') ||
            combined.includes('marketing')) {
          routes.push('/case-studies', '/clients', '/careers', '/testimonials', '/our-work');
        }
        
        return [...commonRoutes, ...routes];
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
        const errorPatterns = [
          /404\s*(page)?\s*(not)?\s*found/i,
          /page\s*(not)?\s*found/i,
          /not\s*found/i,
          /error\s*404/i,
          /404\s*error/i,
          /page\s*doesn'?t\s*exist/i,
          /page\s*does\s*not\s*exist/i,
          /did you forget to add the page/i,
          /this page (doesn't|does not) exist/i,
          /oops.*not found/i,
          /sorry.*page.*not.*found/i,
          /we couldn'?t find/i
        ];
        
        for (const pattern of errorPatterns) {
          if (pattern.test(html) || pattern.test(content)) {
            return true;
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
          
          // If this is an SPA with no sitemap, add common routes and enable Puppeteer
          if (sitemapUrls.length === 0 && isSPASite(homepageHtml)) {
            console.log('SPA detected without sitemap - enabling Puppeteer for JavaScript rendering...');
            usePuppeteer = true;
            const commonRoutes = getCommonSPARoutes(homepageHtml);
            for (const route of commonRoutes) {
              try {
                const fullUrl = new URL(route, baseDomain).href;
                if (!urlsToScan.includes(fullUrl) && !visitedUrls.has(fullUrl)) {
                  urlsToScan.push(fullUrl);
                }
              } catch (e) {}
            }
            console.log(`Added ${commonRoutes.length} common SPA routes`);
          }
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
              console.log(`  Puppeteer failed for ${currentUrl}: ${e.message}, trying regular fetch...`);
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
  // ========== WIDGET CHAT (for embedded chatbots - no auth required) ==========
  app.post("/api/widget/chat", async (req: any, res) => {
    // Enable CORS for widget
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    
    try {
      const { agentId, message } = req.body;

      if (!agentId || !message) {
        return res.status(400).json({ message: "Agent ID and message are required" });
      }

      const agent = await storage.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Check if agent is active
      if (!agent.isActive) {
        return res.json({
          response: "This assistant is currently unavailable. Please try again later.",
        });
      }

      const knowledge = await storage.getKnowledgeByAgentId(agentId);
      const knowledgeContext = knowledge
        .slice(0, 10)
        .map((k) => k.content)
        .join("\n\n");

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
        return res.json({
          response: `Hi! I'm ${agent.name}. I'd be happy to help you! What would you like to know?`,
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

      res.json({ response: responseText });
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
      const { agentId, message } = req.body;
      const userId = req.user.claims.sub;

      if (!agentId || !message) {
        return res.status(400).json({ message: "Agent ID and message are required" });
      }

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

      const knowledge = await storage.getKnowledgeByAgentId(agentId);
      const knowledgeContext = knowledge
        .slice(0, 10)
        .map((k) => k.content)
        .join("\n\n");

      const systemPrompt = `You are ${agent.name}, an AI assistant.
${agent.description ? `Description: ${agent.description}` : ""}
Tone: ${agent.toneOfVoice || "friendly"}
Purpose: ${agent.purpose || "support"}

${knowledgeContext ? `Here is relevant information from the knowledge base:\n\n${knowledgeContext}\n\n` : ""}

Use this information to answer questions accurately. If you don't have relevant information, say so politely.`;

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        // Increment count even for fallback responses
        await storage.incrementMessageCount(userId);
        const updatedUsage = await storage.canSendMessage(userId);
        
        return res.json({
          response: `I'm ${agent.name}. I'd be happy to help you! However, the AI service is not configured yet. Please add your Anthropic API key to enable intelligent responses.`,
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

      // Increment message count after successful response
      await storage.incrementMessageCount(userId);
      const updatedUsage = await storage.canSendMessage(userId);

      res.json({ 
        response: responseText,
        usage: {
          remaining: updatedUsage.remaining,
          limit: updatedUsage.limit,
        },
      });
    } catch (error: any) {
      console.error("Error in chat:", error);
      
      // Check for specific error types
      if (error?.message?.includes('credit balance is too low') || 
          error?.error?.error?.message?.includes('credit balance')) {
        return res.json({
          response: "I'm sorry, but the AI service is currently unavailable due to insufficient API credits. Please contact the administrator to resolve this issue."
        });
      }
      
      if (error?.status === 401 || error?.message?.includes('invalid_api_key')) {
        return res.json({
          response: "The AI service is not properly configured. Please check the API key configuration."
        });
      }
      
      res.status(500).json({ message: "Failed to process chat message" });
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
          heroText: tagline,
          subheadline: `Discover what ${companyName} can do for you. Professional services tailored to your needs.`,
          features,
          ctaButtons: [
            { text: "Get a Quote", url: `${url}/contact` },
            { text: "View Our Work", url: `${url}/portfolio` },
          ],
          seoKeywords: topKeywords.length > 0 ? topKeywords : ["professional", "services", "quality", "business"],
          colorScheme,
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
            max_tokens: 2048,
            system: `You are a landing page content generator. Generate structured JSON content for a landing page based on the user's description or website content. Return a JSON object with these fields:
- title: Page title (compelling and relevant)
- heroText: Main headline (impactful, captures the brand essence)
- subheadline: Supporting text (expands on the headline)
- features: Array of {title, description} objects (3-4 items showing key offerings)
- ctaButtons: Array of {text, url} objects (1-2 items with action-oriented text)
- seoKeywords: Array of relevant keywords (4-6 items)
- colorScheme: Object with primary, secondary, and background hex colors (suggest colors that match the brand if content is from a website)

Return ONLY valid JSON, no other text.`,
            messages: [{ role: "user", content: finalPrompt }],
          });

          const responseText = completion.content[0].type === "text" ? completion.content[0].text : "{}";

          try {
            pageContent = JSON.parse(responseText);
          } catch {
            pageContent = {
              title: "Generated Landing Page",
              heroText: responseText.substring(0, 100),
              subheadline: "AI-generated content",
              features: [],
              ctaButtons: [{ text: "Get Started", url: "#" }],
              seoKeywords: [],
              colorScheme: { primary: "#6366f1", secondary: "#8b5cf6", background: "#ffffff" },
            };
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
  <meta name="description" content="${pageContent.subheadline || ""}">
  <meta name="keywords" content="${(pageContent.seoKeywords || []).join(", ")}">
  <title>${pageContent.title || "Landing Page"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #1f2937; background: #ffffff; }
    
    /* Navigation */
    .nav { position: fixed; top: 0; left: 0; right: 0; padding: 1rem 2rem; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 100; border-bottom: 1px solid #e5e7eb; }
    .nav-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .nav-logo { font-weight: 700; font-size: 1.25rem; color: ${pageContent.colorScheme?.primary || "#6366f1"}; text-decoration: none; }
    .nav-cta { background: ${pageContent.colorScheme?.primary || "#6366f1"}; color: white; padding: 0.5rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 0.875rem; transition: all 0.2s; }
    .nav-cta:hover { opacity: 0.9; transform: translateY(-1px); }
    
    /* Hero */
    .hero { 
      background: linear-gradient(135deg, ${pageContent.colorScheme?.primary || "#6366f1"} 0%, ${pageContent.colorScheme?.secondary || "#8b5cf6"} 100%); 
      color: white; 
      padding: 140px 20px 100px; 
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
    .hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
    .hero p { font-size: clamp(1rem, 2vw, 1.25rem); opacity: 0.9; max-width: 600px; margin: 0 auto 2.5rem; }
    .cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .cta-btn { 
      padding: 14px 32px; 
      border-radius: 8px; 
      text-decoration: none; 
      font-weight: 600; 
      font-size: 1rem;
      transition: all 0.2s ease; 
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
    .cta-primary { background: white; color: ${pageContent.colorScheme?.primary || "#6366f1"}; }
    .cta-secondary { background: rgba(255,255,255,0.15); color: white; border: 2px solid rgba(255,255,255,0.3); }
    .cta-secondary:hover { background: rgba(255,255,255,0.25); }
    
    /* Features */
    .features { padding: 100px 20px; max-width: 1200px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 4rem; }
    .section-label { 
      display: inline-block;
      background: ${pageContent.colorScheme?.primary || "#6366f1"}15; 
      color: ${pageContent.colorScheme?.primary || "#6366f1"}; 
      padding: 0.5rem 1rem; 
      border-radius: 20px; 
      font-size: 0.875rem; 
      font-weight: 600; 
      margin-bottom: 1rem; 
    }
    .features h2 { font-size: 2.5rem; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
    .feature { 
      background: #ffffff; 
      padding: 2rem; 
      border-radius: 16px; 
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }
    .feature:hover { 
      border-color: ${pageContent.colorScheme?.primary || "#6366f1"}40;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      transform: translateY(-4px);
    }
    .feature-icon {
      width: 48px;
      height: 48px;
      background: ${pageContent.colorScheme?.primary || "#6366f1"}15;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .feature-icon svg { width: 24px; height: 24px; color: ${pageContent.colorScheme?.primary || "#6366f1"}; }
    .feature h3 { font-size: 1.25rem; margin-bottom: 0.75rem; color: #111827; font-weight: 600; }
    .feature p { color: #6b7280; font-size: 0.95rem; line-height: 1.7; }
    
    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
      padding: 80px 20px;
      text-align: center;
    }
    .cta-section h2 { color: white; font-size: 2rem; margin-bottom: 1rem; font-weight: 700; }
    .cta-section p { color: #9ca3af; margin-bottom: 2rem; font-size: 1.1rem; }
    .cta-section .cta-btn { background: ${pageContent.colorScheme?.primary || "#6366f1"}; color: white; }
    
    /* Footer */
    .footer {
      background: #111827;
      color: #9ca3af;
      padding: 3rem 2rem;
      text-align: center;
      font-size: 0.875rem;
    }
    .footer a { color: ${pageContent.colorScheme?.primary || "#6366f1"}; text-decoration: none; }
    
    @media (max-width: 768px) {
      .hero { padding: 120px 20px 80px; }
      .features { padding: 60px 20px; }
      .cta-section { padding: 60px 20px; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-content">
      <a href="#" class="nav-logo">${pageContent.title || "Company"}</a>
      <a href="${pageContent.ctaButtons?.[0]?.url || "#"}" class="nav-cta">${pageContent.ctaButtons?.[0]?.text || "Get Started"}</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <h1>${pageContent.heroText || "Welcome"}</h1>
      <p>${pageContent.subheadline || ""}</p>
      <div class="cta-buttons">
        ${(pageContent.ctaButtons || [])
          .map(
            (btn: any, i: number) =>
              `<a href="${btn.url || "#"}" class="cta-btn ${i === 0 ? "cta-primary" : "cta-secondary"}">${btn.text}${i === 0 ? ' →' : ''}</a>`
          )
          .join("")}
      </div>
    </div>
  </section>
  
  <section class="features">
    <div class="section-header">
      <span class="section-label">What We Offer</span>
      <h2>Our Services</h2>
    </div>
    <div class="feature-grid">
      ${(pageContent.features || [])
        .map((f: any) => `
          <div class="feature">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3>${f.title}</h3>
            <p>${f.description}</p>
          </div>
        `)
        .join("")}
    </div>
  </section>
  
  <section class="cta-section">
    <h2>Ready to Get Started?</h2>
    <p>Let's build something amazing together.</p>
    <a href="${pageContent.ctaButtons?.[0]?.url || "#"}" class="cta-btn">${pageContent.ctaButtons?.[0]?.text || "Contact Us"} →</a>
  </section>
  
  <footer class="footer">
    <p>© ${new Date().getFullYear()} ${pageContent.title || "Company"}. All rights reserved.</p>
  </footer>
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
      
      const { title, heroText, subheadline, features, ctaButtons, htmlContent } = req.body;
      
      const updated = await storage.updateGeneratedPage(req.params.id, {
        title,
        heroText,
        subheadline,
        features,
        ctaButtons,
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

  return httpServer;
}
