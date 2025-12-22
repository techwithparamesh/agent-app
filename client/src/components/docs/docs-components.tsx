import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Copy, Info, AlertTriangle, CheckCircle2, XCircle, Lightbulb, ArrowRight, ExternalLink, Terminal, Code2 } from "lucide-react";
import { useState } from "react";

// Section wrapper with proper ID for navigation
export function DocsSection({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-20", className)}>
      {children}
    </section>
  );
}

// Main title (h1)
export function DocsTitle({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{children}</h1>
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </div>
    </div>
  );
}

// Description under title
export function DocsDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-lg text-muted-foreground mb-8">{children}</p>;
}

// Section heading (h2)
export function DocsHeading({ id, children, badge }: { id?: string; children: React.ReactNode; badge?: string }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight mt-12 mb-4 scroll-mt-20 flex items-center gap-3">
      {children}
      {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
    </h2>
  );
}

// Subheading (h3)
export function DocsSubheading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-xl font-semibold mt-8 mb-3 scroll-mt-20">
      {children}
    </h3>
  );
}

// Minor heading (h4)
export function DocsMinorHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h4 id={id} className="text-lg font-medium mt-6 mb-2 scroll-mt-20">
      {children}
    </h4>
  );
}

// Paragraph
export function DocsParagraph({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-muted-foreground leading-7 mb-4", className)}>{children}</p>;
}

// Inline code
export function DocsInlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}

// Code block with copy button
export function DocsCodeBlock({ 
  children, 
  language = "text", 
  title,
  showLineNumbers = false 
}: { 
  children: string; 
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg border bg-zinc-950 dark:bg-zinc-900">
      {title && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">{title}</span>
          </div>
          <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
            {language}
          </Badge>
        </div>
      )}
      <div className="relative">
        <pre className={cn(
          "overflow-x-auto p-4 text-sm text-zinc-100",
          showLineNumbers && "pl-12"
        )}>
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-zinc-900/50 flex flex-col items-end pr-2 pt-4 text-xs text-zinc-600 select-none">
              {children.split('\n').map((_, i) => (
                <span key={i} className="leading-6">{i + 1}</span>
              ))}
            </div>
          )}
          <code className="font-mono">{children}</code>
        </pre>
        <button
          onClick={copyCode}
          className="absolute right-2 top-2 p-2 rounded-md hover:bg-zinc-800 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-400" />
          )}
        </button>
      </div>
    </div>
  );
}

// List
export function DocsList({ 
  children, 
  ordered = false,
  className 
}: { 
  children: React.ReactNode; 
  ordered?: boolean;
  className?: string;
}) {
  const Component = ordered ? "ol" : "ul";
  return (
    <Component className={cn(
      "my-4 space-y-2",
      ordered ? "list-decimal list-inside" : "list-disc list-inside",
      "text-muted-foreground",
      className
    )}>
      {children}
    </Component>
  );
}

export function DocsListItem({ children }: { children: React.ReactNode }) {
  return <li className="leading-7">{children}</li>;
}

// Callout boxes
type CalloutType = "info" | "warning" | "success" | "error" | "tip";

const calloutConfig: Record<CalloutType, { icon: React.ElementType; className: string; title: string }> = {
  info: { icon: Info, className: "border-blue-500/50 bg-blue-500/10", title: "Info" },
  warning: { icon: AlertTriangle, className: "border-yellow-500/50 bg-yellow-500/10", title: "Warning" },
  success: { icon: CheckCircle2, className: "border-green-500/50 bg-green-500/10", title: "Success" },
  error: { icon: XCircle, className: "border-red-500/50 bg-red-500/10", title: "Error" },
  tip: { icon: Lightbulb, className: "border-purple-500/50 bg-purple-500/10", title: "Tip" },
};

export function DocsCallout({ 
  type = "info", 
  title, 
  children 
}: { 
  type?: CalloutType; 
  title?: string; 
  children: React.ReactNode;
}) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("my-6 rounded-lg border-l-4 p-4", config.className)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <h5 className="font-semibold mb-1">{title}</h5>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Feature card
export function DocsFeatureCard({ 
  icon: Icon, 
  title, 
  description,
  href 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  href?: string;
}) {
  const content = (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {title}
            {href && <ArrowRight className="inline-block ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  return content;
}

// Grid for feature cards
export function DocsCardGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  return (
    <div className={cn(
      "grid gap-4 my-6",
      columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
    )}>
      {children}
    </div>
  );
}

// Step-by-step guide
export function DocsSteps({ children }: { children: React.ReactNode }) {
  return <div className="my-6 space-y-4">{children}</div>;
}

export function DocsStep({ 
  number, 
  title, 
  children 
}: { 
  number: number; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-semibold mb-2">{title}</h4>
        <div className="text-muted-foreground text-sm">{children}</div>
      </div>
    </div>
  );
}

// Table
export function DocsTable({ 
  headers, 
  rows 
}: { 
  headers: string[]; 
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Link with external indicator
export function DocsLink({ 
  href, 
  children, 
  external = false 
}: { 
  href: string; 
  children: React.ReactNode; 
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-primary hover:underline inline-flex items-center gap-1"
    >
      {children}
      {external && <ExternalLink className="h-3 w-3" />}
    </a>
  );
}

// Tabs for multiple examples
export { Tabs, TabsContent, TabsList, TabsTrigger };

// Integration card for the apps section
export function DocsIntegrationCard({
  name,
  icon,
  description,
  category,
  href
}: {
  name: string;
  icon: React.ReactNode;
  description: string;
  category: string;
  href?: string;
}) {
  const content = (
    <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                {name}
              </h4>
              <Badge variant="outline" className="text-xs shrink-0">
                {category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  return content;
}
