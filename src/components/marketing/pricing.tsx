import { CheckIcon, MinusIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reveal } from "@/components/marketing/reveal";
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
    href: "/contact",
    featured: false,
  },
];

const featureCategories = [
  {
    category: "Core Features",
    items: [
      { name: "Team members", lite: "Up to 5", pro: "Up to 25", max: "Unlimited" },
      { name: "Attendance tracking", lite: true, pro: true, max: true },
      { name: "Basic invoicing", lite: true, pro: true, max: true },
      { name: "Customer management", lite: true, pro: true, max: true },
      { name: "Appointment scheduling", lite: false, pro: true, max: true },
      { name: "E-invoice-ready workflows", lite: false, pro: true, max: true },
    ],
  },
  {
    category: "Permissions & Access",
    items: [
      { name: "Role-based permissions", lite: false, pro: true, max: true },
      { name: "Custom roles & permissions", lite: false, pro: false, max: true },
      { name: "API access", lite: false, pro: false, max: true },
    ],
  },
  {
    category: "Support",
    items: [
      { name: "Email support", lite: true, pro: true, max: true },
      { name: "Priority support", lite: false, pro: true, max: true },
      { name: "Dedicated account manager", lite: false, pro: false, max: true },
      { name: "On-premise optional", lite: false, pro: false, max: true },
    ],
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <TableCell className="text-center">
        <CheckIcon className="mx-auto size-4 text-primary" aria-label="Included" />
      </TableCell>
    );
  }
  if (value === false) {
    return (
      <TableCell className="text-center">
        <MinusIcon className="mx-auto size-4 text-muted-foreground/40" aria-label="Not included" />
      </TableCell>
    );
  }
  return (
    <TableCell className="text-center text-sm">
      {value}
    </TableCell>
  );
}

function FeatureRow({ item }: { item: { name: string; lite: boolean | string; pro: boolean | string; max: boolean | string } }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <FeatureCell value={item.lite} />
      <FeatureCell value={item.pro} />
      <FeatureCell value={item.max} />
    </TableRow>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 mt-40 @md:mt-52">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col @lg:grid @lg:grid-cols-12 gap-x-5 gap-y-6 items-baseline">
          <div className="@lg:col-span-5">
            <h2 className="text-4xl font-[450] tracking-[-3.36px] leading-[1.05] sm:text-5xl text-balance">
              Early Access Pricing
            </h2>
          </div>
          <p className="@lg:col-span-6 @lg:col-start-7 text-lg text-muted-foreground leading-relaxed">
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} variant="fade-up-sm" delay={i * 120} duration={400} as="div">
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col",
                tier.featured
                  ? "border-primary/30 shadow-sm ring-1 ring-primary/5"
                  : "shadow-xs",
              )}
            >
              <CardContent className="flex flex-1 flex-col p-8">
                {tier.featured && (
                  <Badge variant="default" className="mx-auto mb-4 w-fit rounded-full px-3 py-1">
                    Most popular
                  </Badge>
                )}
                <h3 className="text-center text-lg font-medium">{tier.name}</h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                  {tier.description}
                </p>
                <div className="mt-6 text-center">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period ? (
                    <span className="ml-1 text-sm text-muted-foreground">{tier.period}</span>
                  ) : (
                    <span className="ml-1 text-sm text-muted-foreground">forever</span>
                  )}
                </div>
                <ul className="mt-8 flex flex-col gap-3" role="list">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <CheckIcon className="size-2.5 text-primary" aria-hidden="true" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
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
            </Reveal>
          ))}
        </div>

        <div className="mt-32">
          <div className="flex flex-col @lg:grid @lg:grid-cols-12 gap-x-5 gap-y-6 items-baseline">
            <div className="@lg:col-span-5">
              <h3 className="text-4xl font-[450] tracking-[-3.36px] leading-[1.05] sm:text-5xl text-balance">
                Compare plans in detail
              </h3>
            </div>
            <p className="@lg:col-span-6 @lg:col-start-7 text-lg text-muted-foreground leading-relaxed">
              See exactly what&apos;s included in each plan.
            </p>
          </div>
          <div className="mt-10 overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px] sm:w-[280px]">Feature</TableHead>
                  {tiers.map((tier) => (
                    <TableHead key={tier.name} className="text-center font-semibold">
                      {tier.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureCategories.flatMap((cat) => [
                  <TableRow key={`cat-${cat.category}`}>
                    <TableCell
                      colSpan={4}
                      className="bg-muted/15 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {cat.category}
                    </TableCell>
                  </TableRow>,
                  ...cat.items.map((item) => (
                    <FeatureRow key={item.name} item={item} />
                  )),
                ])}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
