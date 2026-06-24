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
    <section id="faq" className="scroll-mt-20 border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-pretty sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Nimfi.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>
                  <p>{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
