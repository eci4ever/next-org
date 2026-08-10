import { sql } from "drizzle-orm";
import {
  ActivityIcon,
  ArrowRightIcon,
  DatabaseIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  ServerIcon,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";

async function checkDatabase() {
  const startedAt = performance.now();

  try {
    await db.execute(sql`select 1`);

    return {
      healthy: true,
      latency: Math.max(1, Math.round(performance.now() - startedAt)),
    };
  } catch {
    return {
      healthy: false,
      latency: null,
    };
  }
}

export default async function Home() {
  await connection();
  const database = await checkDatabase();

  const checks = [
    {
      label: "Server health",
      value: "Operational",
      healthy: true,
      icon: ServerIcon,
    },
    {
      label: "Database health",
      value: database.healthy ? "Connected" : "Unavailable",
      healthy: database.healthy,
      icon: DatabaseIcon,
    },
    {
      label: "Database latency",
      value:
        database.latency === null ? "Unavailable" : `${database.latency} ms`,
      healthy: database.healthy,
      icon: GaugeIcon,
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ActivityIcon className="size-4" aria-hidden="true" />
          </span>
          System status
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <section className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-sm font-medium">
              <span
                className={`size-2 rounded-full ${
                  database.healthy ? "bg-emerald-500" : "bg-destructive"
                }`}
                aria-hidden="true"
              />
              {database.healthy
                ? "All systems operational"
                : "Service disruption detected"}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              {database.healthy
                ? "Everything is running smoothly."
                : "Some systems need attention."}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Live infrastructure checks provide a current view of server
              availability, database connectivity, and response latency.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                nativeButton={false}
                size="lg"
                render={<Link href="/dashboard" />}
              >
                <LayoutDashboardIcon data-icon="inline-start" />
                Open dashboard
              </Button>
              <Button
                nativeButton={false}
                variant="outline"
                size="lg"
                render={<Link href="/login" />}
              >
                Sign in
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </section>

          <section className="mt-16" aria-labelledby="health-heading">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Live checks
                </p>
                <h2 id="health-heading" className="text-xl font-semibold">
                  Infrastructure health
                </h2>
              </div>
              <Badge variant={database.healthy ? "secondary" : "destructive"}>
                {database.healthy ? "Healthy" : "Degraded"}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {checks.map(({ label, value, healthy, icon: Icon }) => (
                <Card key={label} className="shadow-none">
                  <CardContent>
                    <div className="mb-8 flex items-start justify-between gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <span
                        className={`mt-1 size-2.5 rounded-full ${
                          healthy ? "bg-emerald-500" : "bg-destructive"
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
        <span>Live system monitoring</span>
        <span>Refresh to run a new check</span>
      </footer>
    </div>
  );
}
