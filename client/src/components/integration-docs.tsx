import { useState } from "react";
import { 
  ChevronRight, Search, ExternalLink, Copy, Check,
  Zap, MessageSquare, Mail, Users, ShoppingCart, FileText, Database, 
  Code, Brain, ArrowLeft, BookOpen, AlertTriangle, Lightbulb, Play,
  X, Filter, Grid3X3, List, Sparkles, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  allIntegrations, 
  integrationsByCategory, 
  getIntegrationById, 
  searchIntegrations,
  categoryLabels,
  categoryDescriptions,
  type Integration,
  type IntegrationCategory 
} from "@/data/integrations";

// Category icons mapping
const categoryIcons: Record<IntegrationCategory, React.ElementType> = {
  communication: MessageSquare,
  email: Mail,
  crm: Users,
  ecommerce: ShoppingCart,
  productivity: FileText,
  database: Database,
  developer: Code,
  google: Zap,
  ai: Brain,
  marketing: TrendingUp,
};

// Code block component with copy functionality
function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden">
      <div className="absolute top-3 right-3 z-10">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
        </Button>
      </div>
      <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-xl overflow-x-auto text-sm font-mono border border-zinc-800">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Callout component with modern styling
function Callout({ type, title, children }: { type: "info" | "warning" | "tip"; title: string; children: React.ReactNode }) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
    tip: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  };
  const icons = {
    info: BookOpen,
    warning: AlertTriangle,
    tip: Lightbulb,
  };
  const Icon = icons[type];
  
  return (
    <div className={cn("flex gap-3 p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md", styles[type])}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold mb-1">{title}</p>
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

// Modern Integration card with hover effects
function IntegrationCard({ integration, onClick, viewMode = "grid" }: { integration: Integration; onClick: () => void; viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div 
        className="group cursor-pointer flex items-center gap-5 p-5 rounded-2xl border bg-card hover:border-primary/50 hover:bg-accent/30 transition-all duration-300 hover:shadow-lg"
        onClick={onClick}
      >
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: integration.color }}
        >
          {integration.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{integration.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{integration.shortDescription}</p>
        </div>
        <Badge variant="secondary" className="hidden md:flex shrink-0">{categoryLabels[integration.category]}</Badge>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
      </div>
    );
  }

  return (
    <Card 
      className="group cursor-pointer border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden h-full flex flex-col"
      onClick={onClick}
    >
      {/* Gradient top border on hover */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary transition-all duration-300" />
      
      <CardHeader className="pb-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl shrink-0"
            style={{ backgroundColor: integration.color }}
          >
            {integration.name.charAt(0)}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-1" />
        </div>
        <CardTitle className="text-base font-semibold mt-4 group-hover:text-primary transition-colors duration-200 leading-tight">
          {integration.name}
        </CardTitle>
        <CardDescription className="text-sm mt-2 line-clamp-2 leading-relaxed">
          {integration.shortDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-5">
        <div className="flex flex-wrap gap-2">
          {integration.features.slice(0, 2).map((feature, i) => (
            <Badge key={i} variant="secondary" className="text-xs py-1 px-2.5 transition-colors duration-200 group-hover:bg-primary/10 truncate max-w-[140px]">
              {feature}
            </Badge>
          ))}
          {integration.features.length > 2 && (
            <Badge variant="outline" className="text-xs py-1 px-2">
              +{integration.features.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Category sidebar with modern styling
function CategorySidebar({ 
  activeCategory, 
  onCategoryChange 
}: { 
  activeCategory: IntegrationCategory | null; 
  onCategoryChange: (category: IntegrationCategory | null) => void;
}) {
  const categories = Object.keys(integrationsByCategory).filter(
    cat => integrationsByCategory[cat as IntegrationCategory].length > 0
  ) as IntegrationCategory[];

  return (
    <div className="space-y-1">
      <Button
        variant={activeCategory === null ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 transition-all duration-200",
          activeCategory === null && "shadow-md"
        )}
        onClick={() => onCategoryChange(null)}
      >
        <Sparkles className="h-4 w-4" />
        All Integrations
        <Badge variant={activeCategory === null ? "secondary" : "outline"} className="ml-auto">
          {allIntegrations.length}
        </Badge>
      </Button>
      
      <Separator className="my-4" />
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">Categories</p>
      
      {categories.map((category) => {
        const Icon = categoryIcons[category];
        const count = integrationsByCategory[category].length;
        const isActive = activeCategory === category;
        
        return (
          <Button
            key={category}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 transition-all duration-200",
              isActive && "bg-primary/10 text-primary"
            )}
            onClick={() => onCategoryChange(category)}
          >
            <Icon className="h-4 w-4" />
            {categoryLabels[category]}
            <Badge variant="outline" className="ml-auto text-xs">{count}</Badge>
          </Button>
        );
      })}
    </div>
  );
}

// Integration detail page component with enhanced UI
function IntegrationDetailPage({ 
  integration, 
  onBack 
}: { 
  integration: Integration; 
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Back button with hover animation */}
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2 group hover:bg-primary/10 transition-all duration-200"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
        Back to Integrations
      </Button>

      {/* Header with enhanced styling */}
      <div className="flex items-start gap-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-card to-muted/30 border">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-xl"
          style={{ backgroundColor: integration.color }}
        >
          {integration.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold">{integration.name}</h1>
            <Badge className="animate-in zoom-in duration-300">{categoryLabels[integration.category]}</Badge>
          </div>
          <p className="text-lg text-muted-foreground mb-4">{integration.description}</p>
          <div className="flex gap-3 flex-wrap">
            {integration.website && (
              <Button variant="outline" size="sm" className="group transition-all duration-200 hover:border-primary" asChild>
                <a href={integration.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Website
                </a>
              </Button>
            )}
            {integration.documentationUrl && (
              <Button variant="outline" size="sm" className="group transition-all duration-200 hover:border-primary" asChild>
                <a href={integration.documentationUrl} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Official Docs
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:shadow-md transition-all">Overview</TabsTrigger>
          <TabsTrigger value="credentials" className="rounded-lg data-[state=active]:shadow-md transition-all">Setup</TabsTrigger>
          <TabsTrigger value="operations" className="rounded-lg data-[state=active]:shadow-md transition-all">Operations</TabsTrigger>
          <TabsTrigger value="examples" className="rounded-lg data-[state=active]:shadow-md transition-all">Examples</TabsTrigger>
          <TabsTrigger value="troubleshooting" className="rounded-lg data-[state=active]:shadow-md transition-all">Issues</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
          {/* Features */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent rounded-t-xl">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {integration.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-transparent rounded-t-xl">
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-5 w-5 text-emerald-500" />
                Use Cases
              </CardTitle>
              <CardDescription>Common scenarios where this integration shines</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                {integration.useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-emerald-500/10 transition-all duration-300 hover:shadow-md group">
                    <Play className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Triggers & Actions Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            {integration.triggers && integration.triggers.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent rounded-t-xl">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Triggers
                  </CardTitle>
                  <CardDescription>Events that start workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  {integration.triggers.map((trigger, i) => (
                    <div key={i} className="p-3 rounded-xl border bg-card hover:border-amber-500/30 hover:shadow-md transition-all duration-200">
                      <p className="font-medium text-sm">{trigger.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{trigger.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {integration.actions && integration.actions.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent rounded-t-xl">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-500" />
                    Actions
                  </CardTitle>
                  <CardDescription>Operations you can perform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  {integration.actions.map((action, i) => (
                    <div key={i} className="p-3 rounded-xl border bg-card hover:border-green-500/30 hover:shadow-md transition-all duration-200">
                      <p className="font-medium text-sm">{action.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent rounded-t-xl">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Authentication
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                This integration uses 
                <Badge variant="outline" className="font-mono">{integration.credentialType}</Badge> 
                authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {integration.requiredScopes && integration.requiredScopes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm">Required Scopes/Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {integration.requiredScopes.map((scope, i) => (
                      <code key={i} className="px-3 py-1.5 bg-muted rounded-lg text-xs font-mono border hover:bg-primary/10 transition-colors">
                        {scope}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent rounded-t-xl">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Setup Instructions
              </CardTitle>
              <CardDescription>Follow these steps to connect {integration.name}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                {integration.credentialSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      {step.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.note && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1 p-2 rounded-lg bg-amber-500/10">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                          {step.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6 animate-in fade-in duration-300">
          {integration.operations.map((operation, i) => (
            <Card key={i} className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted to-transparent">
                <CardTitle className="text-lg">{operation.name}</CardTitle>
                <CardDescription>{operation.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3 text-sm">Parameters</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Field</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Required</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operation.fields && operation.fields.map((field, j) => (
                        <tr key={j} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-mono text-xs">{field.name}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs font-mono">{field.type}</Badge>
                          </td>
                          <td className="p-3">
                            {field.required ? (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Optional</Badge>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6 animate-in fade-in duration-300">
          {integration.examples && integration.examples.length > 0 ? (
            integration.examples.map((example, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-violet-500/5 to-transparent rounded-t-xl">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    {example.title}
                  </CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {example.steps && (
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Workflow Steps</h4>
                      <ol className="space-y-3">
                        {example.steps.map((step, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm group">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                              {j + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {example.code && (
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Example Payload</h4>
                      <CodeBlock code={example.code} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Callout type="info" title="Examples Coming Soon">
              We're working on adding more examples for this integration. Check back soon!
            </Callout>
          )}
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-500/5 to-transparent rounded-t-xl">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Common Issues
              </CardTitle>
              <CardDescription>Solutions to frequently encountered problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {integration.commonIssues && integration.commonIssues.length > 0 ? (
                integration.commonIssues.map((issue, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-card hover:border-red-500/30 hover:shadow-md transition-all duration-200">
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {issue.problem}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-foreground">Cause:</span> <span className="text-muted-foreground">{issue.cause}</span></p>
                      <p><span className="font-medium text-foreground">Solution:</span> <span className="text-muted-foreground">{issue.solution}</span></p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No common issues documented yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Related Integrations */}
          {integration.relatedIntegrations && integration.relatedIntegrations.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Related Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {integration.relatedIntegrations.map((relatedId, i) => {
                    const related = getIntegrationById(relatedId);
                    if (!related) return null;
                    return (
                      <Button 
                        key={i} 
                        variant="outline" 
                        size="sm"
                        className="gap-2 hover:border-primary transition-colors"
                      >
                        <div 
                          className="w-4 h-4 rounded flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: related.color }}
                        >
                          {related.name.charAt(0)}
                        </div>
                        {related.name}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* External Resources */}
          {integration.externalResources && integration.externalResources.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">External Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {integration.externalResources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {resource.title}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main Integration Docs component
export function IntegrationDocs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter integrations based on search and category
  const filteredIntegrations = searchQuery
    ? searchIntegrations(searchQuery)
    : activeCategory
    ? integrationsByCategory[activeCategory]
    : allIntegrations;

  // Handle back navigation - this now works properly!
  const handleBack = () => {
    setSelectedIntegration(null);
  };

  // If an integration is selected, show detail view
  if (selectedIntegration) {
    const integration = getIntegrationById(selectedIntegration);
    if (integration) {
      return (
        <div className="py-8 px-4 lg:px-8">
          <IntegrationDetailPage 
            integration={integration}
            onBack={handleBack}
          />
        </div>
      );
    }
  }

  return (
    <div className="flex h-full min-h-[600px]">
      {/* Desktop Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r p-6 hidden lg:block bg-muted/30">
        <h3 className="font-bold text-lg mb-6">Categories</h3>
        <CategorySidebar 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </aside>

      {/* Mobile Filter Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-6 left-6 z-50 lg:hidden shadow-lg"
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 shadow-xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Categories</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CategorySidebar 
              activeCategory={activeCategory} 
              onCategoryChange={(cat) => {
                setActiveCategory(cat);
                setShowMobileFilters(false);
              }} 
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Grid3X3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Integration Documentation</h1>
            <Badge variant="secondary" className="text-sm">{allIntegrations.length}+ Apps</Badge>
          </div>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            {activeCategory 
              ? categoryDescriptions[activeCategory]
              : "Professional, n8n-style documentation for all supported integrations. Each integration includes detailed setup instructions, operations, triggers, actions, examples, and troubleshooting guides."
            }
          </p>
          
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-muted-foreground/20 focus:border-primary transition-colors"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="transition-all duration-200"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="transition-all duration-200"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count and clear filters */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredIntegrations.length}</span> integration{filteredIntegrations.length !== 1 ? 's' : ''} found
          </p>
          {(searchQuery || activeCategory) && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary hover:text-primary/80"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Integration grid/list */}
        <div className={cn(
          "animate-in fade-in duration-300",
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5" 
            : "flex flex-col gap-4"
        )}>
          {filteredIntegrations.map((integration, index) => (
            <div 
              key={integration.id}
              style={{ animationDelay: `${index * 30}ms` }}
              className="animate-in fade-in slide-in-from-bottom-2"
            >
              <IntegrationCard
                integration={integration}
                onClick={() => setSelectedIntegration(integration.id)}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-16 animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No integrations found</p>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationDocs;
