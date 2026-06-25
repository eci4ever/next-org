"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SendResetLink({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setError("");
    setLoading(true);

    const { error: err } = await authClient.emailOtp.requestPasswordReset({
      email,
    });

    if (err) {
      setError(err.message ?? "Failed to send reset code");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {sent
            ? "Check your email for the reset code. Use it to set a new password."
            : "We'll send a 6-digit reset code to your email address."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {sent ? (
          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className={buttonVariants()}
          >
            Enter Reset Code
          </Link>
        ) : (
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Sending…" : "Send Reset Code"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
