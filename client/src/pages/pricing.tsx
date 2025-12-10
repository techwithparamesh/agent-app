import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X, HelpCircle, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const plans = [
  {
    name: "Starter",
    description: "Perfect for individuals and small projects",
    monthlyPrice: 0,
    yearlyPrice: 0,
    featured: false,
    features: [
      { name: "1 AI Agent", included: true },
      { name: "100 conversations/month", included: true },
      { name: "Basic website scanning", included: true },
      { name: "Standard chatbot widget", included: true },
      { name: "Email support", included: true },
      { name: "Landing page generator", included: false },
      { name: "API access", included: false },
      { name: "Custom branding", included: false },
      { name: "Analytics dashboard", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    description: "For growing businesses and teams",
    monthlyPrice: 49,
    yearlyPrice: 39,
    featured: true,
    features: [
      { name: "10 AI Agents", included: true },
      { name: "5,000 conversations/month", included: true },
      { name: "Advanced website scanning", included: true },
      { name: "Customizable chatbot widget", included: true },
      { name: "Priority email support", included: true },
      { name: "Landing page generator", included: true },
      { name: "API access", included: true },
      { name: "Custom branding", included: true },
      { name: "Analytics dashboard", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Start Pro Trial",
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom needs",
    monthlyPrice: 199,
    yearlyPrice: 159,
    featured: false,
    features: [
      { name: "Unlimited AI Agents", included: true },
      { name: "Unlimited conversations", included: true },
      { name: "Enterprise website scanning", included: true },
      { name: "White-label chatbot widget", included: true },
      { name: "24/7 phone & email support", included: true },
      { name: "Landing page generator", included: true },
      { name: "Full API access", included: true },
      { name: "Full white-labeling", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    question: "Can I change plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "What counts as a conversation?",
    answer: "A conversation is a single chat session between your AI agent and a visitor. Multiple messages within one session count as one conversation.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">Pricing</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-pricing-title">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Choose the plan that fits your needs. All plans include core features with no hidden fees.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  data-testid="switch-billing-toggle"
                />
                <span className={`text-sm ${isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  Yearly
                </span>
                {isYearly && (
                  <Badge variant="secondary" className="ml-2">
                    <Zap className="h-3 w-3 mr-1" />
                    Save 20%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 -mt-12">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative ${
                    plan.featured
                      ? "border-primary shadow-lg scale-105 z-10"
                      : ""
                  }`}
                  data-testid={`card-pricing-${plan.name.toLowerCase()}`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-0 pt-8 px-8">
                    <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold font-display">
                          ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {isYearly && plan.monthlyPrice > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Billed annually
                        </p>
                      )}
                    </div>

                    <a href={plan.name === "Enterprise" ? "/contact" : "/login"}>
                      <Button
                        className="w-full mb-8"
                        variant={plan.featured ? "default" : "outline"}
                        data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                      >
                        {plan.cta}
                      </Button>
                    </a>

                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          {feature.included ? (
                            <div className="w-5 h-5 rounded-full bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-chart-2" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <X className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto max-w-3xl px-6">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">FAQ</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-chart-3/10 border-primary/20">
              <CardContent className="p-12 md:p-16 text-center">
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Need a Custom Solution?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  Contact our sales team to discuss enterprise pricing, custom integrations, and dedicated support.
                </p>
                <a href="/contact">
                  <Button size="lg" className="h-12 px-8" data-testid="button-contact-sales">
                    Contact Sales
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
