import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Search, ChevronRight, Home, Rocket, Workflow, Zap, 
  Grid3X3, MessageSquare, Code, HelpCircle, Star, BookOpen, Link2,
  Copy, Check, Info, AlertTriangle, Lightbulb, ArrowRight, ArrowUp,
  Terminal, Menu, X, Users, FileText, Bot, Sparkles, ChevronLeft
} from "lucide-react";
import { IntegrationDocs } from "@/components/integration-docs";

// =============================================================================
// TYPES & DATA
// =============================================================================

type SectionId = 
  | "product-overview" 
  | "getting-started" 
  | "how-it-works" 
  | "integration-apps" 
  | "whatsapp-guide" 
  | "api-reference" 
  | "faqs" 
  | "best-practices" 
  | "glossary" 
  | "resources";

interface DocSection {
  id: SectionId;
  title: string;
  icon: React.ElementType;
  description: string;
}

const docSections: DocSection[] = [
  { id: "product-overview", title: "Product Overview", icon: Home, description: "Learn what AgentForge is and how it helps" },
  { id: "getting-started", title: "Getting Started", icon: Rocket, description: "Quick setup guide to get you running" },
  { id: "how-it-works", title: "How It Works", icon: Workflow, description: "Understand the architecture and flow" },
  { id: "integration-apps", title: "Integration Apps", icon: Grid3X3, description: "75+ app integrations documentation" },
  { id: "whatsapp-guide", title: "WhatsApp AI Agent", icon: MessageSquare, description: "Deploy AI on WhatsApp Business" },
  { id: "api-reference", title: "API Reference", icon: Code, description: "REST API documentation" },
  { id: "faqs", title: "FAQs", icon: HelpCircle, description: "Frequently asked questions" },
  { id: "best-practices", title: "Best Practices", icon: Star, description: "Tips for optimal results" },
  { id: "glossary", title: "Glossary", icon: BookOpen, description: "Key terms and definitions" },
  { id: "resources", title: "Resources", icon: Link2, description: "Helpful links and resources" },
];

// =============================================================================
// HELPER COMPONENTS
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
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
        </button>
      </div>
    </div>
  );
}

type CalloutType = "info" | "warning" | "tip";
function DocsCallout({ type = "info", title, children }: { type?: CalloutType; title?: string; children: React.ReactNode }) {
  const config = {
    info: { icon: Info, className: "border-l-4 border-blue-500 bg-blue-500/10" },
    warning: { icon: AlertTriangle, className: "border-l-4 border-amber-500 bg-amber-500/10" },
    tip: { icon: Lightbulb, className: "border-l-4 border-emerald-500 bg-emerald-500/10" },
  };
  const { icon: Icon, className } = config[type];
  return (
    <div className={cn("my-6 rounded-xl p-4 transition-all duration-200 hover:shadow-md", className)}>
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
          <div className="p-2.5 rounded-xl bg-primary/10">
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
// SECTION CONTENT COMPONENTS
// =============================================================================

function ProductOverviewSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-semibold mb-4">What is AgentForge?</h2>
        <p className="text-muted-foreground leading-7 mb-4">
          AgentForge is a <strong>no-code AI platform</strong> that lets you create, train, and deploy AI chatbots for your website and WhatsApp. 
          The system scans your website or uploaded content, builds a knowledge base, and powers your chatbot to answer questions using your own data.
        </p>
        <DocsCallout type="info" title="No Technical Skills Required">
          You don't need any coding experience to build powerful AI agents. Everything is point-and-click!
        </DocsCallout>
      </div>

      <div>
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Key Benefits</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: "No coding required", desc: "Build powerful AI agents with our visual interface" },
            { title: "Fast setup (under 10 minutes)", desc: "Go from zero to live chatbot in minutes" },
            { title: "24/7 automated support", desc: "Never miss a customer question, even at 3am" },
            { title: "Multi-channel deployment", desc: "Website widget, WhatsApp, and more" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200">
              <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GettingStartedSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DocsCallout type="tip" title="Perfect for beginners">
        This guide is designed for non-technical users. No coding required!
      </DocsCallout>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Quick Start Guide</h2>
        <div className="space-y-6">
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Populate Knowledge</h2>
        <p className="text-muted-foreground mb-4">Your agent's intelligence comes from the knowledge you provide:</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
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
          <Card className="border-0 shadow-lg">
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
    </div>
  );
}

function HowItWorksSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <p className="text-lg text-muted-foreground">Understand the flow from setup to deployment.</p>
      
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
    </div>
  );
}

function WhatsAppGuideSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-semibold mb-4">Setup Guide</h2>
        <div className="space-y-4">
          <StepItem number={1} title="Connect WhatsApp Business">Go to <strong>Integrations → WhatsApp</strong> and connect your WhatsApp Business account.</StepItem>
          <StepItem number={2} title="Assign Phone Number">Link a phone number to your AI agent.</StepItem>
          <StepItem number={3} title="Configure Agent">Set up your knowledge base and test responses.</StepItem>
          <StepItem number={4} title="Activate">Toggle the integration to active.</StepItem>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Message Flow</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center p-8 bg-gradient-to-br from-muted/30 to-background rounded-2xl border">
          {[
            { icon: MessageSquare, label: "Customer sends message", color: "text-green-500" },
            { icon: Workflow, label: "Platform processes", color: "text-blue-500" },
            { icon: Bot, label: "AI finds answer", color: "text-purple-500" },
            { icon: MessageSquare, label: "Reply sent", color: "text-green-500" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="text-center p-4 bg-card rounded-xl border shadow-md hover:shadow-lg transition-all duration-200">
                <step.icon className={cn("h-8 w-8 mx-auto mb-2", step.color)} />
                <p className="text-sm font-medium">{step.label}</p>
              </div>
              {i < 3 && <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApiReferenceSection() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-semibold mb-4">API Overview</h2>
        <p className="text-muted-foreground mb-4">The AgentForge API allows you to programmatically interact with your AI agents.</p>
        <DocsCodeBlock language="bash" title="Base URL">{`https://api.agentforge.app/v1`}</DocsCodeBlock>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        <p className="text-muted-foreground mb-4">All API requests require an API key in the header:</p>
        <DocsCodeBlock language="bash" title="Authentication Header">{`Authorization: Bearer YOUR_API_KEY`}</DocsCodeBlock>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
        <div className="space-y-4">
          {[
            { method: "POST", path: "/chat", desc: "Send a message to an AI agent", color: "bg-green-500" },
            { method: "GET", path: "/agents", desc: "List all your AI agents", color: "bg-blue-500" },
            { method: "GET", path: "/conversations", desc: "Retrieve conversation history", color: "bg-blue-500" },
            { method: "POST", path: "/knowledge", desc: "Add knowledge to an agent", color: "bg-green-500" },
            { method: "DELETE", path: "/knowledge/:id", desc: "Remove knowledge entry", color: "bg-red-500" },
          ].map((endpoint, i) => (
            <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="py-4">
                <div className="flex items-center gap-3">
                  <Badge className={endpoint.color}>{endpoint.method}</Badge>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                </div>
                <CardDescription>{endpoint.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqsSection() {
  const faqs = [
    { q: "How long does it take to set up?", a: "Most users are live in under 10 minutes." },
    { q: "Do I need to code?", a: "No, everything is point-and-click." },
    { q: "Can I use my own data?", a: "Yes, scan your website or upload documents." },
    { q: "Can I use both WhatsApp and website chat?", a: "Yes, you can deploy on both channels." },
    { q: "What's included in the free plan?", a: "1 agent, 100 messages/month, and basic integrations." },
    { q: "How accurate is the AI?", a: "Accuracy depends on your knowledge base quality. The better your data, the better the responses." },
    { q: "Can I customize the chat widget?", a: "Yes, you can customize colors, position, welcome message, and more." },
    { q: "Is my data secure?", a: "Yes, we use enterprise-grade encryption and never share your data." },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {faqs.map((faq, i) => (
        <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-2"><CardTitle className="text-base">{faq.q}</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{faq.a}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}

function BestPracticesSection() {
  const tips = [
    "Use clear, simple language in your knowledge base",
    "Add FAQs and common questions",
    "Keep answers concise and relevant",
    "Regularly update your knowledge base",
    "Test with real user questions",
    "Remove outdated information",
    "Use specific product names and terminology",
    "Include pricing and contact information",
    "Add fallback responses for unknown queries",
    "Monitor analytics to identify gaps",
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid md:grid-cols-2 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <Check className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-sm">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlossarySection() {
  const terms = [
    ["Agent", "An AI chatbot you create on the platform"],
    ["Knowledge Base", "The collection of information your agent uses to answer questions"],
    ["Widget", "The chat bubble/interface you add to your website"],
    ["Integration", "A connection between your agent and external apps"],
    ["Trigger", "An event that starts an automated workflow"],
    ["Action", "An operation performed when a trigger fires"],
    ["Webhook", "A URL that receives data when events occur"],
    ["API Key", "A secret token for authenticating API requests"],
    ["Conversation", "A chat session between a user and your agent"],
    ["Embedding", "The AI-generated representation of your knowledge"],
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="border rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold w-1/4">Term</th>
              <th className="px-4 py-3 text-left font-semibold">Definition</th>
            </tr>
          </thead>
          <tbody>
            {terms.map(([term, def], i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{term}</td>
                <td className="px-4 py-3 text-muted-foreground">{def}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResourcesSection() {
  const resources = [
    { href: "/signup", label: "Sign Up", desc: "Create your free account" },
    { href: "/login", label: "Login", desc: "Access your dashboard" },
    { href: "/pricing", label: "Pricing", desc: "View plans and features" },
    { href: "/dashboard/integrations", label: "Integrations", desc: "Browse 75+ app integrations" },
    { href: "mailto:support@agentforge.app", label: "Contact Support", desc: "Get help from our team" },
    { href: "/dashboard/templates", label: "Templates", desc: "Pre-built agent templates" },
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid md:grid-cols-2 gap-4">
        {resources.map((link, i) => (
          <a
            key={i}
            href={link.href}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <span className="font-medium block">{link.label}</span>
              <span className="text-sm text-muted-foreground">{link.desc}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DocsContent() {
  const [activeSection, setActiveSection] = useState<SectionId>("product-overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter sections based on search
  const filteredSections = searchQuery
    ? docSections.filter(
        s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : docSections;

  // Get current section info
  const currentSection = docSections.find(s => s.id === activeSection);

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "product-overview": return <ProductOverviewSection />;
      case "getting-started": return <GettingStartedSection />;
      case "how-it-works": return <HowItWorksSection />;
      case "integration-apps": return <IntegrationDocs />;
      case "whatsapp-guide": return <WhatsAppGuideSection />;
      case "api-reference": return <ApiReferenceSection />;
      case "faqs": return <FaqsSection />;
      case "best-practices": return <BestPracticesSection />;
      case "glossary": return <GlossarySection />;
      case "resources": return <ResourcesSection />;
      default: return <ProductOverviewSection />;
    }
  };

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
        "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 bg-background border-r",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-1">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setSidebarOpen(false);
                      scrollToTop();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:translate-x-1"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive ? "bg-primary-foreground/20" : "bg-muted"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-left truncate">{section.title}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      isActive && "rotate-90"
                    )} />
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Sticky header with breadcrumb */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <button 
                onClick={() => setActiveSection("product-overview")}
                className="hover:text-foreground transition-colors"
              >
                Docs
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{currentSection?.title}</span>
            </div>
            <div className="flex items-center gap-3">
              {currentSection && (
                <div className="p-2 rounded-xl bg-primary/10">
                  <currentSection.icon className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{currentSection?.title}</h1>
                <p className="text-sm text-muted-foreground">{currentSection?.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 lg:px-8 py-8">
          <div className="max-w-4xl">
            {renderSectionContent()}
          </div>

          {/* Navigation footer */}
          {activeSection !== "integration-apps" && (
            <div className="max-w-4xl mt-12 pt-8 border-t">
              <div className="flex items-center justify-between">
                {/* Previous */}
                {docSections.findIndex(s => s.id === activeSection) > 0 && (
                  <button
                    onClick={() => {
                      const currentIndex = docSections.findIndex(s => s.id === activeSection);
                      setActiveSection(docSections[currentIndex - 1].id);
                      scrollToTop();
                    }}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Previous</span>
                  </button>
                )}
                <div />
                {/* Next */}
                {docSections.findIndex(s => s.id === activeSection) < docSections.length - 1 && (
                  <button
                    onClick={() => {
                      const currentIndex = docSections.findIndex(s => s.id === activeSection);
                      setActiveSection(docSections[currentIndex + 1].id);
                      scrollToTop();
                    }}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group font-medium"
                  >
                    <span>Next: {docSections[docSections.findIndex(s => s.id === activeSection) + 1]?.title}</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Back to top button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 shadow-lg bg-background transition-all duration-300",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default function Docs() {
  return (
    <DashboardLayout title="Documentation">
      <DocsContent />
    </DashboardLayout>
  );
}
