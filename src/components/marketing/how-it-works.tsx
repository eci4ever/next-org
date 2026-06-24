import { ArrowRightIcon } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const steps = [
  {
    step: "1",
    title: "Create your account",
    description:
      "Sign up in under a minute. No credit card required. Invite your team right away.",
  },
  {
    step: "2",
    title: "Set up your workspace",
    description:
      "Add your business info, configure attendance rules, and import your customer list.",
  },
  {
    step: "3",
    title: "Start operating",
    description:
      "Track attendance, schedule appointments, send invoices, and manage customers — all from one dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 mt-40 @md:mt-52">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col @lg:grid @lg:grid-cols-12 gap-x-5 gap-y-6 items-baseline">
          <div className="@lg:col-span-5">
            <h2 className="text-4xl font-[450] tracking-[-3.36px] leading-[1.05] sm:text-5xl text-balance">
              Get Started in Minutes
            </h2>
          </div>
          <p className="@lg:col-span-6 @lg:col-start-7 text-lg text-muted-foreground leading-relaxed">
            No onboarding calls. No complex setup. Just you and a cleaner way
            to run your business.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.step} variant="fade-up-sm" delay={i * 120} duration={400}>
              <div className="relative flex flex-col gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-medium text-primary-foreground">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-base font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRightIcon
                    className="absolute -right-4 top-6 hidden size-5 text-muted-foreground/40 sm:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
