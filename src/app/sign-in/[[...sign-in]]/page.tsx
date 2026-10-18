import type { Metadata } from "next";

import { AuthScreen } from "@/components/auth-screen";
import { clerkKeysPresent, screenshotMode } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) || process.env.NODE_ENV === "development";
  const demoEntry = screenshotMode() || (process.env.NODE_ENV === "production" && !clerkKeysPresent());
  return (
    <AuthScreen
      mode="sign-in"
      clerkEnabled={clerkEnabled && !screenshotMode()}
      demoEntry={demoEntry || !clerkEnabled}
      keylessHint={process.env.NODE_ENV === "development" && !clerkKeysPresent() && !screenshotMode()}
    />
  );
}
