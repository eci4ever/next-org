"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error: err } = await authClient.emailOtp.requestPasswordReset({
      email,
    });

    if (err) {
      toast.error(err.message ?? "Failed to send reset code");
    } else {
      toast.success("Reset code sent. Check your email.");
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check Your Email</CardTitle>
            <CardDescription>
              We sent a 6-digit reset code to <strong>{email}</strong>. Enter
              the code on the next page to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
              <Button>Enter Reset Code</Button>
            </Link>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Try a different email
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a reset code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending…" : "Send Reset Code"}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Sign In
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
