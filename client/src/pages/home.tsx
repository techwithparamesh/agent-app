import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Bot,
  Scan,
  MessageSquare,
  FileText,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Star,
  Users,
  Globe,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Agent Builder",
    description: "Create intelligent agents tailored to your business needs with customizable personalities and knowledge bases.",
  },
  {
    icon: Scan,
    title: "Website Scanner",
    description: "Automatically extract and structure content from any website to train your AI agents.",
  },
  {
    icon: MessageSquare,
    title: "Smart Chatbot",
    description: "Deploy context-aware chatbots that understand your content and engage visitors 24/7.",
  },
  {
    icon: FileText,
    title: "Landing Page Generator",
    description: "Generate professional landing pages with AI-powered copywriting and design suggestions.",
  },
  {
    icon: Zap,
    title: "Instant Integration",
    description: "Embed chatbots anywhere with a simple script tag. Works with any website or platform.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your data is encrypted and secure. We never share or use your content for training.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Agent",
    description: "Name your agent, define its purpose, and set the tone of voice for interactions.",
  },
  {
    step: "02",
    title: "Scan Your Website",
    description: "Our AI crawler extracts and structures content from your website automatically.",
  },
  {
    step: "03",
    title: "Train & Deploy",
    description: "Your agent learns from your content and is ready to engage visitors instantly.",
  },
];

const testimonials = [
  {
    name: "Roja",
    role: "Digital Marketer",
    content: "AgentForge reduced our support tickets by 60%. The AI agents handle complex queries with ease.",
    avatar: "R",
  },
  {
    name: "Lakshmi",
    role: "Freelancer",
    content: "The landing page generator saved us weeks of work. Our conversion rate increased by 35%.",
    avatar: "L",
  },
  {
    name: "Jashwanth",
    role: "SEO Analyst",
    content: "Finally, a tool that actually understands our product. Setup took less than 10 minutes.",
    avatar: "J",
  },
];

const stats = [
  { value: "10+", label: "Active Agents" },
  { value: "100+", label: "Conversations" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "User Rating", icon: Star },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 animated-gradient-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
          
          {/* Decorative floating elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-chart-3/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-chart-2/5 rounded-full blur-3xl animate-pulse-soft" />
          
          {/* Dots pattern overlay */}
          <div className="absolute inset-0 dots-bg opacity-30" />
          
          <div className="container mx-auto max-w-7xl px-6 py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 animate-fade-in-down">
                <Sparkles className="h-3 w-3 mr-1 animate-pulse-soft" />
                Powered by Claude AI
              </Badge>
              
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up" data-testid="text-hero-title">
                Build AI Agents That
                <span className="block bg-gradient-to-r from-primary via-chart-3 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
                  Understand Your Business
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
                Create intelligent chatbots, scan websites, build knowledge bases, and generate landing pages - all powered by cutting-edge AI technology.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
                <a href="/signup">
                  <Button size="lg" className="h-12 px-8 text-base btn-shine group" data-testid="button-hero-cta">
                    Start Building Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <Link href="/features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base group" data-testid="button-hero-secondary">
                    Explore Features
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Button>
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-3xl md:text-4xl font-bold font-display">{stat.value}</span>
                      {stat.icon && <stat.icon className="h-5 w-5 text-chart-4 fill-chart-4 animate-pulse-soft" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 dots-bg opacity-20" />
          
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Features</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything You Need to Build AI Agents
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From website scanning to chatbot deployment, we provide all the tools you need to create intelligent AI experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="group card-hover border-transparent hover:border-primary/20 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
          
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">How It Works</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to deploy your first AI agent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative group">
                  <div className="text-8xl font-bold font-display text-primary/10 mb-4 group-hover:text-primary/20 transition-colors">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                      <ArrowRight className="h-8 w-8 text-muted-foreground/30 animate-pulse-soft" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-chart-4/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-chart-3/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Testimonials</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Loved by Teams Worldwide
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See what our customers have to say about AgentForge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="card-hover bg-card/80 backdrop-blur-sm border-transparent hover:border-chart-4/30">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-chart-4 fill-chart-4" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-sm font-semibold text-white shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 animated-gradient-bg opacity-50" />
          
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <Card className="bg-gradient-to-br from-primary/10 via-card to-chart-3/10 border-primary/20 overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-3/10 rounded-full blur-3xl" />
              
              <CardContent className="p-12 md:p-16 text-center relative z-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Join thousands of businesses using AgentForge to automate customer interactions and generate leads.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="/signup">
                    <Button size="lg" className="h-12 px-8 btn-shine group animate-pulse-glow" data-testid="button-cta-primary">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="h-12 px-8 group" data-testid="button-cta-contact">
                      Contact Sales
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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
