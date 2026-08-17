"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function ResendVerification({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error(error.message ?? "Failed to resend verification email.");
    } else {
      toast.success("Verification email sent. Check your inbox.");
    }
    setLoading(false);
  };

  return (
    <Alert variant="destructive">
      <AlertDescription>
        Your email is not yet verified. Verify your email to enable all
        features.
      </AlertDescription>
      <AlertAction>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? "Sending…" : "Resend Email"}
        </Button>
      </AlertAction>
    </Alert>
  );
}
