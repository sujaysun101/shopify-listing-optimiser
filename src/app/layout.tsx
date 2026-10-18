import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Outfit } from "next/font/google";

import { clerkAppearance } from "@/components/brand";
import { Providers } from "@/components/providers";
import { screenshotMode } from "@/lib/session";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Copycart",
    template: "%s · Copycart",
  },
  description: "Score, rewrite, and export Shopify product pages for small stores.",
  openGraph: {
    title: "Copycart",
    description: "Better product pages for small Shopify stores.",
    type: "website",
  },
};

function AuthBoundary({ children }: { children: React.ReactNode }) {
  if (screenshotMode()) return children;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const development = process.env.NODE_ENV === "development";
  if (!publishableKey && !development) return children;
  return (
    <ClerkProvider
      {...(publishableKey ? { publishableKey } : {})}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      appearance={clerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <AuthBoundary>
          <Providers>{children}</Providers>
        </AuthBoundary>
      </body>
    </html>
  );
}
