import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Building2,
  Phone,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Shield,
  MessageSquare,
  Calendar,
  Globe,
  DollarSign,
  Loader2,
  Unlink,
  Link2
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

interface WhatsAppAccount {
  id: string;
  wabaId: string;
  businessName: string | null;
  businessVerificationStatus: string | null;
  accountReviewStatus: string | null;
  metaBusinessId: string | null;
  currency: string | null;
  timezone: string | null;
  messagingTier: string | null;
  dailyMessageLimit: number | null;
  status: string;
  webhookVerifyToken: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PhoneNumber {
  id: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string | null;
  qualityRating: string | null;
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  disconnected: "bg-gray-100 text-gray-800",
};

const verificationColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  not_verified: "bg-gray-100 text-gray-800",
};

export default function WhatsAppAccountManagePage() {
  const { accountId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch account details
  const { data: accountData, isLoading, error } = useQuery<{ 
    success: boolean; 
    account: WhatsAppAccount; 
    phoneNumbers: PhoneNumber[] 
  }>({
    queryKey: [`/api/whatsapp-cloud/accounts/${accountId}`],
    enabled: !!accountId,
  });

  const account = accountData?.account;
  const phoneNumbers = accountData?.phoneNumbers || [];

  // Sync account mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/whatsapp-cloud/accounts/${accountId}/sync`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to sync account");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/whatsapp-cloud/accounts/${accountId}`] });
      toast({
        title: "Account Synced",
        description: "Account details have been synced with Meta.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
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
      toast({
        title: "Account Disconnected",
        description: "Your WhatsApp Business Account has been disconnected.",
      });
      navigate("/dashboard/whatsapp/accounts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncMutation.mutateAsync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Manage Account">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !account) {
    return (
      <DashboardLayout title="Manage Account">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
          <p className="text-muted-foreground mb-4">The account you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate("/dashboard/whatsapp/accounts")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Account">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/whatsapp/accounts")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                {account.businessName || "WhatsApp Account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                WABA ID: {account.wabaId}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync with Meta
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/dashboard/whatsapp/accounts/${accountId}/numbers`)}
            >
              <Phone className="h-4 w-4 mr-2" />
              Manage Numbers
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
              </CardTitle>
              <CardDescription>Current status and verification details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={statusColors[account.status] || "bg-gray-100"}>
                  {getStatusIcon(account.status)}
                  <span className="ml-1 capitalize">{account.status}</span>
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Business Verification</span>
                <Badge className={verificationColors[account.businessVerificationStatus || "pending"] || "bg-gray-100"}>
                  {getStatusIcon(account.businessVerificationStatus || "pending")}
                  <span className="ml-1 capitalize">{(account.businessVerificationStatus || "pending").replace("_", " ")}</span>
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Review</span>
                <Badge className={verificationColors[account.accountReviewStatus || "pending"] || "bg-gray-100"}>
                  {getStatusIcon(account.accountReviewStatus || "pending")}
                  <span className="ml-1 capitalize">{(account.accountReviewStatus || "pending").replace("_", " ")}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Messaging Limits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messaging Limits
              </CardTitle>
              <CardDescription>Your current messaging tier and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Messaging Tier</span>
                <Badge variant="outline">{account.messagingTier || "TIER_1K"}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Daily Message Limit</span>
                <span className="font-medium">{(account.dailyMessageLimit || 1000).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <a 
                  href="https://developers.facebook.com/docs/whatsapp/messaging-limits" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  Learn about messaging tiers <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Account Details
              </CardTitle>
              <CardDescription>Business information and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Timezone
                </span>
                <span className="font-medium">{account.timezone || "UTC"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Currency
                </span>
                <span className="font-medium">{account.currency || "USD"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Connected
                </span>
                <span className="font-medium">{new Date(account.createdAt).toLocaleDateString()}</span>
              </div>
              {account.metaBusinessId && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Meta Business ID</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{account.metaBusinessId}</code>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Phone Numbers Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Numbers ({phoneNumbers.length})
              </CardTitle>
              <CardDescription>Phone numbers linked to this account</CardDescription>
            </CardHeader>
            <CardContent>
              {phoneNumbers.length > 0 ? (
                <div className="space-y-3">
                  {phoneNumbers.map((phone) => (
                    <div key={phone.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{phone.displayPhoneNumber}</p>
                        {phone.verifiedName && (
                          <p className="text-sm text-muted-foreground">{phone.verifiedName}</p>
                        )}
                      </div>
                      <Badge className={statusColors[phone.status] || "bg-gray-100"}>
                        {phone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No phone numbers linked yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => navigate(`/dashboard/whatsapp/accounts/${accountId}/numbers`)}
                  >
                    Add a phone number
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for this account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Disconnect Account</p>
                <p className="text-sm text-muted-foreground">
                  Remove this WhatsApp Business Account from your workspace. You can reconnect it later.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={account.status === "disconnected"}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* External Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Meta Business Tools
            </CardTitle>
            <CardDescription>Manage your account directly on Meta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a 
                  href={`https://business.facebook.com/wa/manage/phone-numbers/?waba_id=${account.wabaId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Meta WhatsApp Manager
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="https://business.facebook.com/settings/whatsapp-business-accounts"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Business Settings
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Developer Console
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect WhatsApp Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect "{account.businessName || account.wabaId}" from your workspace.
              Your agents will no longer be able to send or receive WhatsApp messages through this account.
              You can reconnect it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => disconnectMutation.mutate()}
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
