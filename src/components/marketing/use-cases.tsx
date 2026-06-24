import {
  Building2Icon,
  ScissorsIcon,
  StethoscopeIcon,
  StoreIcon,
} from "lucide-react";

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
    <section id="use-cases" className="scroll-mt-20 border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-pretty sm:text-4xl">
            Built for Malaysian Businesses Like Yours
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you run a clinic, a cafe, or a consultancy — Nimfi adapts to
            how you work.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-lg border p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
