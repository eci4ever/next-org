"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
      <p className="flex-1 text-sm text-muted-foreground">
        Your email is not yet verified. Verify your email to enable all
        features.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={loading}
        className="shrink-0"
      >
        {loading ? "Sending…" : "Resend Email"}
      </Button>
    </div>
  );
}
