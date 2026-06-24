import { ArrowRightIcon, CalendarCheckIcon, ClipboardCheckIcon, FileTextIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Early access — join 50+ Malaysian SMEs
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-pretty sm:text-5xl lg:text-6xl">
            Your Business Operations,{" "}
            <span className="text-primary/70">One Platform</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            Nimfi helps Malaysian SMEs manage attendance, appointments,
            e-invoice-ready billing, customers, teams, and daily operations — no
            more juggling spreadsheets and messy paper trails.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg">
                Start Free
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                See Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <Card className="overflow-hidden shadow-xl ring-1 ring-foreground/5">
          <CardContent className="p-0">
            <div className="flex flex-col gap-1 bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`size-6 rounded-full border-2 border-background bg-muted-foreground/20 ${i > 0 ? "-ml-1.5" : ""}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span>Your team online now</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarCheckIcon className="size-3.5" aria-hidden="true" />
                  12 today
                </span>
                <span className="flex items-center gap-1">
                  <FileTextIcon className="size-3.5" aria-hidden="true" />
                  8 invoices
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="size-3.5" aria-hidden="true" />
                  24 customers
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border">
              {[
                { label: "Attendance", value: "6/8 checked in", icon: ClipboardCheckIcon },
                { label: "Appointments", value: "3 upcoming", icon: CalendarCheckIcon },
                { label: "Invoices", value: "RM 24,580", icon: FileTextIcon },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col items-center gap-1.5 p-6 text-center">
                    <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
