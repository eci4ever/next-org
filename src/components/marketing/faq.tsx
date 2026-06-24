import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Nimfi ready for LHDN's e-invoice mandate?",
    a: "We are building full MyInvois compliance with QR code generation, proper document format, and submission workflow. This module is scheduled for Q3 2025. Standard invoicing is available now.",
  },
  {
    q: "Can I import my existing customer data?",
    a: "Yes. You can upload CSV files to bulk-import customers, and we'll provide migration support for common formats. Contact us during sign-up if you need help with a larger migration.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The Starter plan is completely free with no time limit. You can upgrade to Business when you need appointments, e-invoices, or more team members.",
  },
  {
    q: "Is my data stored in Malaysia?",
    a: "Yes. All data is hosted on Malaysian servers. We comply with PDPA requirements and use encryption at rest and in transit.",
  },
  {
    q: "Can I manage multiple business locations?",
    a: "Not yet — this is on our roadmap. For now, you can use separate workspaces for each location and switch between them.",
  },
  {
    q: "What happens when the early access period ends?",
    a: "Early access members keep their pricing for 12 months after general availability. You'll receive 30 days' notice before any price change.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 mt-40 @md:mt-52">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col @lg:grid @lg:grid-cols-12 gap-x-5 gap-y-6 items-baseline">
          <div className="@lg:col-span-5">
            <h2 className="text-4xl font-[450] tracking-[-3.36px] leading-[1.05] sm:text-5xl text-balance">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="@lg:col-span-6 @lg:col-start-7 text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about Nimfi.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl">
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
