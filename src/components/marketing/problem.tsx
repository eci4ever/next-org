import {
  FileSearchIcon,
  HourglassIcon,
  MessageCircleWarningIcon,
  SearchXIcon,
} from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

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
    <section id="problem" className="scroll-mt-20 mt-40 @md:mt-52">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col @lg:grid @lg:grid-cols-12 gap-x-5 gap-y-6 items-baseline">
          <div className="@lg:col-span-5">
            <h2 className="text-4xl font-[450] tracking-[-3.36px] leading-[1.05] sm:text-5xl text-balance">
              Running an SME Today Is Harder Than It Should Be
            </h2>
          </div>
          <p className="@lg:col-span-6 @lg:col-start-7 text-lg text-muted-foreground leading-relaxed">
            Malaysian small businesses lose countless hours to fragmented tools
            and manual processes. Nimfi replaces the chaos with one clean
            dashboard.
          </p>
        </div>
        <div className="mt-16 grid gap-px bg-border rounded-lg overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {pains.map((pain, i) => {
            const Icon = pain.icon;
            return (
              <Reveal key={pain.title} variant="fade-up-sm" delay={i * 100} duration={400}>
                <div className="flex flex-col gap-3 bg-background p-6 h-full">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-medium">{pain.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pain.description}
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
