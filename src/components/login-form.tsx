"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/actions/auth";
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
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            {state?.error ? (
              <p className="mb-4 text-sm text-destructive" role="alert">{state.error}</p>
            ) : null}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  spellCheck={false}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm underline underline-offset-4 hover:text-foreground"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </Field>
              <Field>
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Signing In…" : "Sign In"}
                </Button>
                <FieldDescription className="text-center">
                  Don\u2019t have an account?{" "}
                  <Link
                    href="/signup"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Sign Up
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
