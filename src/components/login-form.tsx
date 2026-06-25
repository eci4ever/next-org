"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { signIn } from "@/actions/auth";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signIn, undefined);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      PublicKeyCredential &&
      typeof PublicKeyCredential.isConditionalMediationAvailable === "function"
    ) {
      PublicKeyCredential.isConditionalMediationAvailable().then((available) => {
        if (available) {
          void authClient.signIn.passkey({ autoFill: true });
        }
      });
    }
  }, []);

  const handlePasskeySignIn = async () => {
    const { error } = await authClient.signIn.passkey();
    if (error) {
      toast.error(error.message ?? "Passkey sign-in failed");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="username webauthn"
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
                <Input id="password" name="password" type="password" autoComplete="current-password webauthn" required />
              </Field>
              <Field>
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Signing In…" : "Sign In"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <Separator className="my-4" />
          <Button
            variant="outline"
            className="w-full"
            onClick={handlePasskeySignIn}
          >
            Sign In with Passkey
          </Button>
          <FieldDescription className="text-center mt-4">
            Don\u2019t have an account?{" "}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Sign Up
            </Link>
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  );
}
