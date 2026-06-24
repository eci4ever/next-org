import {
  FileSearchIcon,
  HourglassIcon,
  MessageCircleWarningIcon,
  SearchXIcon,
} from "lucide-react";

const pains = [
  {
    icon: FileSearchIcon,
    title: "Paper receipts pile up",
    description:
      "Loose receipts and manual ledgers make tax season a scramble. LHDN's e-invoice mandate is coming — and most SMEs aren't ready.",
  },
  {
    icon: HourglassIcon,
    title: "Spreadsheets waste hours",
    description:
      "Attendance, invoices, customer lists — each in a different sheet or app. No single source of truth means duplicated effort and errors.",
  },
  {
    icon: MessageCircleWarningIcon,
    title: "Missed follow-ups cost money",
    description:
      "Appointment no-shows, unpaid invoices, un responded enquiries — without a system, revenue slips through the cracks.",
  },
  {
    icon: SearchXIcon,
    title: "No visibility into operations",
    description:
      "Business owners fly blind. Who's working today? What's pending? Which customers are overdue? You need answers in seconds, not hours.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="scroll-mt-20 border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-pretty sm:text-4xl">
            Running an SME Today Is Harder Than It Should Be
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Malaysian small businesses lose countless hours to fragmented tools
            and manual processes. Nimfi replaces the chaos with one clean
            dashboard.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pains.map((pain) => {
            const Icon = pain.icon;
            return (
              <div
                key={pain.title}
                className="flex flex-col gap-3 rounded-lg border p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-medium">{pain.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {pain.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
