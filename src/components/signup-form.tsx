"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
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
import { signUp } from "@/lib/session";
import { cn } from "@/lib/utils";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, pending] = useActionState(signUp, undefined);

  useEffect(() => {
    if (state?.error) {
      toast.error("Unable to create account", { description: state.error });
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="border-0 bg-muted/35 shadow-none ring-1 ring-foreground/10">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Join Learnspace
          </CardTitle>
          <CardDescription className="text-sm">
            Set up your learner profile in a few seconds.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                className="h-10 bg-background"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  spellCheck={false}
                  className="h-10 bg-background"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className="h-10 bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    className="h-10 bg-background"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long.
              </p>
            </div>

            <Button type="submit" disabled={pending} className="h-10 w-full">
              {pending ? "Creating account…" : "Start learning free"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
