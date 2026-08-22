import { GraduationCapIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessionOrNull } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create account — Learnspace",
  description:
    "Join Learnspace and start building skills that move you forward.",
};

export default async function SignupPage() {
  const session = await getSessionOrNull();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-svh flex-col overflow-hidden bg-background px-5 py-5 sm:px-8 sm:py-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_70%_50%_at_50%_-15%,color-mix(in_oklch,var(--primary)_13%,transparent),transparent)]"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCapIcon className="size-4.5" aria-hidden="true" />
          </span>
          Learnspace
        </Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12 sm:py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Start learning today
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Create your account.
          </h1>
          <p className="mx-auto mt-3 max-w-sm leading-7 text-muted-foreground">
            Join thousands of learners turning curiosity into practical skills.
          </p>
        </div>
        <SignupForm />
        <p className="mt-8 text-center text-xs text-muted-foreground">
          No credit card required. Learn at your own pace.
        </p>
      </div>
    </main>
  );
}
