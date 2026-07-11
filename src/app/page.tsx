

import {
  Building2Icon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: <Building2Icon className="size-5" aria-hidden="true" />,
    title: "Organizations",
    description: "Create and manage multiple organizations with teams and roles.",
  },
  {
    icon: <UsersIcon className="size-5" aria-hidden="true" />,
    title: "User Management",
    description: "Admin dashboard to manage users, roles, bans, and impersonation.",
  },
  {
    icon: <ShieldCheckIcon className="size-5" aria-hidden="true" />,
    title: "Two-Factor Auth",
    description: "Built-in 2FA and email verification for enhanced security.",
  },
  {
    icon: <KeyRoundIcon className="size-5" aria-hidden="true" />,
    title: "Passkey Support",
    description: "Passwordless sign-in with WebAuthn passkeys out of the box.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Nimfi
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button nativeButton={false} variant="ghost" size="lg" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button nativeButton={false} size="lg" render={<Link href="/signup" />}>
            Sign up
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <LayoutDashboardIcon className="size-3.5" aria-hidden="true" />
            All-in-one organization platform
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Build, organize, and grow with Nimfi
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            A modern platform to manage your teams, organizations, and workflow —
            all in one place.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Button nativeButton={false} size="lg" render={<Link href="/signup" />}>
              Get started free
            </Button>
            <Button nativeButton={false} variant="outline" size="lg" render={<Link href="/login" />}>
              Log in
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="shadow-none">
              <CardContent className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-foreground">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nimfi. All rights reserved.
      </footer>
    </div>
  );
}
