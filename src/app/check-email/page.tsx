"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error(error.message ?? "Failed to resend verification email.");
    } else {
      toast.success("Verification email sent", {
        description: "Check your inbox for a new verification link.",
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-medium">Check Your Email</CardTitle>
        <CardDescription>
          We sent a verification link to{" "}
          <strong>{email || "your email address"}</strong>. Click the link in
          the email to verify your account and get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-center">
        {email ? (
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Sending…" : "Resend Verification Email"}
          </Button>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Did not receive the email? Check your spam folder or try signing up
          again.
        </p>
        <Link
          href="/login"
          className="text-sm underline underline-offset-4 hover:text-foreground"
        >
          Back to Sign In
        </Link>
      </CardContent>
    </Card>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Nimfi
        </Link>
        <Suspense
          fallback={
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-medium">
                  Check Your Email
                </CardTitle>
                <CardDescription>
                  We sent a verification link to your email address.
                </CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <CheckEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
