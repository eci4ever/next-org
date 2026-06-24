import {
  Building2Icon,
  ScissorsIcon,
  StethoscopeIcon,
  StoreIcon,
} from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const cases = [
  {
    icon: StoreIcon,
    title: "Retail & F&B",
    description:
      "Track staff shifts, log daily sales notes, manage supplier invoices, and stay e-invoice compliant before LHDN enforcement.",
  },
  {
    icon: ScissorsIcon,
    title: "Salons & Clinics",
    description:
      "Book appointments, send reminders, manage walk-ins, and bill customers — all from one screen. No double-booking ever.",
  },
  {
    icon: StethoscopeIcon,
    title: "Healthcare & Wellness",
    description:
      "Manage patient records, treatment schedules, and insurance billing. Keep attendance logs for support staff.",
  },
  {
    icon: Building2Icon,
    title: "Professional Services",
    description:
      "Track billable hours, invoice clients, manage projects, and onboard contractors with role-based access.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-20 mt-40 @md:mt-52">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col @lg:grid @lg:grid-cols-12 gap-x-5 gap-y-6 items-baseline">
          <div className="@lg:col-span-5">
            <h2 className="text-4xl font-[450] tracking-[-3.36px] leading-[1.05] sm:text-5xl text-balance">
              Built for Malaysian Businesses Like Yours
            </h2>
          </div>
          <p className="@lg:col-span-6 @lg:col-start-7 text-lg text-muted-foreground leading-relaxed">
            Whether you run a clinic, a cafe, or a consultancy — Nimfi adapts to
            how you work.
          </p>
        </div>
        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} variant="fade-up-sm" delay={i * 100} duration={400}>
                <div className="flex flex-col gap-4 rounded-lg border p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
