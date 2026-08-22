"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/session";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, pending] = useActionState(signIn, undefined);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.error) {
      errorRef.current?.focus();
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="border-0 bg-muted/35 shadow-none ring-1 ring-foreground/10">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Sign in to Learnspace
          </CardTitle>
          <CardDescription className="text-sm">
            Enter your details below to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form action={formAction} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="username"
                  spellCheck={false}
                  className="h-10 bg-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="h-10 bg-background"
                  required
                />
              </div>
            </div>

            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription
                  ref={errorRef}
                  aria-live="polite"
                  tabIndex={-1}
                >
                  {state.error}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={pending} className="h-10 w-full">
              {pending ? "Signing in…" : "Continue learning"}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
