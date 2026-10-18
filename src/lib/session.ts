import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DEMO_USER_ID } from "@/lib/constants";

export { DEMO_USER_ID };

export type Session = {
  userId: string;
  mode: "demo" | "clerk";
};

export function clerkKeysPresent() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export function demoDataMode() {
  return !process.env.DATABASE_URL;
}

export function screenshotMode() {
  return process.env.DEMO_SCREENSHOT === "1";
}

export function aiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

function demoSession(): Session {
  return { userId: DEMO_USER_ID, mode: "demo" };
}

export async function requireUser(): Promise<Session> {
  if (screenshotMode() || (process.env.NODE_ENV === "production" && !clerkKeysPresent())) {
    return demoSession();
  }
  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
    return { userId, mode: "clerk" };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return demoSession();
  }
}

export async function requireApiUser(): Promise<Session | null> {
  if (screenshotMode() || (process.env.NODE_ENV === "production" && !clerkKeysPresent())) {
    return demoSession();
  }
  try {
    const { userId } = await auth();
    if (!userId) return null;
    return { userId, mode: "clerk" };
  } catch {
    return null;
  }
}
