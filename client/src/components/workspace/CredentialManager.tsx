/**
 * Credential Manager Panel
 * 
 * Secure storage and management of API credentials for integrations.
 * Features: per-app credentials, test connection, encryption status.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Key,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  Trash2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Lock,
  Unlock,
  Globe,
  Database,
  Mail,
  MessageCircle,
  Zap,
  ExternalLink,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type CredentialType = 
  | 'api_key' 
  | 'oauth2' 
  | 'basic_auth' 
  | 'bearer_token'
  | 'custom';

export type CredentialStatus = 
  | 'valid' 
  | 'invalid' 
  | 'expired' 
  | 'untested'
  | 'testing';

export interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

export interface Credential {
  id: string;
  name: string;
  appId: string;
  appName: string;
  appIcon?: string;
  type: CredentialType;
  status: CredentialStatus;
  data: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  lastTestedAt?: Date;
  expiresAt?: Date;
}

export interface CredentialTemplate {
  appId: string;
  appName: string;
  appIcon?: string;
  type: CredentialType;
  fields: CredentialField[];
  helpUrl?: string;
  oauthConfig?: {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
  };
}

export interface CredentialManagerProps {
  credentials: Credential[];
  templates: CredentialTemplate[];
  /**
   * If provided, the UI will filter to this app and open the Create dialog
   * with the matching template preselected.
   */
  preselectAppId?: string;
  onCreateCredential?: (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Credential>;
  onUpdateCredential?: (id: string, updates: Partial<Credential>) => Promise<void>;
  onDeleteCredential?: (id: string) => Promise<void>;
  onTestCredential?: (id: string) => Promise<{ success: boolean; message?: string }>;
  onSelectCredential?: (credential: Credential) => void;
  selectedCredentialId?: string;
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const credentialTypeLabels: Record<CredentialType, string> = {
  api_key: 'API Key',
  oauth2: 'OAuth 2.0',
  basic_auth: 'Basic Auth',
  bearer_token: 'Bearer Token',
  custom: 'Custom',
};

const statusConfig: Record<CredentialStatus, {
  icon: React.ElementType;
  color: string;
  label: string;
}> = {
  valid: { icon: ShieldCheck, color: 'text-green-500', label: 'Valid' },
  invalid: { icon: ShieldAlert, color: 'text-red-500', label: 'Invalid' },
  expired: { icon: ShieldAlert, color: 'text-amber-500', label: 'Expired' },
  untested: { icon: Shield, color: 'text-gray-400', label: 'Not tested' },
  testing: { icon: Loader2, color: 'text-blue-500', label: 'Testing...' },
};

const appIconMap: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  gmail: Mail,
  slack: MessageCircle,
  slack_bot: MessageCircle,
  default: Globe,
};

// ============================================
// DEFAULT TEMPLATES
// ============================================

const defaultTemplates: CredentialTemplate[] = [
  {
    appId: 'whatsapp',
    appName: 'WhatsApp Business',
    appIcon: '💬',
    type: 'bearer_token',
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'Your Meta access token' },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true, placeholder: '1234567890' },
      { key: 'businessAccountId', label: 'Business Account ID', type: 'text', required: true, placeholder: '0987654321' },
    ],
    helpUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
  },
  {
    appId: 'gmail',
    appName: 'Gmail',
    appIcon: '📧',
    type: 'oauth2',
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'ya29.a0...' },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token (optional)', type: 'password', required: false },
    ],
    oauthConfig: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://mail.google.com/'],
    },
  },
  {
    appId: 'slack',
    appName: 'Slack',
    appIcon: '💼',
    type: 'oauth2',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'signingSecret', label: 'Signing Secret', type: 'password', required: false },
    ],
    oauthConfig: {
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: ['chat:write', 'channels:read'],
    },
  },
  {
    appId: 'slack_bot',
    appName: 'Slack (Bot Token)',
    appIcon: '💼',
    type: 'bearer_token',
    fields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: 'xoxb-...' },
    ],
    helpUrl: 'https://api.slack.com/authentication/token-types',
  },
  {
    appId: 'openai',
    appName: 'OpenAI',
    appIcon: '🤖',
    type: 'api_key',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
      { key: 'organization', label: 'Organization ID', type: 'text', required: false, placeholder: 'org-...' },
    ],
    helpUrl: 'https://platform.openai.com/api-keys',
  },
  {
    appId: 'stripe',
    appName: 'Stripe',
    appIcon: '💳',
    type: 'api_key',
    fields: [
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_live_...' },
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: false, placeholder: 'pk_live_...' },
    ],
    helpUrl: 'https://dashboard.stripe.com/apikeys',
  },
  {
    appId: 'airtable',
    appName: 'Airtable',
    appIcon: '📊',
    type: 'bearer_token',
    fields: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', required: true, placeholder: 'pat...' },
    ],
    helpUrl: 'https://airtable.com/create/tokens',
  },
  {
    appId: 'notion',
    appName: 'Notion',
    appIcon: '📝',
    type: 'bearer_token',
    fields: [
      { key: 'integrationToken', label: 'Integration Token', type: 'password', required: true, placeholder: 'secret_...' },
    ],
    helpUrl: 'https://www.notion.so/my-integrations',
  },
  {
    appId: 'hubspot',
    appName: 'HubSpot',
    appIcon: '🟠',
    type: 'bearer_token',
    fields: [
      { key: 'accessToken', label: 'Private App Token', type: 'password', required: true },
    ],
    helpUrl: 'https://developers.hubspot.com/docs/api/private-apps',
  },
];

