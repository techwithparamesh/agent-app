import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading, refetchUser } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const isEmailVerified = useMemo(() => {
    return Boolean((user as any)?.emailVerified);
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access the dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("email_verified") === "1") {
      toast({
        title: "Email verified",
        description: "Thanks — your account is now verified.",
      });
      params.delete("email_verified");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
      refetchUser();
    }
  }, [toast, refetchUser]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r border-border bg-sidebar p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 h-16 px-6 md:px-8 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger aria-label="Toggle sidebar" data-testid="button-sidebar-toggle" />
              {title && (
                <h1 className="text-sm font-medium text-muted-foreground truncate">
                  {title}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 md:p-8">
            {!isEmailVerified && (
              <div className="mb-6">
                <Alert>
                  <AlertTitle>Verify your email to unlock all features</AlertTitle>
                  <AlertDescription>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        Some sensitive features (WhatsApp and Insurance) require a verified email. You can keep using the
                        app in the meantime.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isResending}
                        onClick={async () => {
                          try {
                            setIsResending(true);
                            const res = await fetch("/api/auth/resend-verification", {
                              method: "POST",
                              credentials: "include",
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              throw new Error((data as any)?.message || "Failed to resend verification email");
                            }
                            toast({
                              title: "Verification email sent",
                              description: "Check your inbox (and spam) for the link.",
                            });
                          } catch (e) {
                            const message = e instanceof Error ? e.message : "Failed to resend verification email";
                            toast({
                              title: "Could not resend",
                              description: message,
                              variant: "destructive",
                            });
                          } finally {
                            setIsResending(false);
                          }
                        }}
                      >
                        {isResending ? "Sending..." : "Resend email"}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
