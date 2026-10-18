import { createClerkClient } from "@clerk/backend";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createKeylessService, createNodeFileStorage } from "@clerk/shared/keyless";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/internal(.*)",
]);

type Keys = { publishableKey: string; secretKey: string };

let keylessTask: Promise<Keys | null> | null = null;

function keylessKeys() {
  if (!keylessTask) {
    keylessTask = (async () => {
      try {
        const client = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
          publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        });
        const service = createKeylessService({
          storage: createNodeFileStorage(fs, path, {
            cwd: () => process.cwd(),
            frameworkPackageName: "@clerk/nextjs",
          }),
          api: {
            async createAccountlessApplication(requestHeaders, source) {
              const app = await client.__experimental_accountlessApplications.createAccountlessApplication({
                requestHeaders,
                source,
              });
              return {
                publishableKey: app.publishableKey,
                secretKey: app.secretKey,
                claimUrl: app.claimUrl,
                apiKeysUrl: app.apiKeysUrl,
              };
            },
            async completeOnboarding(requestHeaders, source) {
              const app = await client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
                requestHeaders,
                source,
              });
              return {
                publishableKey: app.publishableKey,
                secretKey: app.secretKey,
                claimUrl: app.claimUrl,
                apiKeysUrl: app.apiKeysUrl,
              };
            },
          },
          framework: "nextjs",
        });
        const keys = await service.getOrCreateKeys();
        if (!keys?.publishableKey || !keys.secretKey) return null;
        return { publishableKey: keys.publishableKey, secretKey: keys.secretKey };
      } catch {
        keylessTask = null;
        return null;
      }
    })();
  }
  return keylessTask;
}

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (process.env.DEMO_SCREENSHOT === "1") return NextResponse.next();

  let publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let secretKey = process.env.CLERK_SECRET_KEY;
  const keylessDisabled = ["1", "true"].includes(process.env.NEXT_PUBLIC_CLERK_KEYLESS_DISABLED ?? "");
  if ((!publishableKey || !secretKey) && process.env.NODE_ENV === "development" && !keylessDisabled) {
    const keys = await keylessKeys();
    if (keys) {
      publishableKey = keys.publishableKey;
      secretKey = keys.secretKey;
    }
  }
  if (!publishableKey || !secretKey) return NextResponse.next();

  const handler = clerkMiddleware(
    async (auth, req) => {
      if (!isPublicRoute(req)) await auth.protect();
    },
    {
      publishableKey,
      secretKey,
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
    },
  );
  return handler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
