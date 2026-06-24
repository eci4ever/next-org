import Link from "next/link";

const YEAR = new Date().getFullYear();

const footerLinks = [
  {
    label: "Product",
    links: [
      { text: "Features", href: "#features" },
      { text: "Use Cases", href: "#use-cases" },
      { text: "Pricing", href: "#pricing" },
      { text: "FAQ", href: "#faq" },
    ],
  },
  {
    label: "Company",
    links: [
      { text: "About", href: "#" },
      { text: "Blog", href: "#" },
      { text: "Privacy Policy", href: "#" },
      { text: "Terms of Service", href: "#" },
    ],
  },
  {
    label: "Support",
    links: [
      { text: "Help Center", href: "#" },
      { text: "Contact", href: "#" },
      { text: "Status", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-40 @md:mt-52 border-t py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                N
              </div>
              nimfi
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All-in-one business operations for Malaysian SMEs.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.text}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {YEAR} Nimfi. All rights reserved. Made in Malaysia.
        </div>
      </div>
    </footer>
  );
}
