import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Bot,
  Scan,
  Database,
  MessageSquare,
  FileText,
  Code,
  Zap,
  Globe,
  BarChart3,
  Shield,
  Settings,
  Puzzle,
  ArrowRight,
  Check,
  Phone,
  Send,
  Users,
  Clock,
} from "lucide-react";

const mainFeatures = [
  {
    icon: Bot,
    title: "AI Agent Builder",
    description: "Create custom AI agents with specific personalities, knowledge, and behaviors tailored to your brand.",
    benefits: [
      "Custom personality & tone settings",
      "Multiple purpose presets (Sales, Support, Info)",
      "Easy configuration interface",
      "Instant deployment",
    ],
  },
  {
    icon: Phone,
    title: "WhatsApp Business Integration",
    description: "Connect your AI agents to WhatsApp Business API and automate customer conversations at scale.",
    benefits: [
      "Official WhatsApp Business API access",
      "Automated 24/7 customer support",
      "Message templates for outbound",
      "Multi-number support per business",
      "Appointment booking & reminders",
      "Usage-based billing included",
    ],
  },
  {
    icon: Scan,
    title: "Website Scanner",
    description: "Automatically crawl and extract content from your website to build a comprehensive knowledge base.",
    benefits: [
      "Automatic content extraction",
      "Smart content chunking",
      "Structured data output",
      "FAQ auto-detection",
    ],
  },
  {
    icon: Database,
    title: "Knowledge Base Creation",
    description: "Organize and manage the information your AI agents use to answer questions accurately.",
    benefits: [
      "Organized content storage",
      "Section-based organization",
      "Easy content management",
      "Version history",
    ],
  },
  {
    icon: MessageSquare,
    title: "Intelligent Chatbot",
    description: "Deploy AI-powered chatbots that provide accurate, context-aware responses to visitor questions.",
    benefits: [
      "RAG-powered responses",
      "Context-aware answers",
      "24/7 availability",
      "Multi-language support",
    ],
  },
  {
    icon: FileText,
    title: "Landing Page Generator",
    description: "Generate professional, conversion-optimized landing pages with AI-powered copywriting.",
    benefits: [
      "AI-generated copy",
      "SEO optimization",
      "Multiple sections",
      "Export to HTML",
    ],
  },
  {
    icon: Code,
    title: "API Access",
    description: "Full API access to integrate AgentForge capabilities into your existing applications.",
    benefits: [
      "RESTful API",
      "Webhook support",
      "Real-time updates",
      "Comprehensive docs",
    ],
  },
];

const additionalFeatures = [
  { icon: Zap, title: "Instant Setup", description: "Deploy in minutes with no coding required" },
  { icon: Globe, title: "Embeddable Widget", description: "Add to any website with a simple script" },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Track conversations and performance" },
  { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliant, encrypted data" },
  { icon: Settings, title: "Custom Branding", description: "Match your brand colors and style" },
  { icon: Puzzle, title: "Integrations", description: "Connect with your favorite tools" },
  { icon: Send, title: "Message Templates", description: "Pre-approved WhatsApp templates for outbound" },
  { icon: Users, title: "Multi-Agent Support", description: "Route customers to the right AI agent" },
  { icon: Clock, title: "24/7 Automation", description: "Never miss a customer message" },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">Features</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-features-title">
                Powerful Features for
                <span className="block text-primary">Intelligent Automation</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Everything you need to build, deploy, and manage AI agents that understand your business and engage your customers.
              </p>
              <a href="/signup">
                <Button size="lg" className="h-12 px-8" data-testid="button-features-cta">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="space-y-24">
              {mainFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="font-display text-3xl font-bold tracking-tight mb-4">
                      {feature.title}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-chart-2" />
                          </div>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <Card className="aspect-video bg-gradient-to-br from-primary/5 via-muted to-chart-3/5">
                      <CardContent className="h-full flex items-center justify-center p-8">
                        <feature.icon className="h-24 w-24 text-primary/30" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">More Features</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                And So Much More
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-chart-3/10 border-primary/20">
              <CardContent className="p-12 md:p-16 text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Create your first AI agent in minutes. No credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="/signup">
                    <Button size="lg" className="h-12 px-8">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="h-12 px-8">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
