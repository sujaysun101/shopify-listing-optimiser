"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";

import { clerkAppearance } from "@/components/brand";
import { Logo } from "@/components/logo";

export function AuthScreen({
  mode,
  clerkEnabled,
  demoEntry,
  keylessHint,
}: {
  mode: "sign-in" | "sign-up";
  clerkEnabled: boolean;
  demoEntry: boolean;
  keylessHint: boolean;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#231c16] text-[#f6efe6] md:flex md:flex-col md:justify-between md:p-10">
        <Link href="/" className="flex items-center gap-2 text-[#f6efe6]">
          <Logo />
          <span className="font-serif text-xl">Copycart</span>
        </Link>
        <div className="max-w-md">
          <p className="text-sm uppercase tracking-[0.16em] text-[#e0b089]">Hearth & Wick · sample catalog</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight">See which listings are doing the talking, and which ones are not.</h1>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Sunday linen spray</span>
              <span className="text-[#e0b089]">Needs work</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#d9cbbd]">
              Title is 5 characters. Shoppers cannot tell the material, size, or scent from it.
            </p>
          </div>
        </div>
        <p className="text-sm text-[#d9cbbd]">Score, rewrite, export. Built for a catalog you can still hold in your head.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 flex items-center gap-2 md:hidden">
            <Logo />
            <span className="font-serif text-xl">Copycart</span>
          </Link>
          {clerkEnabled ? (
            mode === "sign-in" ? (
              <SignIn appearance={clerkAppearance} />
            ) : (
              <SignUp appearance={clerkAppearance} />
            )
          ) : (
            <div className="space-y-4">
              <h1 className="font-serif text-4xl">{mode === "sign-in" ? "Sign in" : "Create an account"}</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Clerk keys are not set on this deploy, so sign-in is not live. The workspace opens with the Hearth & Wick demo catalog.
              </p>
              {demoEntry ? (
                <Link href="/app" className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-medium text-primary-foreground">
                  Continue to the demo store
                </Link>
              ) : null}
            </div>
          )}
          {keylessHint ? (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              No Clerk keys in the environment. Development starts Clerk keyless mode so you can claim a temporary instance from the sign-in card.
            </p>
          ) : null}
          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "sign-in" ? (
              <>
                New here? <Link className="text-primary underline-offset-4 hover:underline" href="/sign-up">Create an account</Link>
              </>
            ) : (
              <>
                Already have an account? <Link className="text-primary underline-offset-4 hover:underline" href="/sign-in">Sign in</Link>
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
