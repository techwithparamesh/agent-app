import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Check, 
  Zap,
  Crown,
  Building,
  MessageSquare,
  Users,
  Phone,
  BarChart3,
  Download,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  plan: string;
  messagesUsed: number;
  messageLimit: number | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  messageLimit: number | null;
  agentLimit: number;
  phoneNumberLimit: number;
  features: {
    customBranding: boolean;
    analytics: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    webhooks: boolean;
    integrations: string[];
    aiCapabilities: string[];
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  total: number;
  currency: string;
  status: string;
  paidAt: string | null;
  invoicePdfUrl: string | null;
}

const planIcons: Record<string, React.ReactNode> = {
  free: <MessageSquare className="h-6 w-6" />,
  starter: <Zap className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  enterprise: <Building className="h-6 w-6" />,
};

const planColors: Record<string, string> = {
  free: "border-gray-200",
  starter: "border-blue-200",
  pro: "border-purple-200 ring-2 ring-purple-100",
  enterprise: "border-amber-200",
};

export default function BillingPage() {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Fetch subscription status
  const { data: subscriptionStatus, isLoading: loadingStatus } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/billing/subscription"],
  });

  // Fetch plans
  const { data: plans, isLoading: loadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/billing/plans"],
  });

  // Fetch invoices
  const { data: invoices, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/billing/invoices"],
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({ planSlug, billingCycle }: { planSlug: string; billingCycle: "monthly" | "yearly" }) => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug, billingCycle }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create checkout session");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Portal mutation
  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create portal session");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const usagePercentage = subscriptionStatus?.messageLimit
    ? Math.min(100, (subscriptionStatus.messagesUsed / subscriptionStatus.messageLimit) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plan and billing information
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription status and usage</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStatus ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ) : subscriptionStatus ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {planIcons[subscriptionStatus.plan]}
                    <div>
                      <h3 className="text-xl font-semibold capitalize">{subscriptionStatus.plan} Plan</h3>
                      {subscriptionStatus.currentPeriodEnd && (
                        <p className="text-sm text-muted-foreground">
                          {subscriptionStatus.cancelAtPeriodEnd 
                            ? `Cancels on ${formatDate(subscriptionStatus.currentPeriodEnd)}`
                            : `Renews on ${formatDate(subscriptionStatus.currentPeriodEnd)}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  {subscriptionStatus.hasActiveSubscription && (
                    <Button variant="outline" onClick={() => portalMutation.mutate()}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Subscription
                    </Button>
                  )}
                </div>

                {/* Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Messages Used This Period</span>
                    <span className="font-medium">
                      {subscriptionStatus.messagesUsed.toLocaleString()} 
                      {subscriptionStatus.messageLimit 
                        ? ` / ${subscriptionStatus.messageLimit.toLocaleString()}`
                        : " (Unlimited)"
                      }
                    </span>
                  </div>
                  {subscriptionStatus.messageLimit && (
                    <Progress value={usagePercentage} className="h-2" />
                  )}
                  {usagePercentage >= 80 && subscriptionStatus.messageLimit && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      You're approaching your message limit. Consider upgrading.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Plans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Plans</h2>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
              </Button>
            </div>
          </div>

          {loadingPlans ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : plans ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => {
                const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                const isCurrentPlan = subscriptionStatus?.plan === plan.slug;
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative ${planColors[plan.slug]} ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                  >
                    {plan.slug === "pro" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {planIcons[plan.slug]}
                        <CardTitle>{plan.name}</CardTitle>
                      </div>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">
                          {price === 0 ? "Free" : formatPrice(price, plan.currency)}
                        </span>
                        {price > 0 && (
                          <span className="text-muted-foreground">
                            /{billingCycle === "yearly" ? "year" : "month"}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          {plan.messageLimit ? `${plan.messageLimit.toLocaleString()} messages/mo` : "Unlimited messages"}
                        </li>
                        <li className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          {plan.agentLimit ? `${plan.agentLimit} AI agents` : "Unlimited agents"}
                        </li>
                        <li className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          {plan.phoneNumberLimit ? `${plan.phoneNumberLimit} phone numbers` : "Unlimited numbers"}
                        </li>
                        {plan.features?.analytics && (
                          <li className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Analytics dashboard
                          </li>
                        )}
                        {plan.features?.prioritySupport && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            Priority support
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : price === 0 ? (
                        <Button variant="outline" className="w-full" disabled>
                          Free Forever
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => checkoutMutation.mutate({ planSlug: plan.slug, billingCycle })}
                          disabled={checkoutMutation.isPending}
                        >
                          {checkoutMutation.isPending ? "Loading..." : "Upgrade"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </div>

        <Separator />

        {/* Invoices */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Billing History</h2>
          
          {loadingInvoices ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : invoices && invoices.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                      </TableCell>
                      <TableCell>{formatPrice(invoice.total, invoice.currency)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={invoice.status === "paid" ? "default" : "secondary"}
                          className={invoice.status === "paid" ? "bg-green-100 text-green-800" : ""}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.invoicePdfUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={invoice.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
                <p className="text-muted-foreground text-center">
                  Your billing history will appear here once you subscribe to a plan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
