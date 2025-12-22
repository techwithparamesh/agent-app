import { useState } from "react";
import { ChevronDown, ChevronRight, Search, Book, Rocket, Settings, Zap, MessageSquare, Users, HelpCircle, Star, BookOpen, Link2, Grid3X3, Home, FileText, Database, Shield, Code, Workflow, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  children?: { id: string; title: string }[];
}

export const docSections: DocSection[] = [
  {
    id: "product-overview",
    title: "Product Overview",
    icon: Home,
    children: [
      { id: "what-is-this", title: "What is AgentForge?" },
      { id: "who-is-it-for", title: "Who is it for?" },
      { id: "key-benefits", title: "Key Benefits" },
      { id: "use-cases", title: "Use Cases" },
    ],
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    children: [
      { id: "quick-start", title: "Quick Start (5 min)" },
      { id: "prerequisites", title: "Prerequisites" },
      { id: "create-agent", title: "Create an Agent" },
      { id: "populate-knowledge", title: "Add Knowledge" },
    ],
  },
  {
    id: "how-it-works",
    title: "How It Works",
    icon: Workflow,
    children: [
      { id: "architecture", title: "Architecture" },
      { id: "ai-engine", title: "AI Engine" },
      { id: "knowledge-base", title: "Knowledge Base" },
    ],
  },
  {
    id: "user-guide",
    title: "User Guide",
    icon: Book,
    children: [
      { id: "dashboard-overview", title: "Dashboard Overview" },
      { id: "managing-agents", title: "Managing Agents" },
      { id: "knowledge-management", title: "Knowledge Management" },
      { id: "test-chatbot", title: "Test the Chatbot" },
      { id: "deploy-website", title: "Deploy on Website" },
      { id: "deploy-whatsapp", title: "Deploy on WhatsApp" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Zap,
    children: [
      { id: "integrations-overview", title: "Overview" },
      { id: "workflow-builder", title: "Workflow Builder" },
      { id: "triggers-actions", title: "Triggers & Actions" },
      { id: "field-mapping", title: "Field Mapping" },
    ],
  },
  {
    id: "integration-apps",
    title: "Integration Apps",
    icon: Grid3X3,
    children: [
      { id: "communication-apps", title: "Communication" },
      { id: "productivity-apps", title: "Productivity" },
      { id: "crm-apps", title: "CRM & Sales" },
      { id: "ecommerce-apps", title: "E-commerce" },
      { id: "marketing-apps", title: "Marketing" },
      { id: "developer-apps", title: "Developer Tools" },
      { id: "database-apps", title: "Databases" },
      { id: "ai-apps", title: "AI & Analytics" },
    ],
  },
  {
    id: "whatsapp-guide",
    title: "WhatsApp AI Agent",
    icon: MessageSquare,
    children: [
      { id: "whatsapp-setup", title: "Setup Guide" },
      { id: "message-flow", title: "Message Flow" },
      { id: "templates", title: "Message Templates" },
      { id: "whatsapp-errors", title: "Error Handling" },
    ],
  },
  {
    id: "admin-guide",
    title: "Admin Guide",
    icon: Shield,
    children: [
      { id: "user-management", title: "User Management" },
      { id: "agent-management", title: "Agent Management" },
      { id: "conversations", title: "Conversations" },
      { id: "analytics", title: "Analytics & Logs" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: Code,
    children: [
      { id: "api-overview", title: "API Overview" },
      { id: "authentication", title: "Authentication" },
      { id: "endpoints", title: "Endpoints" },
      { id: "webhooks", title: "Webhooks" },
    ],
  },
  {
    id: "faqs",
    title: "FAQs",
    icon: HelpCircle,
    children: [
      { id: "general-faqs", title: "General" },
      { id: "troubleshooting", title: "Troubleshooting" },
    ],
  },
  {
    id: "best-practices",
    title: "Best Practices",
    icon: Star,
  },
  {
    id: "glossary",
    title: "Glossary",
    icon: BookOpen,
  },
  {
    id: "resources",
    title: "Resources",
    icon: Link2,
  },
];

interface DocsSidebarProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export function DocsSidebar({ activeSection, onSectionClick }: DocsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "product-overview",
    "getting-started",
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSectionClick = (sectionId: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleSection(sectionId);
    }
    onSectionClick(sectionId);
  };

  const filteredSections = searchQuery
    ? docSections.filter(
        (section) =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.children?.some((child) =>
            child.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : docSections;

  return (
    <div className="flex flex-col h-full border-r bg-muted/30">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-1">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            const hasChildren = section.children && section.children.length > 0;
            const isActive = activeSection === section.id || 
              section.children?.some(child => activeSection === child.id);

            return (
              <div key={section.id}>
                <button
                  onClick={() => handleSectionClick(section.id, !!hasChildren)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{section.title}</span>
                  {hasChildren && (
                    <span className="shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l pl-3">
                    {section.children!.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onSectionClick(child.id)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          activeSection === child.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
