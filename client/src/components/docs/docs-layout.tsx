import { useState, useEffect, useRef } from "react";
import { DocsSidebar, docSections } from "./docs-sidebar";
import { DocsTableOfContents, TocItem } from "./docs-toc";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: React.ReactNode;
  tocItems?: TocItem[];
}

export function DocsLayout({ children, tocItems = [] }: DocsLayoutProps) {
  const [activeSection, setActiveSection] = useState("product-overview");
  const [activeTocItem, setActiveTocItem] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track scroll position to update active TOC item
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const headings = contentRef.current.querySelectorAll("h2[id], h3[id], h4[id]");
      let currentActive = "";

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          currentActive = heading.id;
        }
      });

      if (currentActive) {
        setActiveTocItem(currentActive);
        // Also update main section based on scroll
        const section = docSections.find(
          (s) => s.id === currentActive || s.children?.some((c) => c.id === currentActive)
        );
        if (section) {
          setActiveSection(currentActive);
        }
      }
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);

    // Scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Find prev/next sections for navigation
  const flatSections = docSections.flatMap((section) => [
    section,
    ...(section.children?.map((child) => ({ ...child, parentId: section.id })) || []),
  ]);
  const currentIndex = flatSections.findIndex((s) => s.id === activeSection);
  const prevSection = currentIndex > 0 ? flatSections[currentIndex - 1] : null;
  const nextSection = currentIndex < flatSections.length - 1 ? flatSections[currentIndex + 1] : null;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <DocsSidebar activeSection={activeSection} onSectionClick={handleSectionClick} />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <main className="flex-1 flex min-w-0">
        <ScrollArea ref={contentRef} className="flex-1 px-4 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <a href="/docs" className="hover:text-primary">
                Docs
              </a>
              <span>/</span>
              <span className="text-foreground">
                {docSections.find((s) => s.id === activeSection || s.children?.some((c) => c.id === activeSection))?.title}
              </span>
            </nav>

            {/* Content */}
            <div className="docs-content">{children}</div>

            {/* Prev/Next navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t">
              {prevSection ? (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => handleSectionClick(prevSection.id)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-muted-foreground">Previous</span>
                  <span className="font-medium">{prevSection.title}</span>
                </Button>
              ) : (
                <div />
              )}
              {nextSection ? (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => handleSectionClick(nextSection.id)}
                >
                  <span className="text-muted-foreground">Next</span>
                  <span className="font-medium">{nextSection.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <div />
              )}
            </div>

            {/* Feedback section */}
            <div className="mt-8 p-6 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Was this helpful?</h4>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  Yes
                </Button>
                <Button variant="outline" size="sm">
                  No
                </Button>
                <a
                  href="mailto:support@agentforge.app"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Report an issue <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Right sidebar - Table of Contents */}
        <DocsTableOfContents items={tocItems} activeId={activeTocItem} />
      </main>
    </div>
  );
}
