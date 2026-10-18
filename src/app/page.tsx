import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { LandingVisual } from "@/components/landing-visual";
import { clerkKeysPresent } from "@/lib/session";

const features = [
  {
    title: "A score you can explain",
    body: "Every product gets five checks: title length, keywords, benefits, alt text, and meta description. Each one says what passed and what to change.",
  },
  {
    title: "Rewrites you approve",
    body: "Pick a tone, read the current copy beside the draft, and accept or reject each field. Nothing is published until you keep it.",
  },
  {
    title: "Back into Shopify",
    body: "Download a product CSV, or push titles and descriptions through the Admin API when a store token is connected.",
  },
];

export default function HomePage() {
  const clerk = clerkKeysPresent() || process.env.NODE_ENV === "development";
  const primary = clerk ? "/sign-in" : "/app";
  const primaryLabel = clerk ? "Sign in" : "Open the demo store";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-serif text-xl">Copycart</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link href={primary} className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground">
            {primaryLabel}
          </Link>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">For small Shopify catalogs</p>
            <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Product pages that sound like the shop.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Copycart reads a catalog, scores each listing, and drafts tighter copy you can accept field by field.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={primary} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-medium text-primary-foreground">
                {primaryLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/sign-up" className="inline-flex h-11 items-center rounded-full border px-5 font-medium">
                Create an account
              </Link>
            </div>
          </div>
          <LandingVisual />
        </section>
        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border bg-card p-5">
              <h2 className="font-serif text-2xl">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground">
          <p>Copycart · product pages for independent Shopify shops.</p>
          <Link href={primary} className="hover:text-foreground">{primaryLabel}</Link>
        </div>
      </footer>
    </div>
  );
}
