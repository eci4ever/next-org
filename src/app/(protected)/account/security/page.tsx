"use client";

import { useState } from "react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SecurityPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const twoFactorEnabled = user?.twoFactorEnabled ?? false;

  const [step, setStep] = useState<"idle" | "setup" | "verify" | "disable">("idle");
  const [password, setPassword] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await authClient.twoFactor.enable({
      password: password || undefined,
    });

    if (error) {
      toast.error(error.message ?? "Failed to enable 2FA");
    } else if (data) {
      setTotpUri(data.totpURI ?? "");
      setBackupCodes(data.backupCodes ?? []);
      setStep("verify");
    }
    setLoading(false);
    setPassword("");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.twoFactor.verifyTotp({
      code: verifyCode,
    });

    if (error) {
      toast.error(error.message ?? "Invalid code");
    } else {
      toast.success("Two-factor authentication enabled.");
      window.location.reload();
    }
    setLoading(false);
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.twoFactor.disable({
      password: disablePassword || undefined,
    });

    if (error) {
      toast.error(error.message ?? "Failed to disable 2FA");
    } else {
      toast.success("Two-factor authentication disabled.");
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
      <div className="flex flex-col gap-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight scroll-mt-20">
          Security
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account security settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            {twoFactorEnabled
              ? "Your account is protected with two-factor authentication."
              : "Add an extra layer of security to your account."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "verify" ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4 rounded-md border p-6">
                <p className="text-sm font-medium">
                  Scan this QR code with your authenticator app
                </p>
                {totpUri ? (
                  <div className="rounded-md bg-white p-4">
                    <QRCode value={totpUri} size={180} />
                  </div>
                ) : null}
              </div>
              {backupCodes.length > 0 ? (
                <div className="rounded-md border p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Backup Codes — Save These
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {backupCodes.map((code, i) => (
                      <code
                        key={i}
                        className="rounded bg-muted px-2 py-1 text-xs font-mono"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Each code can only be used once. Store these securely.
                  </p>
                </div>
              ) : null}
              <form onSubmit={handleVerify}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="verify-code">
                      Enter Code to Confirm
                    </FieldLabel>
                    <Input
                      id="verify-code"
                      type="text"
                      placeholder="123456"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Verifying…" : "Verify & Enable"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </div>
          ) : step === "setup" ? (
            <form onSubmit={handleEnable}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="password">Confirm Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Generating…" : "Enable 2FA"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : step === "disable" ? (
            <form onSubmit={handleDisable}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="disable-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="disable-password"
                    type="password"
                    autoComplete="current-password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={loading}
                  >
                    {loading ? "Disabling…" : "Disable 2FA"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          ) : twoFactorEnabled ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Two-factor authentication is currently{" "}
                <span className="font-medium text-foreground">enabled</span>.
              </p>
              <div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setStep("disable")}
                >
                  Disable 2FA
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>

        {!twoFactorEnabled && step === "idle" ? (
          <CardFooter>
            <Button onClick={() => setStep("setup")}>Enable 2FA</Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
