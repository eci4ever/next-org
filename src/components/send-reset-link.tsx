"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SendResetLink({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dialogError, setDialogError] = useState("");

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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError("");

    if (password !== confirm) {
      setDialogError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setDialogError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error: err } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    });

    if (err) {
      setDialogError(err.message ?? "Failed to reset password");
    } else {
      setResetDone(true);
      setDialogOpen(false);
      setOtp("");
      setPassword("");
      setConfirm("");
    }
    setLoading(false);
  };

  const openDialog = () => {
    setDialogError("");
    setOtp("");
    setPassword("");
    setConfirm("");
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {resetDone
            ? "Your password has been reset successfully."
            : sent
              ? "Check your email for the 6-digit reset code."
              : "We'll send a reset code to your email address."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {resetDone ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Password updated
          </div>
        ) : sent ? (
          <Button onClick={openDialog} variant="default">
            Enter Reset Code
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Sending…" : "Send Reset Code"}
          </Button>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter the code sent to {email} and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReset}>
            {dialogError ? (
              <p className="mb-4 text-sm text-destructive" role="alert">
                {dialogError}
              </p>
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-otp">Reset Code</FieldLabel>
                <Input
                  id="reset-otp"
                  type="text"
                  placeholder="123456"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reset-password">
                  New Password
                </FieldLabel>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reset-confirm">
                  Confirm New Password
                </FieldLabel>
                <Input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Resetting…" : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
