import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="mt-40 @md:mt-52">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)]" aria-hidden="true" />
          <div className="relative">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-inset ring-primary-foreground/20">
              <SparklesIcon className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-3xl font-[450] tracking-[-2.24px] leading-[1.1] sm:text-4xl text-balance">
              Ready to Simplify Your Operations?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-primary-foreground/80 leading-relaxed">
              Join 50+ Malaysian SMEs already on Nimfi. Start free — no credit
              card required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary">
                  Get Started Free
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </Link>
              <Link
                href="#features"
                className="text-sm text-primary-foreground/80 underline underline-offset-4 transition-colors hover:text-primary-foreground"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
