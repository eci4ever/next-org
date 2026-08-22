"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function ResendVerification({ email }: { email: string }) {
  const handleResend = useCallback(async () => {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error(error.message ?? "Failed to resend verification email.");
    } else {
      toast.success("Verification email sent. Check your inbox.");
    }
  }, [email]);

  useEffect(() => {
    toast.warning("Email not verified", {
      id: `email-verification-${email}`,
      description: "Verify your email to enable all features.",
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: "Resend email",
        onClick: handleResend,
      },
    });

    return () => {
      toast.dismiss(`email-verification-${email}`);
    };
  }, [email, handleResend]);

  return null;
}
