import {
  BanIcon,
  CalendarCheckIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  ReceiptIcon,
  UsersIcon,
} from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const modules = [
  {
    icon: ClipboardCheckIcon,
    title: "Attendance",
    description:
      "Clock in/out, track hours, and view attendance records. Know who's in the office, on leave, or late — in real time.",
    badge: "Available now",
  },
  {
    icon: CalendarCheckIcon,
    title: "Appointments",
    description:
      "Schedule, reschedule, and manage bookings. Send reminders and reduce no-shows with automated notifications.",
    badge: "Available now",
  },
  {
    icon: FileTextIcon,
    title: "Invoicing",
    description:
      "Create and send professional invoices, track payment status, and manage billing cycles. Clean templates, instant sharing.",
    badge: "Available now",
  },
  {
    icon: ReceiptIcon,
    title: "E-Invoice Ready",
    description:
      "Built for LHDN's MyInvois mandate. Generate compliant e-invoices with the correct format, QR code, and submission workflow.",
    badge: "Coming Q3 2025",
  },
  {
    icon: UsersIcon,
    title: "Customer Management",
    description:
      "Store customer profiles, purchase history, and contact logs in one place. Search, filter, and segment with ease.",
    badge: "Available now",
  },
  {
    icon: BanIcon,
    title: "Team & Permissions",
    description:
      "Add team members, assign roles (admin, staff, viewer), and control who sees what. Built for small teams that need structure.",
    badge: "Available now",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 mt-40 @md:mt-52">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col @lg:grid @lg:grid-cols-12 gap-x-5 gap-y-6 items-baseline">
          <div className="@lg:col-span-5">
            <h2 className="text-4xl font-[450] tracking-[-3.36px] leading-[1.05] sm:text-5xl text-balance">
              Everything You Need to Run Your Business
            </h2>
          </div>
          <p className="@lg:col-span-6 @lg:col-start-7 text-lg text-muted-foreground leading-relaxed">
            Six integrated modules that work together so you don't have to
            juggle six different tools.
          </p>
        </div>
        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Reveal key={mod.title} variant="fade-up-sm" delay={i * 80} duration={400}>
                <div className="flex flex-col gap-4 rounded-lg border p-6 h-full">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{mod.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {mod.badge}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mod.description}
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
