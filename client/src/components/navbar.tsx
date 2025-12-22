import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Bot, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for navbar background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
      scrolled 
        ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-sm' 
        : 'bg-background/50 backdrop-blur-md border-b border-transparent'
    }`}>
      <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl group" data-testid="link-logo">
          <div className="relative">
            <Bot className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <Sparkles className="h-3 w-3 text-chart-4 absolute -top-1 -right-1 animate-pulse-soft" />
          </div>
          <span className="tracking-tight bg-gradient-to-r from-foreground to-foreground hover:from-primary hover:to-chart-3 bg-clip-text transition-all">AgentForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={`relative overflow-hidden transition-all ${
                  location === link.href 
                    ? "bg-accent text-primary" 
                    : "hover:bg-accent/50"
                }`}
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
                {location === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-chart-3" />
                )}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isLoading ? (
            <div className="w-20 h-9 bg-muted animate-shimmer rounded-md" />
          ) : isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="btn-shine group" data-testid="button-dashboard">
                Dashboard
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-accent/50" data-testid="button-login">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="btn-shine bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-chart-3 transition-all duration-300" data-testid="button-signup">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu with animation */}
      <div className={`md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border transition-all duration-300 overflow-hidden ${
        mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 flex flex-col gap-2">
          {navLinks.map((link, index) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start animate-fade-in-left ${location === link.href ? 'bg-accent text-primary' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
            <ThemeToggle />
            {!isLoading && !isAuthenticated && (
              <>
                <Link href="/login" className="flex-1">
                  <Button variant="ghost" className="w-full">Log In</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full btn-shine">Get Started</Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full btn-shine" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
