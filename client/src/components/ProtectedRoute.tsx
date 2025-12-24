import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that wraps dashboard routes
 * Prevents flash of content before auth check completes
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Store intended destination for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        setLocation(redirectTo);
      } else {
        setIsChecking(false);
      }
    }
  }, [user, isLoading, setLocation, redirectTo]);

  // Show loading while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
