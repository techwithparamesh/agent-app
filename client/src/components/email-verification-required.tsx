import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function isEmailVerificationRequiredError(error: unknown): boolean {
  const anyError = error as any;
  return anyError?.code === "email_verification_required";
}

export function EmailVerificationRequiredInline(props: { featureName: string }) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  return (
    <Alert>
      <AlertTitle>Email verification required</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            To use {props.featureName}, please verify your email address. You can request a new verification email below.
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
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
