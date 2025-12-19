import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, MessageSquare, Loader2, Phone } from "lucide-react";
import { usePlans, formatPrice, fallbackPlans, type SubscriptionPlan } from "@/hooks/usePlans";
import { useMutation } from "@tanstack/react-query";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentUsage?: {
    remaining: number;
    limit: number;
    plan: string;
  };
}

// Get icon for plan
const getPlanIcon = (slug: string) => {
  switch (slug) {
    case "starter": return Zap;
    case "pro": return Crown;
    case "enterprise": return Rocket;
    default: return Zap;
  }
};

// Build feature list for upgrade modal (shorter than pricing page)
function buildUpgradeFeatures(plan: SubscriptionPlan): string[] {
  const features: string[] = [];
  
  const messageText = plan.messageLimit === -1 
    ? "Unlimited AI messages" 
    : `${plan.messageLimit.toLocaleString()} AI messages/month`;
  features.push(messageText);
  
  const agentText = plan.agentLimit === -1 
    ? "Unlimited AI agents" 
    : `${plan.agentLimit} AI agent${plan.agentLimit > 1 ? 's' : ''}`;
  features.push(agentText);
  
  if (plan.phoneNumberLimit > 0 || plan.phoneNumberLimit === -1) {
    const phoneText = plan.phoneNumberLimit === -1 
      ? "Unlimited WhatsApp numbers" 
      : `${plan.phoneNumberLimit} WhatsApp number${plan.phoneNumberLimit > 1 ? 's' : ''}`;
    features.push(phoneText);
  }
  
  features.push(`${plan.features.websiteScanning.charAt(0).toUpperCase() + plan.features.websiteScanning.slice(1)} website scanning`);
  
  if (plan.features.landingPages) features.push("Landing page generator");
  if (plan.features.analytics) features.push("Analytics dashboard");
  if (plan.features.customBranding) features.push("Custom branding");
  if (plan.features.apiAccess) features.push("Full API access");
  if (plan.features.prioritySupport) features.push("Priority support");
  if (plan.features.webhooks) features.push("Webhook integrations");
  
  return features;
}

export function UpgradeModal({ open, onClose, currentUsage }: UpgradeModalProps) {
  const { data, isLoading } = usePlans();
  
  // Get paid plans only (exclude free)
  const plans = (data?.plans || fallbackPlans)
    .filter(p => p.isActive && p.monthlyPrice > 0)
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice);

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (planSlug: string) => {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug,
          billingCycle: "monthly",
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      });
      if (!response.ok) throw new Error("Failed to create checkout session");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan.slug === "enterprise") {
      window.open("/contact", "_blank");
    } else {
      checkoutMutation.mutate(plan.slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-display">
            🎉 Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {currentUsage ? (
              <>
                You've used {currentUsage.limit - currentUsage.remaining} of {currentUsage.limit} messages on your {currentUsage.plan} plan.
                Upgrade now to unlock more features and higher limits.
              </>
            ) : (
              "Upgrade now to unlock AI agents, WhatsApp integration, and more powerful features."
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {plans.map((plan) => {
              const Icon = getPlanIcon(plan.slug);
              const features = buildUpgradeFeatures(plan);
              const isPopular = plan.slug === "pro";
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-12 h-12 rounded-full ${isPopular ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <CardTitle className="font-display">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{formatPrice(plan.monthlyPrice)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {plan.messageLimit === -1 ? "Unlimited" : plan.messageLimit.toLocaleString()} messages
                    </Badge>
                    {plan.phoneNumberLimit > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-600">
                        <Phone className="h-3 w-3" />
                        <span>WhatsApp included</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {features.slice(0, 8).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan)}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {plan.slug === "enterprise" ? "Contact Sales" : isPopular ? "Get Started" : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
          <Button variant="ghost" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
