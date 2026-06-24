import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Lite",
    price: "Free",
    period: null,
    description: "Best for solo entrepreneurs testing the waters.",
    features: [
      "Up to 5 team members",
      "Attendance tracking",
      "Basic invoicing",
      "Customer management",
      "Email support",
    ],
    cta: "Start Free",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "RM 49",
    period: "/month",
    description: "Best for growing teams that need the full toolkit.",
    features: [
      "Up to 25 team members",
      "Everything in Lite",
      "Appointment scheduling",
      "E-invoice-ready workflows",
      "Role-based permissions",
      "Priority support",
    ],
    cta: "Start Pro",
    href: "/signup",
    featured: true,
  },
  {
    name: "Max",
    price: "RM 149",
    period: "/month",
    description: "Best for larger teams with advanced needs.",
    features: [
      "Unlimited team members",
      "Everything in Pro",
      "Custom roles & permissions",
      "API access",
      "Dedicated account manager",
      "On-premise optional",
    ],
    cta: "Contact Sales",
    href: "#",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-pretty sm:text-4xl">
            Early Access Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col",
                tier.featured
                  ? "border-primary/30 shadow-sm ring-1 ring-primary/5"
                  : "shadow-xs",
              )}
            >
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                {tier.featured && (
                  <Badge variant="default" className="mx-auto w-fit rounded-full px-3 py-1">
                    Most popular
                  </Badge>
                )}
                <div className="text-center">
                  <h3 className="text-base font-medium">{tier.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="ml-0.5 text-sm text-muted-foreground">{tier.period}</span>
                  )}
                  {!tier.period && (
                    <span className="ml-0.5 text-sm text-muted-foreground">forever</span>
                  )}
                </div>
                <Separator />
                <ul className="flex flex-col gap-1.5" role="list">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <CheckIcon className="size-2.5 text-primary" aria-hidden="true" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Link
                    href={tier.href}
                    className={cn(
                      buttonVariants({
                        variant: tier.featured ? "default" : "outline",
                        size: "default",
                        className: "w-full",
                      }),
                    )}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