// ============================================
// COMPONENT
// ============================================

export function CredentialManager({
  credentials,
  templates: customTemplates = [],
  preselectAppId,
  onCreateCredential,
  onUpdateCredential,
  onDeleteCredential,
  onTestCredential,
  onSelectCredential,
  selectedCredentialId,
  className,
}: CredentialManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterApp, setFilterApp] = useState<string | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CredentialTemplate | null>(null);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [deletingCredentialId, setDeletingCredentialId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [credentialName, setCredentialName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingCredentialId, setTestingCredentialId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Merge default templates with custom templates
  const allTemplates = useMemo(() => {
    const merged = [...defaultTemplates];
    customTemplates.forEach((custom) => {
      const existingIdx = merged.findIndex(t => t.appId === custom.appId);
      if (existingIdx >= 0) {
        merged[existingIdx] = custom;
      } else {
        merged.push(custom);
      }
    });
    return merged;
  }, [customTemplates]);

  useEffect(() => {
    if (!preselectAppId) return;

    // Filter list to the selected app.
    setFilterApp(preselectAppId);

    // Prefer opening the Create dialog with that app's template.
    const template = allTemplates.find(t => t.appId === preselectAppId) || null;
    if (template) {
      setSelectedTemplate(template);
      setCredentialName(`My ${template.appName} Account`);
      const initial: Record<string, string> = {};
      template.fields.forEach((f) => {
        initial[f.key] = '';
      });
      setFormData(initial);
      setIsCreateDialogOpen(true);
    }
  }, [preselectAppId, allTemplates]);

  // Filter credentials
  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      const matchesSearch = 
        cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cred.appName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesApp = filterApp === 'all' || cred.appId === filterApp;
      return matchesSearch && matchesApp;
    });
  }, [credentials, searchQuery, filterApp]);

  // Get unique apps for filter
  const uniqueApps = useMemo(() => {
    const apps = new Map<string, string>();
    credentials.forEach((cred) => {
      apps.set(cred.appId, cred.appName);
    });
    return Array.from(apps.entries());
  }, [credentials]);

  // Handle create credential
  const handleCreate = async () => {
    if (!selectedTemplate || !credentialName || !onCreateCredential) return;

    setIsSubmitting(true);
    try {
      await onCreateCredential({
        name: credentialName,
        appId: selectedTemplate.appId,
        appName: selectedTemplate.appName,
        appIcon: selectedTemplate.appIcon,
        type: selectedTemplate.type,
        data: formData,
      });

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create credential:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update credential
  const handleUpdate = async () => {
    if (!editingCredential || !onUpdateCredential) return;

    setIsSubmitting(true);
    try {
      await onUpdateCredential(editingCredential.id, {
        name: credentialName,
        data: formData,
      });

      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update credential:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete credential
  const handleDelete = async () => {
    if (!deletingCredentialId || !onDeleteCredential) return;

    setIsSubmitting(true);
    try {
      await onDeleteCredential(deletingCredentialId);
      setIsDeleteDialogOpen(false);
      setDeletingCredentialId(null);
    } catch (error) {
      console.error('Failed to delete credential:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle test credential
  const handleTest = async (credentialId: string) => {
    if (!onTestCredential) return;

    setTestingCredentialId(credentialId);
    try {
      const result = await onTestCredential(credentialId);
      // The parent should update the credential status
      console.log('Test result:', result);
    } catch (error) {
      console.error('Failed to test credential:', error);
    } finally {
      setTestingCredentialId(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setCredentialName('');
    setSelectedTemplate(null);
    setEditingCredential(null);
    setShowPasswords({});
  };

  // Open edit dialog
  const openEditDialog = (credential: Credential) => {
    const template = allTemplates.find(t => t.appId === credential.appId);
    setEditingCredential(credential);
    setSelectedTemplate(template || null);
    setCredentialName(credential.name);
    setFormData({ ...credential.data });
    setIsEditDialogOpen(true);
  };

  // Mask sensitive value
  const maskValue = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    return `${value.slice(0, 4)}••••••${value.slice(-4)}`;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Key className="w-5 h-5" />
            Credentials
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage API keys and authentication
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Credential</DialogTitle>
              <DialogDescription>
                Add authentication credentials for an integration.
              </DialogDescription>
            </DialogHeader>

            {!selectedTemplate ? (
              // Template selection
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search integrations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-2 gap-2">
                    {allTemplates
                      .filter(t => 
                        t.appName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((template) => (
                        <button
                          key={template.appId}
                          onClick={() => setSelectedTemplate(template)}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted text-left transition-colors"
                        >
                          <span className="text-2xl">{template.appIcon || '🔌'}</span>
                          <div>
                            <p className="font-medium">{template.appName}</p>
                            <p className="text-xs text-muted-foreground">
                              {credentialTypeLabels[template.type]}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              // Credential form
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <span className="text-2xl">{selectedTemplate.appIcon || '🔌'}</span>
                  <div>
                    <p className="font-medium">{selectedTemplate.appName}</p>
                    <p className="text-xs text-muted-foreground">
                      {credentialTypeLabels[selectedTemplate.type]}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Change
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Credential Name</Label>
                    <Input
                      value={credentialName}
                      onChange={(e) => setCredentialName(e.target.value)}
                      placeholder={`My ${selectedTemplate.appName} Account`}
                    />
                  </div>

                  {selectedTemplate.fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          type={
                            field.type === 'password' && !showPasswords[field.key]
                              ? 'password'
                              : 'text'
                          }
                          value={formData[field.key] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                        {field.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                          >
                            {showPasswords[field.key] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground">{field.helpText}</p>
                      )}
                    </div>
                  ))}

                  {selectedTemplate.helpUrl && (
                    <a
                      href={selectedTemplate.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      How to get these credentials
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              {selectedTemplate && (
                <>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isSubmitting || !credentialName}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Credential
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search credentials..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterApp} onValueChange={setFilterApp}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Apps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Apps</SelectItem>
            {uniqueApps.map(([appId, appName]) => (
              <SelectItem key={appId} value={appId}>{appName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Credentials List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredCredentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No credentials found</p>
              <p className="text-sm">Add credentials to connect your integrations</p>
            </div>
          ) : (
            filteredCredentials.map((credential) => {
              const StatusIcon = statusConfig[credential.status].icon;
              const isTesting = testingCredentialId === credential.id;
              
              return (
                <Card
                  key={credential.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedCredentialId === credential.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => onSelectCredential?.(credential)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{credential.appIcon || '🔌'}</span>
                        <div>
                          <CardTitle className="text-base">{credential.name}</CardTitle>
                          <CardDescription>{credential.appName}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn(
                                'flex items-center gap-1',
                                statusConfig[credential.status].color
                              )}>
                                <StatusIcon className={cn(
                                  'w-4 h-4',
                                  isTesting && 'animate-spin'
                                )} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{statusConfig[credential.status].label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleTest(credential.id);
                            }}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Test Connection
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(credential);
                            }}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingCredentialId(credential.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {credentialTypeLabels[credential.type]}
                      </Badge>
                      <span>•</span>
                      <span>Updated {credential.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Credential</DialogTitle>
            <DialogDescription>
              Update the credential details.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <span className="text-2xl">{selectedTemplate.appIcon || '🔌'}</span>
                <div>
                  <p className="font-medium">{selectedTemplate.appName}</p>
                  <p className="text-xs text-muted-foreground">
                    {credentialTypeLabels[selectedTemplate.type]}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Credential Name</Label>
                  <Input
                    value={credentialName}
                    onChange={(e) => setCredentialName(e.target.value)}
                  />
                </div>

                {selectedTemplate.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="relative">
                      <Input
                        type={
                          field.type === 'password' && !showPasswords[field.key]
                            ? 'password'
                            : 'text'
                        }
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                      />
                      {field.type === 'password' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                        >
                          {showPasswords[field.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting || !credentialName}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this credential? This action cannot be undone.
              Any nodes using this credential will need to be reconfigured.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCredentialId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CredentialManager;
