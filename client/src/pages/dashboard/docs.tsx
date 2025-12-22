import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Search, ChevronDown, ChevronRight, Home, Rocket, Workflow, Book, Zap, 
  Grid3X3, MessageSquare, Shield, Code, HelpCircle, Star, BookOpen, Link2,
  Copy, Check, Info, AlertTriangle, Lightbulb, ArrowRight, ArrowLeft,
  ExternalLink, Terminal, Menu, X, Users, FileText, Bot, Sparkles
} from "lucide-react";
import { IntegrationDocs } from "@/components/integration-docs";

// =============================================================================
// SIDEBAR NAVIGATION - Simplified and cleaner
// =============================================================================

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  children?: { id: string; title: string }[];
}

const docSections: DocSection[] = [
  {
    id: "product-overview",
    title: "Product Overview",
    icon: Home,
    children: [
      { id: "what-is-this", title: "What is AgentForge?" },
      { id: "who-is-it-for", title: "Who is it for?" },
      { id: "key-benefits", title: "Key Benefits" },
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    children: [
      { id: "quick-start", title: "Quick Start (5 min)" },
      { id: "create-agent", title: "Create an Agent" },
      { id: "populate-knowledge", title: "Add Knowledge" },
    ],
  },
  {
    id: "how-it-works",
    title: "How It Works",
    icon: Workflow,
  },
  {
    id: "integration-apps",
    title: "Integration Apps",
    icon: Grid3X3,
  },
  {
    id: "whatsapp-guide",
    title: "WhatsApp AI Agent",
    icon: MessageSquare,
    children: [
      { id: "whatsapp-setup", title: "Setup Guide" },
      { id: "message-flow", title: "Message Flow" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: Code,
    children: [
      { id: "api-overview", title: "API Overview" },
      { id: "authentication", title: "Authentication" },
      { id: "endpoints", title: "Endpoints" },
    ],
  },
  {
    id: "faqs",
    title: "FAQs",
    icon: HelpCircle,
  },
  { id: "best-practices", title: "Best Practices", icon: Star },
  { id: "glossary", title: "Glossary", icon: BookOpen },
  { id: "resources", title: "Resources", icon: Link2 },
];

interface DocsSidebarProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

function DocsSidebar({ activeSection, onSectionClick }: DocsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["product-overview", "getting-started"]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleSectionClick = (sectionId: string, hasChildren: boolean) => {
    if (hasChildren) toggleSection(sectionId);
    onSectionClick(sectionId);
  };

  const filteredSections = searchQuery
    ? docSections.filter(
        (section) =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.children?.some((child) => child.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : docSections;

  return (
    <div className="flex flex-col h-full border-r bg-gradient-to-b from-muted/30 to-background">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search docs..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-9 bg-background border-muted-foreground/20 focus:border-primary transition-all" 
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-1">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            const hasChildren = section.children && section.children.length > 0;
            const isActive = activeSection === section.id || section.children?.some((child) => activeSection === child.id);

            return (
              <div key={section.id} className="animate-in fade-in duration-200">
                <button
                  onClick={() => handleSectionClick(section.id, !!hasChildren)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                    isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isActive ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="flex-1 text-left truncate">{section.title}</span>
                  {hasChildren && (
                    <span className={cn(
                      "shrink-0 transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )}>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </button>
                {hasChildren && isExpanded && (
                  <div className="ml-10 mt-1 space-y-1 border-l-2 border-muted pl-3 animate-in slide-in-from-top-2 duration-200">
                    {section.children!.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onSectionClick(child.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                          "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                          activeSection === child.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// DOCS COMPONENTS - Enhanced styling
// =============================================================================

function DocsCodeBlock({ children, language = "text", title }: { children: string; language?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-4 rounded-xl border bg-zinc-950 dark:bg-zinc-900 overflow-hidden shadow-lg">
      {title && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400 font-medium">{title}</span>
          </div>
          <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">{language}</Badge>
        </div>
      )}
      <div className="relative group">
        <pre className="overflow-x-auto p-4 text-sm text-zinc-100"><code className="font-mono">{children}</code></pre>
        <button 
          onClick={copyCode} 
          className="absolute right-3 top-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 transition-all duration-200 opacity-0 group-hover:opacity-100" 
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
        </button>
      </div>
    </div>
  );
}

type CalloutType = "info" | "warning" | "tip";
const calloutConfig: Record<CalloutType, { icon: React.ElementType; className: string }> = {
  info: { icon: Info, className: "border-l-4 border-blue-500 bg-blue-500/10" },
  warning: { icon: AlertTriangle, className: "border-l-4 border-amber-500 bg-amber-500/10" },
  tip: { icon: Lightbulb, className: "border-l-4 border-emerald-500 bg-emerald-500/10" },
};

function DocsCallout({ type = "info", title, children }: { type?: CalloutType; title?: string; children: React.ReactNode }) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  return (
    <div className={cn("my-6 rounded-xl p-4 transition-all duration-200 hover:shadow-md", config.className)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h5 className="font-semibold mb-1">{title}</h5>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent><CardDescription>{description}</CardDescription></CardContent>
    </Card>
  );
}

function StepItem({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-200">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-semibold mb-2">{title}</h4>
        <div className="text-muted-foreground text-sm">{children}</div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN DOCS CONTENT
// =============================================================================

export function DocsContent() {
  const [activeSection, setActiveSection] = useState("product-overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const headings = contentRef.current.querySelectorAll("section[id]");
      let currentActive = "product-overview";
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) currentActive = heading.id;
      });
      setActiveSection(currentActive);
    };
    const container = contentRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="flex h-full min-h-[calc(100vh-80px)]">
      {/* Mobile menu button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed top-20 left-4 z-50 lg:hidden shadow-lg bg-background" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 top-0 lg:top-auto bg-background",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <DocsSidebar activeSection={activeSection} onSectionClick={handleSectionClick} />
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <ScrollArea ref={contentRef} className="flex-1 px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* ================================================================= */}
          {/* PRODUCT OVERVIEW */}
          {/* ================================================================= */}
          <section id="product-overview" className="scroll-mt-8 mb-16 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Product Overview</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Learn what AgentForge is and how it can transform your customer interactions.</p>

            <div id="what-is-this" className="scroll-mt-20 mb-8">
              <h2 className="text-2xl font-semibold mb-4">What is AgentForge?</h2>
              <p className="text-muted-foreground leading-7 mb-4">
                AgentForge is a <strong>no-code AI platform</strong> that lets you create, train, and deploy AI chatbots for your website and WhatsApp. 
                The system scans your website or uploaded content, builds a knowledge base, and powers your chatbot to answer questions using your own data.
              </p>
              <DocsCallout type="info" title="No Technical Skills Required">
                You don't need any coding experience to build powerful AI agents. Everything is point-and-click!
              </DocsCallout>
            </div>

            <div id="who-is-it-for" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Who is it for?</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FeatureCard icon={Users} title="Business Owners" description="Automate customer support and capture leads 24/7 without hiring additional staff." />
                <FeatureCard icon={MessageSquare} title="Support Teams" description="Handle common questions automatically, freeing your team for complex issues." />
                <FeatureCard icon={Zap} title="Marketers" description="Engage visitors, qualify leads, and boost conversions with conversational AI." />
                <FeatureCard icon={Grid3X3} title="Agencies" description="Offer AI chatbot services to clients with white-label solutions." />
                <FeatureCard icon={Code} title="Developers" description="Integrate via API and webhooks for custom solutions." />
                <FeatureCard icon={Rocket} title="Startups" description="Launch fast with minimal setup and scale as you grow." />
              </div>
            </div>

            <div id="key-benefits" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Key Benefits</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "No coding required", desc: "Build powerful AI agents with our visual interface" },
                  { title: "Fast setup (under 10 minutes)", desc: "Go from zero to live chatbot in minutes" },
                  { title: "24/7 automated support", desc: "Never miss a customer question, even at 3am" },
                  { title: "Multi-channel deployment", desc: "Website widget, WhatsApp, and more" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* HOW IT WORKS */}
          {/* ================================================================= */}
          <section id="how-it-works" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">How It Works</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Understand the flow from setup to deployment.</p>

            <div className="space-y-8">
              <StepItem number={1} title="Sign up and log in">
                Create your free account at <a href="/signup" className="text-primary hover:underline font-medium">Sign Up</a> and verify your email.
              </StepItem>
              <StepItem number={2} title="Create an AI agent">
                In your dashboard, click <strong>My Agents → Create New Agent</strong>. Give it a name and choose the channel type.
              </StepItem>
              <StepItem number={3} title="Build your knowledge base">
                Scan your website automatically or upload documents (PDF, DOCX, TXT). The AI learns from your content.
              </StepItem>
              <StepItem number={4} title="Test your chatbot">
                Use the built-in test interface to ask questions and verify the responses are accurate.
              </StepItem>
              <StepItem number={5} title="Deploy">
                Add the widget to your website or connect WhatsApp. Your AI agent is now live!
              </StepItem>
              <StepItem number={6} title="Monitor and improve">
                Track conversations in Analytics, review responses, and continuously improve your knowledge base.
              </StepItem>
              <StepItem number={7} title="Integrate with 75+ apps">
                Connect Google Sheets, Slack, Shopify, and more using the workflow builder.
              </StepItem>
            </div>
          </section>

          {/* ================================================================= */}
          {/* GETTING STARTED */}
          {/* ================================================================= */}
          <section id="getting-started" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
              <Badge variant="secondary" className="animate-pulse">5 min setup</Badge>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Go from zero to a live chatbot in under 5 minutes.</p>

            <div id="quick-start" className="scroll-mt-20 mb-12">
              <h2 className="text-2xl font-semibold mb-6">Quick Start Guide</h2>
              
              <DocsCallout type="tip" title="Perfect for beginners">
                This guide is designed for non-technical users. No coding required!
              </DocsCallout>

              <div className="space-y-6 mt-6">
                <StepItem number={1} title="Create an account">
                  Go to <a href="/signup" className="text-primary hover:underline font-medium">Sign Up</a>, enter your name and email, then confirm your account via the verification email.
                </StepItem>
                <StepItem number={2} title="Create an agent">
                  In the dashboard click <strong>My Agents → Create New Agent</strong>. Choose <em>Website</em> or <em>WhatsApp</em> and give it a descriptive name.
                </StepItem>
                <StepItem number={3} title="Scan your website">
                  From the agent page choose <strong>Scan Website</strong>, enter your site URL and start the scan. The system extracts pages, FAQs and text automatically.
                </StepItem>
                <StepItem number={4} title="Test your agent">
                  Open <strong>Test Agents</strong>, pick your agent, ask a question and verify the response is accurate.
                </StepItem>
                <StepItem number={5} title="Deploy the widget">
                  Copy the widget snippet and paste it into your website before the closing <code className="bg-muted px-2 py-1 rounded-lg text-sm font-mono">&lt;/body&gt;</code> tag.
                </StepItem>
              </div>
            </div>

            <div id="create-agent" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Create and Configure an Agent</h2>
              <div className="space-y-4">
                <StepItem number={1} title="Open the dashboard">Click <strong>My Agents</strong> in the sidebar.</StepItem>
                <StepItem number={2} title="Create new agent">Click <strong>Create New Agent</strong> and enter a friendly name and description.</StepItem>
                <StepItem number={3} title="Choose channel type">Select <strong>Website</strong> (widget) or <strong>WhatsApp</strong> (messaging).</StepItem>
                <StepItem number={4} title="Save">Click Save and you'll be taken to the agent details page.</StepItem>
              </div>
            </div>

            <div id="populate-knowledge" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Populate Knowledge</h2>
              <p className="text-muted-foreground mb-4">Your agent's intelligence comes from the knowledge you provide. There are two main ways to add knowledge:</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Website Scanning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. From the agent page, click <strong>Scan Website</strong></p>
                    <p>2. Enter the URL you want scanned</p>
                    <p>3. Wait for the scan to complete</p>
                    <p>4. Review and remove any irrelevant content</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Manual Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. Go to <strong>Knowledge → Add Knowledge</strong></p>
                    <p>2. Paste text, upload PDFs, DOCX files</p>
                    <p>3. Or provide URLs to specific pages</p>
                    <p>4. Review and organize your entries</p>
                  </CardContent>
                </Card>
              </div>

              <DocsCallout type="warning" title="Scan Tip">
                If your website requires login or has restricted areas, those pages won't be scanned. Make sure the content is publicly accessible.
              </DocsCallout>
            </div>
          </section>

          {/* ================================================================= */}
          {/* INTEGRATION APPS - n8n-style Professional Documentation */}
          {/* ================================================================= */}
          <section id="integration-apps" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Grid3X3 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Integration Documentation</h1>
              <Badge variant="secondary">75+ Apps</Badge>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Professional, n8n-style documentation for all supported integrations. Each integration includes detailed setup instructions, operations, triggers, actions, examples, and troubleshooting guides.
            </p>

            {/* Embedded Integration Docs Component */}
            <div className="border rounded-2xl overflow-hidden bg-card min-h-[600px] shadow-lg">
              <IntegrationDocs />
            </div>
          </section>

          {/* ================================================================= */}
          {/* WHATSAPP GUIDE */}
          {/* ================================================================= */}
          <section id="whatsapp-guide" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">WhatsApp AI Agent</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Deploy your AI agent on WhatsApp for instant customer support.</p>

            <div id="whatsapp-setup" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Setup Guide</h2>
              <div className="space-y-4">
                <StepItem number={1} title="Connect WhatsApp Business">Go to <strong>Integrations → WhatsApp</strong> and connect your WhatsApp Business account.</StepItem>
                <StepItem number={2} title="Assign Phone Number">Link a phone number to your AI agent.</StepItem>
                <StepItem number={3} title="Configure Agent">Set up your knowledge base and test responses.</StepItem>
                <StepItem number={4} title="Activate">Toggle the integration to active.</StepItem>
              </div>
            </div>

            <div id="message-flow" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Message Flow</h2>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center p-8 bg-gradient-to-br from-muted/30 to-background rounded-2xl border">
                <div className="text-center p-4 bg-card rounded-xl border shadow-md hover:shadow-lg transition-all duration-200">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">Customer sends message</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4 bg-card rounded-xl border shadow-md hover:shadow-lg transition-all duration-200">
                  <Workflow className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">Platform processes</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4 bg-card rounded-xl border shadow-md hover:shadow-lg transition-all duration-200">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm font-medium">AI finds answer</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4 bg-card rounded-xl border shadow-md hover:shadow-lg transition-all duration-200">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">Reply sent</p>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* API REFERENCE */}
          {/* ================================================================= */}
          <section id="api-reference" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Code className="h-6 w-6 text-violet-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Integrate AgentForge with your own applications.</p>

            <div id="api-overview" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">API Overview</h2>
              <p className="text-muted-foreground mb-4">The AgentForge API allows you to programmatically interact with your AI agents.</p>
              <DocsCodeBlock language="bash" title="Base URL">{`https://api.agentforge.app/v1`}</DocsCodeBlock>
            </div>

            <div id="authentication" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>
              <p className="text-muted-foreground mb-4">All API requests require an API key in the header:</p>
              <DocsCodeBlock language="bash" title="Authentication Header">{`Authorization: Bearer YOUR_API_KEY`}</DocsCodeBlock>
            </div>

            <div id="endpoints" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
              <div className="space-y-4">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm font-mono">/chat</code>
                    </div>
                    <CardDescription>Send a message to an AI agent</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500">GET</Badge>
                      <code className="text-sm font-mono">/agents</code>
                    </div>
                    <CardDescription>List all your AI agents</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500">GET</Badge>
                      <code className="text-sm font-mono">/conversations</code>
                    </div>
                    <CardDescription>Retrieve conversation history</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* FAQS */}
          {/* ================================================================= */}
          <section id="faqs" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <HelpCircle className="h-6 w-6 text-amber-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
            </div>

            <div className="space-y-4 mt-6">
              {[
                { q: "How long does it take to set up?", a: "Most users are live in under 10 minutes." },
                { q: "Do I need to code?", a: "No, everything is point-and-click." },
                { q: "Can I use my own data?", a: "Yes, scan your website or upload documents." },
                { q: "Can I use both WhatsApp and website chat?", a: "Yes, you can deploy on both channels." },
                { q: "What's included in the free plan?", a: "1 agent, 100 messages/month, and basic integrations." },
              ].map((faq, i) => (
                <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="pb-2"><CardTitle className="text-base">{faq.q}</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{faq.a}</p></CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* ================================================================= */}
          {/* BEST PRACTICES */}
          {/* ================================================================= */}
          <section id="best-practices" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Best Practices</h1>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {[
                "Use clear, simple language in your knowledge base", 
                "Add FAQs and common questions", 
                "Keep answers concise and relevant", 
                "Regularly update your knowledge base", 
                "Test with real user questions", 
                "Remove outdated information"
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ================================================================= */}
          {/* GLOSSARY */}
          {/* ================================================================= */}
          <section id="glossary" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10">
                <BookOpen className="h-6 w-6 text-indigo-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
            </div>
            <div className="mt-6 border rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left font-semibold">Term</th><th className="px-4 py-3 text-left font-semibold">Definition</th></tr></thead>
                <tbody>
                  {[
                    ["Agent", "An AI chatbot you create on the platform"],
                    ["Knowledge", "The information your agent uses to answer questions"],
                    ["Widget", "The chat bubble you add to your website"],
                    ["Integration", "Connecting your agent to other apps"],
                    ["Trigger", "An event that starts a workflow"],
                    ["Action", "What happens after a trigger"],
                  ].map(([term, def], i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors"><td className="px-4 py-3 font-medium">{term}</td><td className="px-4 py-3 text-muted-foreground">{def}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ================================================================= */}
          {/* RESOURCES */}
          {/* ================================================================= */}
          <section id="resources" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-cyan-500/10">
                <Link2 className="h-6 w-6 text-cyan-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {[
                { href: "/signup", label: "Sign Up" },
                { href: "/login", label: "Login" },
                { href: "mailto:support@agentforge.app", label: "Contact Support" },
                { href: "/pricing", label: "Pricing" },
              ].map((link, i) => (
                <a 
                  key={i}
                  href={link.href} 
                  className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 group"
                >
                  <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                  <span className="font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
}

export default function Docs() {
  return (
    <DashboardLayout title="Product Documentation">
      <DocsContent />
    </DashboardLayout>
  );
}
