import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Plus, 
  Link2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Bot,
  Signal,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhoneNumber {
  id: string;
  phoneNumber: string;
  displayPhoneNumber: string | null;
  provisioningStatus: string;
  qualityRating: string | null;
  messagingLimit: string | null;
  profileName: string | null;
  agentId: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  provisioning: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  deactivated: "bg-gray-100 text-gray-800",
};

const qualityColors: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
};

export default function PhoneNumbersPage() {
  const { wabaId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [formData, setFormData] = useState({
    phoneNumber: "",
    displayPhoneNumber: "",
    countryCode: "",
    numberType: "new",
    profileName: "",
    profileAbout: "",
  });

  // Fetch phone numbers
  const { data: phoneNumbers, isLoading: loadingNumbers } = useQuery<PhoneNumber[]>({
    queryKey: [`/api/bsp/accounts/${wabaId}/phone-numbers`],
    enabled: !!wabaId,
  });

  // Fetch agents for linking
  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Create phone number mutation
  const createPhoneMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/bsp/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, wabaId }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create phone number");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bsp/accounts/${wabaId}/phone-numbers`] });
      setIsCreateDialogOpen(false);
      setFormData({
        phoneNumber: "",
        displayPhoneNumber: "",
        countryCode: "",
        numberType: "new",
        profileName: "",
        profileAbout: "",
      });
      toast({
        title: "Phone Number Added",
        description: "Your phone number has been added and is being provisioned.",
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

  // Link agent mutation
  const linkAgentMutation = useMutation({
    mutationFn: async ({ phoneId, agentId }: { phoneId: string; agentId: string }) => {
      const res = await fetch(`/api/bsp/phone-numbers/${phoneId}/link-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to link agent");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bsp/accounts/${wabaId}/phone-numbers`] });
      setIsLinkDialogOpen(false);
      setSelectedPhoneId(null);
      setSelectedAgentId("");
      toast({
        title: "Agent Linked",
        description: "The AI agent has been linked to this phone number.",
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

  // Delete phone number mutation
  const deletePhoneMutation = useMutation({
    mutationFn: async (phoneId: string) => {
      const res = await fetch(`/api/bsp/phone-numbers/${phoneId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete phone number");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bsp/accounts/${wabaId}/phone-numbers`] });
      toast({
        title: "Phone Number Deleted",
        description: "The phone number has been removed.",
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
      case "provisioning":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return null;
    const agent = agents?.find((a) => a.id === agentId);
    return agent?.name || "Unknown Agent";
  };

  const handleLinkAgent = (phoneId: string) => {
    setSelectedPhoneId(phoneId);
    setIsLinkDialogOpen(true);
  };

  const confirmLinkAgent = () => {
    if (selectedPhoneId && selectedAgentId) {
      linkAgentMutation.mutate({ phoneId: selectedPhoneId, agentId: selectedAgentId });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/whatsapp/accounts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Phone Numbers</h1>
            <p className="text-muted-foreground mt-1">
              Manage WhatsApp phone numbers for this business account
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Number
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Phone Number</DialogTitle>
                <DialogDescription>
                  Add a new phone number for WhatsApp Business API
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-muted-foreground">Enter in E.164 format (e.g., +1234567890)</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="displayPhoneNumber">Display Number</Label>
                  <Input
                    id="displayPhoneNumber"
                    value={formData.displayPhoneNumber}
                    onChange={(e) => setFormData({ ...formData, displayPhoneNumber: e.target.value })}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numberType">Number Type</Label>
                  <Select
                    value={formData.numberType}
                    onValueChange={(value) => setFormData({ ...formData, numberType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Number</SelectItem>
                      <SelectItem value="ported">Ported Number</SelectItem>
                      <SelectItem value="virtual">Virtual Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profileName">Profile Name</Label>
                  <Input
                    id="profileName"
                    value={formData.profileName}
                    onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
                    placeholder="Business Name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createPhoneMutation.mutate(formData)}
                  disabled={createPhoneMutation.isPending}
                >
                  {createPhoneMutation.isPending ? "Adding..." : "Add Number"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Link Agent Dialog */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Link AI Agent</DialogTitle>
              <DialogDescription>
                Select an AI agent to handle messages for this phone number
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Agent</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmLinkAgent}
                disabled={!selectedAgentId || linkAgentMutation.isPending}
              >
                {linkAgentMutation.isPending ? "Linking..." : "Link Agent"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Phone Numbers List */}
        {loadingNumbers ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : phoneNumbers && phoneNumbers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {phoneNumbers.map((phone) => (
              <Card key={phone.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg font-mono">
                        {phone.displayPhoneNumber || phone.phoneNumber}
                      </CardTitle>
                    </div>
                    {getStatusIcon(phone.provisioningStatus)}
                  </div>
                  <CardDescription>
                    {phone.profileName || "No profile name set"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[phone.provisioningStatus] || "bg-gray-100"}>
                        {phone.provisioningStatus}
                      </Badge>
                      {phone.qualityRating && (
                        <Badge className={qualityColors[phone.qualityRating] || "bg-gray-100"}>
                          <Signal className="h-3 w-3 mr-1" />
                          {phone.qualityRating}
                        </Badge>
                      )}
                      {phone.messagingLimit && (
                        <Badge variant="outline">
                          {phone.messagingLimit}
                        </Badge>
                      )}
                    </div>
                    
                    {phone.agentId ? (
                      <div className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                        <Bot className="h-4 w-4 text-primary" />
                        <span>Linked to: <strong>{getAgentName(phone.agentId)}</strong></span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No agent linked - messages won't be processed
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleLinkAgent(phone.id)}
                      >
                        <Link2 className="h-4 w-4 mr-1" />
                        {phone.agentId ? "Change Agent" : "Link Agent"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Phone Number?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the phone number from your account. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePhoneMutation.mutate(phone.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Phone Numbers Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Add a phone number to start receiving WhatsApp messages through your AI agents.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Number
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
