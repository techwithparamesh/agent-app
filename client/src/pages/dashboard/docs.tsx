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
  ExternalLink, Terminal, Menu, X, ChevronUp, Users, FileText, Bot
} from "lucide-react";

// =============================================================================
// SIDEBAR NAVIGATION
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
      { id: "use-cases", title: "Use Cases" },
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    children: [
      { id: "quick-start", title: "Quick Start (5 min)" },
      { id: "prerequisites", title: "Prerequisites" },
      { id: "create-agent", title: "Create an Agent" },
      { id: "populate-knowledge", title: "Add Knowledge" },
    ],
  },
  {
    id: "how-it-works",
    title: "How It Works",
    icon: Workflow,
    children: [
      { id: "architecture", title: "Architecture" },
      { id: "ai-engine", title: "AI Engine" },
      { id: "knowledge-base-how", title: "Knowledge Base" },
    ],
  },
  {
    id: "user-guide",
    title: "User Guide",
    icon: Book,
    children: [
      { id: "dashboard-overview", title: "Dashboard Overview" },
      { id: "managing-agents", title: "Managing Agents" },
      { id: "knowledge-management", title: "Knowledge Management" },
      { id: "test-chatbot", title: "Test the Chatbot" },
      { id: "deploy-website", title: "Deploy on Website" },
      { id: "deploy-whatsapp", title: "Deploy on WhatsApp" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Zap,
    children: [
      { id: "integrations-overview", title: "Overview" },
      { id: "workflow-builder", title: "Workflow Builder" },
      { id: "triggers-actions", title: "Triggers & Actions" },
      { id: "field-mapping", title: "Field Mapping" },
    ],
  },
  {
    id: "integration-apps",
    title: "Integration Apps",
    icon: Grid3X3,
    children: [
      { id: "communication-apps", title: "Communication" },
      { id: "email-apps", title: "Email" },
      { id: "crm-apps", title: "CRM & Sales" },
      { id: "ecommerce-apps", title: "E-commerce" },
      { id: "productivity-apps", title: "Productivity" },
      { id: "database-apps", title: "Databases" },
      { id: "developer-apps", title: "Developer Tools" },
    ],
  },
  {
    id: "whatsapp-guide",
    title: "WhatsApp AI Agent",
    icon: MessageSquare,
    children: [
      { id: "whatsapp-setup", title: "Setup Guide" },
      { id: "message-flow", title: "Message Flow" },
      { id: "whatsapp-templates", title: "Message Templates" },
      { id: "whatsapp-errors", title: "Error Handling" },
    ],
  },
  {
    id: "admin-guide",
    title: "Admin Guide",
    icon: Shield,
    children: [
      { id: "user-management", title: "User Management" },
      { id: "agent-management", title: "Agent Management" },
      { id: "conversations", title: "Conversations" },
      { id: "analytics", title: "Analytics & Logs" },
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
      { id: "webhooks-api", title: "Webhooks" },
    ],
  },
  {
    id: "faqs",
    title: "FAQs",
    icon: HelpCircle,
    children: [
      { id: "general-faqs", title: "General" },
      { id: "troubleshooting", title: "Troubleshooting" },
    ],
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
    <div className="flex flex-col h-full border-r bg-muted/30">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search docs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-background" />
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
              <div key={section.id}>
                <button
                  onClick={() => handleSectionClick(section.id, !!hasChildren)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{section.title}</span>
                  {hasChildren && <span className="shrink-0">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>}
                </button>
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l pl-3">
                    {section.children!.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onSectionClick(child.id)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
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
      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

// =============================================================================
// DOCS COMPONENTS
// =============================================================================

function DocsCodeBlock({ children, language = "text", title }: { children: string; language?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-4 rounded-lg border bg-zinc-950 dark:bg-zinc-900">
      {title && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">{title}</span>
          </div>
          <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">{language}</Badge>
        </div>
      )}
      <div className="relative">
        <pre className="overflow-x-auto p-4 text-sm text-zinc-100"><code className="font-mono">{children}</code></pre>
        <button onClick={copyCode} className="absolute right-2 top-2 p-2 rounded-md hover:bg-zinc-800 transition-colors" aria-label="Copy code">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-zinc-400" />}
        </button>
      </div>
    </div>
  );
}

type CalloutType = "info" | "warning" | "tip";
const calloutConfig: Record<CalloutType, { icon: React.ElementType; className: string }> = {
  info: { icon: Info, className: "border-blue-500/50 bg-blue-500/10" },
  warning: { icon: AlertTriangle, className: "border-yellow-500/50 bg-yellow-500/10" },
  tip: { icon: Lightbulb, className: "border-purple-500/50 bg-purple-500/10" },
};

function DocsCallout({ type = "info", title, children }: { type?: CalloutType; title?: string; children: React.ReactNode }) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  return (
    <div className={cn("my-6 rounded-lg border-l-4 p-4", config.className)}>
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
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent><CardDescription>{description}</CardDescription></CardContent>
    </Card>
  );
}

function StepItem({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">{number}</div>
      <div className="flex-1 pt-1">
        <h4 className="font-semibold mb-2">{title}</h4>
        <div className="text-muted-foreground text-sm">{children}</div>
      </div>
    </div>
  );
}

// Integration details component
interface IntegrationDetailProps {
  name: string;
  description: string;
  useCases: string[];
  howToConnect: string[];
  triggers: string[];
  actions: string[];
  exampleCode?: string;
  troubleshooting?: string[];
}

function IntegrationDetail({ name, description, useCases, howToConnect, triggers, actions, exampleCode, troubleshooting }: IntegrationDetailProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border rounded-lg mb-3 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
        <span className="font-semibold">{name}</span>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t bg-muted/20">
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium mb-2 text-sm">Use Cases</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {useCases.map((uc, i) => <li key={i}>• {uc}</li>)}
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2 text-sm">How to Connect</h5>
              <ol className="text-sm text-muted-foreground space-y-1">
                {howToConnect.map((step, i) => <li key={i}>{i + 1}. {step}</li>)}
              </ol>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium mb-2 text-sm">Triggers</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {triggers.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2 text-sm">Actions</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {actions.map((a, i) => <li key={i}>• {a}</li>)}
              </ul>
            </div>
          </div>
          {exampleCode && <DocsCodeBlock language="json" title="Example Payload">{exampleCode}</DocsCodeBlock>}
          {troubleshooting && troubleshooting.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium mb-2 text-sm">Troubleshooting</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {troubleshooting.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
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
    <div className="flex h-[calc(100vh-80px)]">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="fixed top-20 left-4 z-50 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 top-0 lg:top-auto",
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
          <section id="product-overview" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
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
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">No coding required</h4>
                    <p className="text-sm text-muted-foreground">Build powerful AI agents with our visual interface</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Fast setup (under 10 minutes)</h4>
                    <p className="text-sm text-muted-foreground">Go from zero to live chatbot in minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">24/7 automated support</h4>
                    <p className="text-sm text-muted-foreground">Never miss a customer question, even at 3am</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Multi-channel deployment</h4>
                    <p className="text-sm text-muted-foreground">Website widget, WhatsApp, and more</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="use-cases" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
              <div className="space-y-3">
                {["Customer support automation", "Lead capture and qualification", "FAQ bots", "Appointment booking", "Product recommendations", "Order status inquiries"].map((useCase, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span>{useCase}</span>
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
              <div className="p-2 rounded-lg bg-primary/10">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">How It Works</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Understand the flow from setup to deployment.</p>

            <div className="space-y-6">
              <StepItem number={1} title="Sign up and log in">
                Create your free account at <a href="/signup" className="text-primary hover:underline">Sign Up</a> and verify your email.
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
              <StepItem number={7} title="Integrate with 50+ apps">
                Connect Google Sheets, Slack, Shopify, and more using the workflow builder.
              </StepItem>
            </div>
          </section>

          {/* ================================================================= */}
          {/* GETTING STARTED */}
          {/* ================================================================= */}
          <section id="getting-started" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
              <Badge variant="secondary">5 min setup</Badge>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Go from zero to a live chatbot in under 5 minutes.</p>

            <div id="quick-start" className="scroll-mt-20 mb-12">
              <h2 className="text-2xl font-semibold mb-6">Quick Start Guide</h2>
              
              <DocsCallout type="tip" title="Perfect for beginners">
                This guide is designed for non-technical users. No coding required!
              </DocsCallout>

              <div className="space-y-6 mt-6">
                <StepItem number={1} title="Create an account">
                  Go to <a href="/signup" className="text-primary hover:underline">Sign Up</a>, enter your name and email, then confirm your account via the verification email.
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
                  Copy the widget snippet and paste it into your website before the closing <code className="bg-muted px-1.5 py-0.5 rounded text-sm">&lt;/body&gt;</code> tag.
                </StepItem>
              </div>
            </div>

            <div id="prerequisites" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">AgentForge Account</h4>
                    <p className="text-sm text-muted-foreground">A registered account with email confirmed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Website Access</h4>
                    <p className="text-sm text-muted-foreground">Admin access to paste the widget snippet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">WhatsApp Business (Optional)</h4>
                    <p className="text-sm text-muted-foreground">Only needed if you plan to use WhatsApp</p>
                  </div>
                </div>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="h-5 w-5" />
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
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
          {/* INTEGRATION APPS - Using IntegrationDetail component */}
          {/* ================================================================= */}
          <section id="integration-apps" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Grid3X3 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Integration App Guides</h1>
              <Badge variant="secondary">50+ Apps</Badge>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Step-by-step guides for connecting all supported integrations.</p>

            <div id="communication-apps" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Communication Apps</h2>
              <IntegrationDetail name="WhatsApp Business" description="Send/receive WhatsApp messages, templates, media, interactive buttons and list messages." useCases={["Customer support", "Order updates", "Appointment reminders", "OTPs"]} howToConnect={["Go to Integrations → WhatsApp", "Connect via Official WABA or Twilio/Vonage", "Add phone number ID and access token"]} triggers={["Message received", "Template response", "Media received", "Button selection"]} actions={["Send text", "Send template", "Send media", "Send interactive buttons"]} exampleCode={`{"template_name": "order_update", "language": "en_US"}`} troubleshooting={["Verify phone number ID and access token", "Template messages require pre-approval"]} />
              <IntegrationDetail name="Telegram" description="Send/receive Telegram messages, photos, documents via bot." useCases={["Team alerts", "Customer notifications", "Automated responses"]} howToConnect={["Create bot via BotFather", "Get bot token", "Enter token in Integrations"]} triggers={["Message received", "Command invoked", "Button pressed"]} actions={["Send message", "Send photo", "Send document", "Send buttons"]} />
              <IntegrationDetail name="Slack" description="Send messages, upload files, reply in threads, receive events." useCases={["Team notifications", "Support escalation", "Alerting"]} howToConnect={["Go to Integrations → Slack", "Authorize OAuth", "Select channels"]} triggers={["Channel message", "Thread reply", "Mention", "Reaction"]} actions={["Send message", "Upload file", "Start thread", "Add reaction"]} />
              <IntegrationDetail name="Discord" description="Send/receive Discord messages, publish rich embeds, manage channels." useCases={["Community notifications", "Moderation alerts", "Support routing"]} howToConnect={["Create Discord app and bot", "Invite bot to server", "Paste bot token"]} triggers={["Message created", "Reaction added", "Member join/leave"]} actions={["Send message/embed", "Reply in thread", "Assign role"]} />
              <IntegrationDetail name="SMS (Twilio)" description="Send and receive SMS/MMS via Twilio." useCases={["OTP", "Appointment reminders", "Marketing blasts"]} howToConnect={["Enter Twilio Account SID", "Add Auth Token", "Configure phone number"]} triggers={["SMS received", "Delivery status update"]} actions={["Send SMS", "Send MMS", "Verify number"]} />
            </div>

            <div id="email-apps" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Email Apps</h2>
              <IntegrationDetail name="Gmail" description="Send/receive emails, manage labels, reply, forward, search." useCases={["Automated replies", "Lead follow-up", "Support tickets"]} howToConnect={["Sign in with Google account", "Grant email permissions"]} triggers={["Email received", "With attachment", "Label added"]} actions={["Send email", "Reply", "Forward", "Add label"]} />
              <IntegrationDetail name="Outlook" description="Send/receive emails, manage folders, schedule events." useCases={["Automated replies", "Meeting scheduling", "Support tickets"]} howToConnect={["Sign in with Microsoft account", "Grant permissions"]} triggers={["Email received", "Calendar event", "Meeting invite"]} actions={["Send email", "Reply", "Create event"]} />
              <IntegrationDetail name="SendGrid" description="Send transactional and bulk emails with analytics." useCases={["Welcome emails", "Receipts", "Newsletters"]} howToConnect={["Create API key in SendGrid", "Paste in Integrations"]} triggers={["Email delivered", "Opened", "Clicked", "Bounced"]} actions={["Send email", "Send template", "Manage contacts"]} />
              <IntegrationDetail name="Mailchimp" description="Manage subscribers, create campaigns, automate sequences." useCases={["Newsletter automation", "Onboarding sequences", "Campaign targeting"]} howToConnect={["Enter Mailchimp API key", "Choose Audience"]} triggers={["Subscriber added", "Campaign sent", "Email opened"]} actions={["Add subscriber", "Add/remove tag", "Send campaign"]} />
            </div>

            <div id="crm-apps" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">CRM & Sales</h2>
              <IntegrationDetail name="HubSpot" description="Manage contacts, deals, tickets in HubSpot CRM." useCases={["Lead capture", "Sales automation", "Support tickets"]} howToConnect={["Enter HubSpot API key"]} triggers={["New contact", "New deal", "New ticket"]} actions={["Create/update contact", "Create deal", "Create ticket"]} />
              <IntegrationDetail name="Salesforce" description="Sync contacts, deals, and opportunities with Salesforce." useCases={["Lead management", "Sales pipeline automation"]} howToConnect={["Enter instance URL and access token"]} triggers={["New contact", "New opportunity", "New case"]} actions={["Create/update contact", "Create opportunity"]} />
              <IntegrationDetail name="Pipedrive" description="Manage deals and contacts in Pipedrive CRM." useCases={["Sales automation", "Lead tracking"]} howToConnect={["Enter API token"]} triggers={["New deal", "Contact created"]} actions={["Create/update deal", "Create contact"]} />
            </div>

            <div id="ecommerce-apps" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">E-commerce & Payments</h2>
              <IntegrationDetail name="Shopify" description="Sync orders, products, inventory and customers." useCases={["Order notifications", "Inventory updates", "Customer creation"]} howToConnect={["Enter shop domain", "Add Admin API token"]} triggers={["Order created", "Order paid", "Product updated"]} actions={["Update product", "Send notification", "Update inventory"]} />
              <IntegrationDetail name="Stripe" description="Manage payments, customers, invoices and webhooks." useCases={["Payment confirmations", "Subscription management", "Refunds"]} howToConnect={["Enter Stripe Secret Key"]} triggers={["Charge succeeded", "Invoice paid", "Customer created"]} actions={["Create customer", "Create charge", "Refund"]} />
              <IntegrationDetail name="WooCommerce" description="Manage WooCommerce orders and products." useCases={["Order sync", "Product updates", "Notifications"]} howToConnect={["Enter site URL, consumer key/secret"]} triggers={["New order", "Product updated"]} actions={["Create/update order", "Update product"]} />
              <IntegrationDetail name="PayPal" description="Process PayPal payments." useCases={["Payment notifications", "Order sync"]} howToConnect={["Enter client ID and secret"]} triggers={["Payment received", "Order created"]} actions={["Create payment", "Refund"]} />
            </div>

            <div id="productivity-apps" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Productivity & Project Management</h2>
              <IntegrationDetail name="Google Sheets" description="Read/write data to Google Sheets as a lightweight database." useCases={["Log leads", "Track orders", "Conversation transcripts"]} howToConnect={["Connect Google Account via OAuth", "Select spreadsheet and worksheet"]} triggers={["New row added", "Row updated"]} actions={["Add row", "Update row", "Find row"]} exampleCode={`{"customer_name": "Jane", "email": "jane@example.com"}`} />
              <IntegrationDetail name="Trello" description="Create and update Trello cards and boards." useCases={["Turn tickets into tasks", "Sprint planning", "Backlog management"]} howToConnect={["Get API key and token from Trello", "Choose Board and List"]} triggers={["Card created", "Card moved", "Comment added"]} actions={["Create card", "Update card", "Move card", "Add comment"]} />
              <IntegrationDetail name="Asana" description="Create tasks, manage projects in Asana." useCases={["Task automation", "Project tracking"]} howToConnect={["Enter access token and workspace ID"]} triggers={["Task created", "Task completed"]} actions={["Create task", "Update task", "Add comment"]} />
              <IntegrationDetail name="Jira" description="Create issues, manage projects in Jira." useCases={["Bug tracking", "Support tickets", "Project management"]} howToConnect={["Enter domain, email, API token, project key"]} triggers={["Issue created", "Issue updated"]} actions={["Create issue", "Update issue", "Add comment"]} />
              <IntegrationDetail name="Notion" description="Create and update pages and database entries." useCases={["Knowledge base sync", "Task management", "Wiki"]} howToConnect={["Create Notion integration", "Share database with integration", "Enter token"]} triggers={["New page created", "New database entry"]} actions={["Create page", "Create database item", "Update properties"]} />
            </div>

            <div id="database-apps" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Databases & Storage</h2>
              <IntegrationDetail name="Airtable" description="Read/write records to Airtable bases." useCases={["CRM", "Editorial calendars", "Inventory"]} howToConnect={["Create API key in Airtable", "Add Base ID and Table name"]} triggers={["Record created", "Record updated"]} actions={["Create record", "Update record", "Find records"]} />
              <IntegrationDetail name="Firebase" description="Store and sync data in Firestore for real-time apps." useCases={["Chat logs", "Real-time dashboards", "Presence"]} howToConnect={["Create Firebase project", "Upload service account JSON"]} triggers={["Document created/updated/deleted"]} actions={["Add document", "Update document", "Run query"]} />
              <IntegrationDetail name="MongoDB" description="Read/write documents to MongoDB collections." useCases={["Chat transcripts", "Analytics events", "App state"]} howToConnect={["Get MongoDB URI", "Choose database and collection"]} triggers={["Document inserted", "Document updated"]} actions={["Insert document", "Update document", "Run query"]} />
              <IntegrationDetail name="AWS S3" description="Store and serve objects in S3 buckets." useCases={["Media storage", "Backups", "Static assets"]} howToConnect={["Create IAM user with S3 permissions", "Enter credentials and bucket name"]} triggers={["Object created", "Object removed"]} actions={["Upload object", "Download object", "Generate pre-signed URL"]} />
              <IntegrationDetail name="Google Drive" description="Upload, download and list files in Google Drive." useCases={["Save reports", "Export transcripts", "Share files"]} howToConnect={["OAuth with Google account", "Select target folder"]} triggers={["File added/updated"]} actions={["Upload file", "Download file", "Generate shareable link"]} />
            </div>

            <div id="developer-apps" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Developer Tools & Automation</h2>
              <IntegrationDetail name="Webhooks" description="Send and receive HTTP webhooks to integrate with any service." useCases={["Push events to external systems", "Receive form submissions", "Payment callbacks"]} howToConnect={["Create Webhook endpoint", "Configure URL, method, headers", "Map data fields"]} triggers={["Webhook received"]} actions={["Send webhook", "Validate signature"]} exampleCode={`POST /api {"name": "{{customer_name}}"}`} />
              <IntegrationDetail name="Zapier" description="Connect to 5000+ apps via Zapier webhooks." useCases={["Multi-app automation", "Custom workflows"]} howToConnect={["Enter Zapier webhook URL"]} triggers={["Webhook received"]} actions={["Send webhook", "Trigger Zap"]} />
              <IntegrationDetail name="Make (Integromat)" description="Trigger Make scenarios via webhook." useCases={["Multi-step automation", "Data sync"]} howToConnect={["Enter Make webhook URL"]} triggers={["Webhook received"]} actions={["Send webhook", "Trigger scenario"]} />
              <IntegrationDetail name="n8n" description="Trigger n8n workflows via webhook." useCases={["Custom automation", "Data processing"]} howToConnect={["Enter n8n webhook URL"]} triggers={["Webhook received"]} actions={["Send webhook", "Trigger workflow"]} />
              <IntegrationDetail name="GitHub" description="Create issues, trigger workflows, manage repos." useCases={["Auto-create issues from support tickets", "Trigger CI"]} howToConnect={["Create PAT with repo scope", "Select repository"]} triggers={["Issue opened", "PR opened", "Push event"]} actions={["Create issue", "Add comment", "Trigger workflow"]} />
              <IntegrationDetail name="REST API" description="Call any REST API endpoint." useCases={["Custom integrations", "Data sync"]} howToConnect={["Enter API URL, method, headers, API key"]} triggers={["Custom event"]} actions={["Call API", "Send/receive data"]} />
            </div>
          </section>

          {/* ================================================================= */}
          {/* WHATSAPP GUIDE */}
          {/* ================================================================= */}
          <section id="whatsapp-guide" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
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
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center p-6 bg-muted/30 rounded-lg">
                <div className="text-center p-4 bg-card rounded-lg border"><MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" /><p className="text-sm font-medium">Customer sends message</p></div>
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4 bg-card rounded-lg border"><Workflow className="h-8 w-8 mx-auto mb-2 text-blue-500" /><p className="text-sm font-medium">Platform processes</p></div>
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4 bg-card rounded-lg border"><Bot className="h-8 w-8 mx-auto mb-2 text-purple-500" /><p className="text-sm font-medium">AI finds answer</p></div>
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
                <div className="text-center p-4 bg-card rounded-lg border"><MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" /><p className="text-sm font-medium">Reply sent</p></div>
              </div>
            </div>

            <div id="whatsapp-templates" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Message Templates</h2>
              <DocsCodeBlock language="text" title="Example Conversation">{`Customer: What are your opening hours?
AI Agent: Our opening hours are 9am to 6pm, Monday to Friday. Is there anything else I can help you with?`}</DocsCodeBlock>
            </div>

            <div id="whatsapp-errors" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Error Handling</h2>
              <div className="space-y-3">
                <DocsCallout type="warning" title="Invalid phone number">Check your WhatsApp number is correct and registered with WhatsApp Business.</DocsCallout>
                <DocsCallout type="warning" title="No response">Ensure your agent is active and has knowledge uploaded.</DocsCallout>
                <DocsCallout type="warning" title="Integration failed">Reconnect your WhatsApp account and verify credentials.</DocsCallout>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* ADMIN GUIDE */}
          {/* ================================================================= */}
          <section id="admin-guide" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Guide</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Manage users, agents, and monitor conversations.</p>

            <div id="user-management" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p className="text-muted-foreground mb-4">Go to <strong>Settings → Users</strong> to add or remove team members.</p>
            </div>

            <div id="agent-management" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Agent Management</h2>
              <p className="text-muted-foreground mb-4">View all agents in <strong>My Agents</strong>. Edit, deactivate, or delete as needed.</p>
            </div>

            <div id="conversations" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Conversations</h2>
              <p className="text-muted-foreground mb-4">Go to <strong>Conversations</strong> to filter by agent, date, or channel. Export conversations for analysis.</p>
            </div>

            <div id="analytics" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Analytics & Logs</h2>
              <p className="text-muted-foreground mb-4">Access analytics in <strong>Dashboard</strong> or <strong>Analytics</strong>. View metrics like total conversations, response rate, and user satisfaction.</p>
            </div>
          </section>

          {/* ================================================================= */}
          {/* FAQS */}
          {/* ================================================================= */}
          <section id="faqs" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
            </div>

            <div id="general-faqs" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">General</h2>
              <div className="space-y-4">
                {[
                  { q: "How long does it take to set up?", a: "Most users are live in under 10 minutes." },
                  { q: "Do I need to code?", a: "No, everything is point-and-click." },
                  { q: "Can I use my own data?", a: "Yes, scan your website or upload documents." },
                  { q: "Can I use both WhatsApp and website chat?", a: "Yes, you can deploy on both channels." },
                ].map((faq, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2"><CardTitle className="text-base">{faq.q}</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{faq.a}</p></CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div id="troubleshooting" className="scroll-mt-20 mb-8">
              <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
              <div className="space-y-3">
                <DocsCallout type="info" title="Scan not working">Check your website URL and ensure pages are publicly accessible.</DocsCallout>
                <DocsCallout type="info" title="No responses">Make sure your agent has knowledge uploaded.</DocsCallout>
                <DocsCallout type="info" title="Widget not showing">Ensure code is placed before &lt;/body&gt; and check for JS errors.</DocsCallout>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* BEST PRACTICES */}
          {/* ================================================================= */}
          <section id="best-practices" className="scroll-mt-8 mb-16">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Best Practices</h1>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {["Use clear, simple language in your knowledge base", "Add FAQs and common questions", "Keep answers concise and relevant", "Regularly update your knowledge base", "Test with real user questions", "Remove outdated information", "Avoid duplicate entries", "Test both website and WhatsApp flows"].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
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
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
            </div>
            <div className="mt-6 border rounded-lg overflow-hidden">
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
                    ["Dashboard", "The main control panel for your account"],
                  ].map(([term, def], i) => (
                    <tr key={i} className="border-b last:border-0"><td className="px-4 py-3 font-medium">{term}</td><td className="px-4 py-3 text-muted-foreground">{def}</td></tr>
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
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <a href="/signup" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"><ArrowRight className="h-5 w-5 text-primary" /><span>Sign Up</span></a>
              <a href="/login" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"><ArrowRight className="h-5 w-5 text-primary" /><span>Login</span></a>
              <a href="mailto:support@agentforge.app" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"><ArrowRight className="h-5 w-5 text-primary" /><span>Contact Support</span></a>
              <a href="/pricing" className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"><ArrowRight className="h-5 w-5 text-primary" /><span>Pricing</span></a>
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