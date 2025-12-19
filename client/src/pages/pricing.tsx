import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X, HelpCircle, Zap, Loader2, MessageSquare, Bot, Phone, FileText } from "lucide-react";
import { usePlans, formatPrice, getYearlySavings, fallbackPlans, type SubscriptionPlan } from "@/hooks/usePlans";

const faqs = [
  {
    question: "Can I change plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "What counts as a message?",
    answer: "A message is any AI-generated response from your agent. Customer messages don't count against your limit - only the AI responses do.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "How does WhatsApp integration work?",
    answer: "Paid plans include WhatsApp Business API access. You'll connect your WhatsApp Business Account through our dashboard and can assign phone numbers to your AI agents.",
  },
  {
    question: "What happens if I exceed my message limit?",
    answer: "You'll receive a notification when approaching your limit. You can either upgrade your plan or pay for additional messages at the per-message rate shown in your plan.",
  },
];

// Build feature list from plan data
function buildFeatureList(plan: SubscriptionPlan) {
  const agentText = plan.agentLimit === -1 ? "Unlimited AI Agents" : `${plan.agentLimit} AI Agent${plan.agentLimit > 1 ? 's' : ''}`;
  const messageText = plan.messageLimit === -1 ? "Unlimited messages" : `${plan.messageLimit.toLocaleString()} messages/month`;
  const phoneText = plan.phoneNumberLimit === 0 
    ? "No WhatsApp numbers" 
    : plan.phoneNumberLimit === -1 
      ? "Unlimited WhatsApp numbers"
      : `${plan.phoneNumberLimit} WhatsApp number${plan.phoneNumberLimit > 1 ? 's' : ''}`;
  
  return [
    { name: agentText, included: true, icon: Bot },
    { name: messageText, included: true, icon: MessageSquare },
    { name: phoneText, included: plan.phoneNumberLimit > 0 || plan.phoneNumberLimit === -1, icon: Phone },
    { name: `${plan.features.websiteScanning.charAt(0).toUpperCase() + plan.features.websiteScanning.slice(1)} website scanning`, included: true },
    { name: "Landing page generator", included: plan.features.landingPages, icon: FileText },
    { name: "Custom branding", included: plan.features.customBranding },
    { name: "Analytics dashboard", included: plan.features.analytics },
    { name: "API access", included: plan.features.apiAccess },
    { name: "Priority support", included: plan.features.prioritySupport },
    { name: "Webhook integrations", included: plan.features.webhooks },
  ];
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const { data, isLoading, error } = usePlans();
  
  // Use API plans or fallback
  const plans = data?.plans || fallbackPlans;
  
  // Filter to show only active plans and sort by price
  const displayPlans = plans
    .filter(p => p.isActive)
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice);

  // Mark Pro plan as featured
  const getCtaText = (plan: SubscriptionPlan) => {
    if (plan.monthlyPrice === 0) return "Get Started Free";
    if (plan.slug === "enterprise") return "Contact Sales";
    return "Start Free Trial";
  };

  const isPlanFeatured = (plan: SubscriptionPlan) => plan.slug === "pro";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-chart-3/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 animate-fade-in-down">Pricing</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-fade-in-up" data-testid="text-pricing-title">
                Simple, <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">Transparent</span> Pricing
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
                Choose the plan that fits your needs. All plans include core features with no hidden fees.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s' }}>
                <span className={`text-sm transition-colors ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  data-testid="switch-billing-toggle"
                />
                <span className={`text-sm transition-colors ${isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  Yearly
                </span>
                {isYearly && (
                  <Badge variant="secondary" className="ml-2 animate-scale-in">
                    <Zap className="h-3 w-3 mr-1 animate-pulse-soft" />
                    Save 20%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 -mt-12 relative z-10">
          <div className="container mx-auto max-w-7xl px-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayPlans.map((plan, index) => {
                  const features = buildFeatureList(plan);
                  const featured = isPlanFeatured(plan);
                  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                  
                  return (
                    <Card
                      key={plan.id}
                      className={`relative card-hover bg-card/80 backdrop-blur-sm animate-fade-in-up opacity-0 ${
                        featured
                          ? "border-primary/50 shadow-xl shadow-primary/10 md:scale-105 z-10"
                          : "border-transparent hover:border-primary/20"
                      }`}
                      style={{ animationDelay: `${0.4 + index * 0.15}s` }}
                      data-testid={`card-pricing-${plan.slug}`}
                    >
                      {featured && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-primary to-chart-3 text-white border-0 shadow-lg">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="pb-0 pt-8 px-6">
                        <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="mb-6">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold font-display bg-gradient-to-r from-foreground to-foreground hover:from-primary hover:to-chart-3 bg-clip-text transition-all">
                              {formatPrice(price)}
                            </span>
                            {price > 0 && <span className="text-muted-foreground">/month</span>}
                          </div>
                          {isYearly && plan.monthlyPrice > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Billed annually (save {getYearlySavings(plan.monthlyPrice, plan.yearlyPrice)}%)
                            </p>
                          )}
                          {plan.perMessageCost && (
                            <p className="text-xs text-muted-foreground mt-2">
                              ${(plan.perMessageCost / 100).toFixed(2)}/msg overage
                            </p>
                          )}
                        </div>

                        <a href={plan.slug === "enterprise" ? "/contact" : "/login"}>
                          <Button
                            className={`w-full mb-6 btn-shine group ${featured ? 'animate-pulse-glow' : ''}`}
                            variant={featured ? "default" : "outline"}
                            data-testid={`button-pricing-${plan.slug}`}
                          >
                            {getCtaText(plan)}
                            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </Button>
                        </a>

                        <ul className="space-y-3">
                          {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 group">
                              {feature.included ? (
                                <div className="w-5 h-5 rounded-full bg-chart-2/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                  <Check className="h-3 w-3 text-chart-2" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  <X className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              <span className={`text-sm ${feature.included ? "group-hover:text-foreground transition-colors" : "text-muted-foreground"}`}>
                                {feature.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 dots-bg opacity-20" />
          
          <div className="container mx-auto max-w-3xl px-6 relative z-10">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">FAQ</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="card-hover bg-card/80 backdrop-blur-sm border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2 flex items-start gap-2">
                      <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground pl-7">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 animated-gradient-bg opacity-30" />
          
          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <Card className="bg-gradient-to-br from-primary/10 via-card to-chart-3/10 border-primary/20 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-3/10 rounded-full blur-3xl" />
              
              <CardContent className="p-12 md:p-16 text-center relative z-10">
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Need a Custom Solution?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Contact our sales team to discuss enterprise pricing, custom integrations, and dedicated support for WhatsApp Business at scale.
                </p>
                <a href="/contact">
                  <Button size="lg" className="h-12 px-8 btn-shine group" data-testid="button-contact-sales">
                    Contact Sales
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
