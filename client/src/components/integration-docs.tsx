import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { 
  ChevronRight, ChevronDown, Search, ExternalLink, Copy, Check,
  Zap, MessageSquare, Mail, Users, ShoppingCart, FileText, Database, 
  Code, Brain, ArrowLeft, BookOpen, AlertTriangle, Lightbulb, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  marketing: Zap,
};

// Code block component with copy
function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

// Callout component
function Callout({ type, title, children }: { type: "info" | "warning" | "tip"; title: string; children: React.ReactNode }) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
    tip: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
  };
  const icons = {
    info: BookOpen,
    warning: AlertTriangle,
    tip: Lightbulb,
  };
  const Icon = icons[type];
  
  return (
    <div className={cn("flex gap-3 p-4 rounded-lg border", styles[type])}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium mb-1">{title}</p>
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

// Integration card for list view
function IntegrationCard({ integration, onClick }: { integration: Integration; onClick: () => void }) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: integration.color }}
          >
            {integration.name.charAt(0)}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <CardTitle className="text-lg mt-3">{integration.name}</CardTitle>
        <CardDescription className="line-clamp-2">{integration.shortDescription}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5">
          {integration.features.slice(0, 3).map((feature, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {integration.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{integration.features.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Category sidebar
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
        variant={activeCategory === null ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => onCategoryChange(null)}
      >
        <Zap className="h-4 w-4 mr-2" />
        All Integrations
        <Badge variant="outline" className="ml-auto">{allIntegrations.length}</Badge>
      </Button>
      
      <Separator className="my-3" />
      
      {categories.map((category) => {
        const Icon = categoryIcons[category];
        const count = integrationsByCategory[category].length;
        
        return (
          <Button
            key={category}
            variant={activeCategory === category ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onCategoryChange(category)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {categoryLabels[category]}
            <Badge variant="outline" className="ml-auto">{count}</Badge>
          </Button>
        );
      })}
    </div>
  );
}

// Integration detail page component
function IntegrationDetailPage({ integration }: { integration: Integration }) {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2"
        onClick={() => setLocation("/docs")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Integrations
      </Button>

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div 
          className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
          style={{ backgroundColor: integration.color }}
        >
          {integration.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{integration.name}</h1>
            <Badge>{categoryLabels[integration.category]}</Badge>
          </div>
          <p className="text-lg text-muted-foreground mb-4">{integration.description}</p>
          <div className="flex gap-3">
            {integration.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={integration.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {integration.documentationUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={integration.documentationUrl} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Official Docs
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credentials">Setup</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="troubleshooting">Issues</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {integration.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Use Cases</CardTitle>
              <CardDescription>Common scenarios where this integration shines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {integration.useCases.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Play className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Triggers & Actions Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            {integration.triggers && integration.triggers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Triggers
                  </CardTitle>
                  <CardDescription>Events that start workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {integration.triggers.map((trigger, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <p className="font-medium text-sm">{trigger.name}</p>
                      <p className="text-xs text-muted-foreground">{trigger.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {integration.actions && integration.actions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-500" />
                    Actions
                  </CardTitle>
                  <CardDescription>Operations you can perform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {integration.actions.map((action, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <p className="font-medium text-sm">{action.name}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication</CardTitle>
              <CardDescription>
                This integration uses <Badge variant="outline">{integration.credentialType}</Badge> authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integration.requiredScopes && integration.requiredScopes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2 text-sm">Required Scopes/Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {integration.requiredScopes.map((scope, i) => (
                      <code key={i} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {scope}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to connect {integration.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integration.credentialSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {step.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-medium mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.note && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
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
        <TabsContent value="operations" className="space-y-6">
          {integration.operations.map((operation, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">{operation.name}</CardTitle>
                <CardDescription>{operation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-3 text-sm">Parameters</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Field</th>
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-left p-3 font-medium">Required</th>
                        <th className="text-left p-3 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operation.fields && operation.fields.map((field, j) => (
                        <tr key={j} className="border-t">
                          <td className="p-3 font-mono text-xs">{field.name}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">{field.type}</Badge>
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
        <TabsContent value="examples" className="space-y-6">
          {integration.examples && integration.examples.length > 0 ? (
            integration.examples.map((example, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {example.steps && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Workflow Steps</h4>
                      <ol className="space-y-2">
                        {example.steps.map((step, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                              {j + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {example.code && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Example Payload</h4>
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
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Issues</CardTitle>
              <CardDescription>Solutions to frequently encountered problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.commonIssues && integration.commonIssues.length > 0 ? (
                integration.commonIssues.map((issue, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {issue.problem}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Cause:</span> <span className="text-muted-foreground">{issue.cause}</span></p>
                      <p><span className="font-medium">Solution:</span> <span className="text-muted-foreground">{issue.solution}</span></p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No common issues documented yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Related Integrations */}
          {integration.relatedIntegrations && integration.relatedIntegrations.length > 0 && (
            <Card>
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
                        onClick={() => setLocation(`/docs/integration/${relatedId}`)}
                      >
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
            <Card>
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
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
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

  // Filter integrations based on search and category
  const filteredIntegrations = searchQuery
    ? searchIntegrations(searchQuery)
    : activeCategory
    ? integrationsByCategory[activeCategory]
    : allIntegrations;

  // If an integration is selected, show detail view
  if (selectedIntegration) {
    const integration = getIntegrationById(selectedIntegration);
    if (integration) {
      return (
        <div className="py-8 px-4">
          <IntegrationDetailPage 
            integration={integration} 
          />
        </div>
      );
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r p-4 hidden lg:block">
        <h3 className="font-semibold mb-4">Categories</h3>
        <CategorySidebar 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integration Documentation</h1>
          <p className="text-muted-foreground mb-6">
            {activeCategory 
              ? categoryDescriptions[activeCategory]
              : "Browse detailed documentation for all supported integrations."
            }
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredIntegrations.length} integration{filteredIntegrations.length !== 1 ? 's' : ''} found
          </p>
          {(searchQuery || activeCategory) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Integration grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onClick={() => setSelectedIntegration(integration.id)}
            />
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No integrations found matching your search.</p>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery("");
                setActiveCategory(null);
              }}
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegrationDocs;
