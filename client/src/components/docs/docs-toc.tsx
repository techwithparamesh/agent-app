import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface DocsTableOfContentsProps {
  items: TocItem[];
  activeId: string;
}

export function DocsTableOfContents({ items, activeId }: DocsTableOfContentsProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-20">
        <h4 className="font-semibold text-sm mb-4 text-foreground">On this page</h4>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <nav className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "block w-full text-left text-sm py-1 transition-colors",
                  "hover:text-primary",
                  item.level === 2 && "pl-0",
                  item.level === 3 && "pl-4 text-xs",
                  item.level === 4 && "pl-6 text-xs",
                  activeId === item.id
                    ? "text-primary font-medium border-l-2 border-primary -ml-px pl-3"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
