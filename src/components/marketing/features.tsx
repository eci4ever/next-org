import {
  BanIcon,
  CalendarCheckIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  ReceiptIcon,
  UsersIcon,
} from "lucide-react";

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
    <section id="features" className="scroll-mt-20 border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-pretty sm:text-4xl">
            Everything You Need to Run Your Business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Six integrated modules that work together so you don't have to
            juggle six different tools.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="flex flex-col gap-4 rounded-lg border p-6"
              >
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
                <p className="text-sm text-muted-foreground">
                  {mod.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
