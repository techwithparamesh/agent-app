import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmail() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const target = token ? `/api/auth/verify-email?token=${encodeURIComponent(token)}` : "/api/auth/verify-email";
    window.location.replace(target);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verifying your email</CardTitle>
          <CardDescription className="text-center">
            This should only take a moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground text-center">
          If you’re not redirected automatically, please check the link and try again.
        </CardContent>
      </Card>
    </div>
  );
}
