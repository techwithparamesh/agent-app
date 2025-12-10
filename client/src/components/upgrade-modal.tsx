import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, MessageSquare } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentUsage?: {
    remaining: number;
    limit: number;
    plan: string;
  };
}

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "Perfect for small businesses",
    messages: "500 messages/month",
    features: [
      "500 AI messages per month",
      "5 landing pages",
      "3 AI agents",
      "Website scanning",
      "Basic analytics",
      "Email support",
    ],
    popular: false,
    icon: Zap,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "Best for growing companies",
    messages: "2,000 messages/month",
    features: [
      "2,000 AI messages per month",
      "20 landing pages",
      "10 AI agents",
      "Advanced website scanning",
      "Landing page editor",
      "Priority support",
      "Custom branding",
    ],
    popular: true,
    icon: Crown,
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "/month",
    description: "For large organizations",
    messages: "10,000 messages/month",
    features: [
      "10,000 AI messages per month",
      "100 landing pages",
      "Unlimited AI agents",
      "Full API access",
      "White-label solution",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    popular: false,
    icon: Rocket,
  },
];

export function UpgradeModal({ open, onClose, currentUsage }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-display">
            🎉 You've Reached Your Free Trial Limit!
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {currentUsage ? (
              <>
                You've used your free trial quota. Upgrade now to continue creating and unlock more features.
              </>
            ) : (
              "Upgrade now to continue using your AI chatbot and unlock more features."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-12 h-12 rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center mb-2`}>
                  <plan.icon className={`h-6 w-6 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="font-display">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <Badge variant="secondary" className="mt-2">
                  {plan.messages}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    // TODO: Integrate with payment system (Stripe, Razorpay, etc.)
                    window.open("/pricing", "_blank");
                  }}
                >
                  {plan.popular ? "Get Started" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include a 7-day money-back guarantee. No questions asked.
          </p>
          <Button variant="ghost" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
