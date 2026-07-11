"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No verification token found.");
      return;
    }

    const verify = async () => {
      const { error: err } = await authClient.verifyEmail({
        query: { token },
      });

      if (err) {
        setStatus("error");
        setError(err.message ?? "Failed to verify email");
      } else {
        setStatus("success");
      }
    };

    verify();
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {status === "loading"
            ? "Verifying Email…"
            : status === "success"
              ? "Account Verified"
              : "Verification Failed"}
        </CardTitle>
        <CardDescription>
          {status === "loading"
            ? "Please wait while we verify your email address."
            : status === "success"
              ? "Your account has been successfully verified. You can now sign in and continue."
              : error}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {status === "loading" ? (
          <Spinner />
        ) : status === "success" ? (
          <Link href="/login">
            <Button>Continue to Login</Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline">Back to Sign In</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Nimfi
        </Link>
        <Suspense
          fallback={
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Verifying Email…</CardTitle>
                <CardDescription>
                  Please wait while we verify your email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Spinner />
              </CardContent>
            </Card>
          }
        >
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
