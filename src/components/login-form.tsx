"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
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
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.error) {
      errorRef.current?.focus();
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="shadow-none">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-lg font-medium tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm">
            Sign in to your account to continue.
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
                  placeholder="m@example.com"
                  autoComplete="username"
                  spellCheck={false}
                  className="h-9"
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
                  className="h-9"
                  required
                />
              </div>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
                <p
                  ref={errorRef}
                  role="alert"
                  aria-live="polite"
                  tabIndex={-1}
                  className="text-sm text-destructive"
                >
                  {state.error}
                </p>
              </div>
            )}

            <Button type="submit" disabled={pending} className="h-9 w-full">
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
