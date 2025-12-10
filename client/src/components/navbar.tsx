import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Bot } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl h-full px-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl" data-testid="link-logo">
          <Bot className="h-7 w-7 text-primary" />
          <span className="tracking-tight">AgentForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={location === link.href ? "bg-accent" : ""}
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {isLoading ? (
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <Link href="/dashboard">
              <Button data-testid="button-dashboard">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button data-testid="button-signup">Get Started</Button>
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

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className="w-full justify-start"
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
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
