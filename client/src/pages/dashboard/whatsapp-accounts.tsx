import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Plus, 
  Settings, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  MessageSquare,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unlink,
  Mail
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmailVerificationRequiredInline, isEmailVerificationRequiredError } from "@/components/email-verification-required";

// WhatsApp Cloud API Account interface
interface WhatsAppCloudAccount {
  id: string;
  wabaId: string;
  businessName: string;
  businessEmail: string | null;
  metaBusinessId: string | null;
  status: "pending" | "active" | "suspended" | "disconnected";
  verificationStatus: "not_verified" | "pending" | "verified";
  timezone: string;
  currency: string;
  connectedAt: string | null;
  createdAt: string;
  phoneNumbers?: WhatsAppPhoneNumber[];
}

interface WhatsAppPhoneNumber {
  id: string;
  phoneNumberId: string;
  phoneNumber: string;
  displayPhoneNumber: string;
  verifiedName: string | null;
  qualityRating: string;
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  disconnected: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const verificationColors: Record<string, string> = {
  not_verified: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function WhatsAppAccountsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const agentToLink = new URLSearchParams(window.location.search).get("agent") || "";
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<string | null>(null);

  // Fetch WhatsApp Cloud accounts
  const { data: accountsResponse, isLoading, error, refetch } = useQuery<{ success: boolean; accounts: WhatsAppCloudAccount[] }>({
    queryKey: ["/api/whatsapp-cloud/accounts"],
  });
  
  // Extract accounts array from response
  const accounts = accountsResponse?.accounts || [];

  // Handle OAuth callback result from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const errorMsg = params.get("error");
    
    if (success === "true") {
      toast({
        title: "WhatsApp Connected!",
        description: "Your WhatsApp Business Account has been connected successfully.",
      });
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      refetch();
    } else if (errorMsg) {
      toast({
        title: "Connection Failed",
        description: decodeURIComponent(errorMsg),
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast, refetch]);

  if (isEmailVerificationRequiredError(error)) {
    return (
      <DashboardLayout title="WhatsApp Accounts">
        <div className="space-y-6">
          <EmailVerificationRequiredInline featureName="WhatsApp" />
        </div>
      </DashboardLayout>
    );
  }

  // Start Embedded Signup flow
  const handleConnectWhatsApp = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/whatsapp-cloud/oauth/start", {
        method: "GET",
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || "Failed to start signup");
      }
      
      const data = await res.json();
      
      // Open Meta's Embedded Signup in a popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        data.signupUrl,
        "whatsapp_embedded_signup",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start WhatsApp connection",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const res = await fetch(`/api/whatsapp-cloud/accounts/${accountId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to disconnect account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-cloud/accounts"] });
      setShowDisconnectDialog(false);
      setAccountToDisconnect(null);
      toast({
        title: "Account Disconnected",
        description: "Your WhatsApp Business Account has been disconnected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "disconnected":
        return <Unlink className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <DashboardLayout title="WhatsApp Accounts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Accounts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your WhatsApp Business Account using Meta's official Cloud API
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleConnectWhatsApp} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100">WhatsApp Cloud API</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Direct integration with Meta's official WhatsApp Cloud API. Connect your WhatsApp Business Account 
                  through Meta's secure Embedded Signup flow - no third-party BSP required.
                </p>
              </div>
              <a 
                href="https://developers.facebook.com/docs/whatsapp/cloud-api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 dark:text-green-400"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Setup Guide - shown when no accounts */}
        {(!accounts || accounts.length === 0) && !isLoading && (
          <div className="space-y-6">
            {/* Prerequisites Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Before You Start
                </CardTitle>
                <CardDescription>Make sure you have these ready</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">📱 Phone Number</h4>
                    <p className="text-sm text-muted-foreground">
                      A number <strong>NOT</strong> currently registered with WhatsApp (personal or business)
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">👤 Meta Account</h4>
                    <p className="text-sm text-muted-foreground">
                      A Facebook account to access Meta Business Suite
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">🏢 Business Info</h4>
                    <p className="text-sm text-muted-foreground">
                      Business name and category for your WhatsApp profile
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main CTA Card */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Get Started with WhatsApp Cloud API</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Connect your WhatsApp Business Account to start receiving messages handled by your AI agents.
                </p>
                
                {/* Steps */}
                <div className="w-full max-w-2xl mb-8">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mx-auto mb-3">1</div>
                      <h4 className="font-medium mb-1">Connect Account</h4>
                      <p className="text-xs text-muted-foreground">Click below and follow Meta's popup to connect</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold mx-auto mb-3">2</div>
                      <h4 className="font-medium mb-1">Register Phone</h4>
                      <p className="text-xs text-muted-foreground">Add & verify your phone number in Meta Business Suite</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold mx-auto mb-3">3</div>
                      <h4 className="font-medium mb-1">Link Agent</h4>
                      <p className="text-xs text-muted-foreground">Connect your AI agent to handle incoming messages</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleConnectWhatsApp} disabled={isConnecting} size="lg">
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Connect Your WhatsApp Business
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  You'll be redirected to Meta to authorize your WhatsApp Business Account
                </p>
              </CardContent>
            </Card>

            {/* After Connection Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">After Connecting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold">→</span>
                    <p><strong>Register your phone number</strong> - Go to <a href="https://business.facebook.com/settings/whatsapp-business-accounts" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta Business Suite</a> → Your WABA → Phone Numbers → Add your number and verify via SMS</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold">→</span>
                    <p><strong>Configure webhooks</strong> - In your account's Manage page, you'll find the webhook URL and verify token to configure in Meta Developer Console</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-primary font-bold">→</span>
                    <p><strong>Link an agent</strong> - Go to Manage Numbers and link your AI agent to handle incoming messages</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <a href="/dashboard/docs" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View full documentation <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accounts List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{account.businessName}</CardTitle>
                    </div>
                    {getStatusIcon(account.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      Cloud API
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-mono">
                      WABA: {account.wabaId}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {account.businessEmail && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {account.businessEmail}
                      </div>
                    )}
                    
                    {/* Phone Numbers */}
                    {account.phoneNumbers && account.phoneNumbers.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {account.phoneNumbers[0].displayPhoneNumber}
                        {account.phoneNumbers.length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            +{account.phoneNumbers.length - 1} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Badge className={statusColors[account.status] || "bg-gray-100"}>
                        {account.status}
                      </Badge>
                      {account.verificationStatus && (
                        <Badge className={verificationColors[account.verificationStatus] || "bg-gray-100"}>
                          {account.verificationStatus.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={`/dashboard/whatsapp/accounts/${account.id}/manage`}>
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a
                          href={
                            agentToLink
                              ? `/dashboard/whatsapp/accounts/${account.id}/numbers?agent=${encodeURIComponent(agentToLink)}`
                              : `/dashboard/whatsapp/accounts/${account.id}/numbers`
                          }
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Numbers
                        </a>
                      </Button>
                    </div>
                    
                    {account.status === "active" ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => {
                          setAccountToDisconnect(account.id);
                          setShowDisconnectDialog(true);
                        }}
                      >
                        <Unlink className="h-4 w-4 mr-1" />
                        Disconnect
                      </Button>
                    ) : account.status === "disconnected" ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={handleConnectWhatsApp}
                        disabled={isConnecting}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Reconnect
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect WhatsApp Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your WhatsApp Business Account from this platform. 
              You can reconnect it later, but any ongoing conversations may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => accountToDisconnect && disconnectMutation.mutate(accountToDisconnect)}
            >
              {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
