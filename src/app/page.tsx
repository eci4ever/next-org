import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ShieldIcon,
    title: "Role-based access",
    description: "Admin and user roles with granular permissions.",
  },
  {
    icon: UsersIcon,
    title: "User management",
    description:
      "Create, manage, and impersonate users from a central dashboard.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Dashboard",
    description: "Real-time insights into your platform usage and metrics.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-16 px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/20">
            <GalleryVerticalEndIcon className="size-6" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="max-w-2xl bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              Welcome to Your App
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              A modern platform to manage your workflow. Get started by creating
              an account or signing in.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-lg border p-5 text-left"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground">
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
