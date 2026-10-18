import type { Metadata } from "next";

import { ImportPanel } from "@/components/import-panel";
import { encryptionConfigured } from "@/lib/crypto";
import { getRepo } from "@/lib/repo";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Import" };
export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Import</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Start from a Shopify product CSV. Connect the Admin API only if you want Copycart to pull products and push accepted copy back.
        </p>
      </div>
      <ImportPanel
        encryptionReady={encryptionConfigured()}
        connected={Boolean(store.tokenCiphertext && store.shopDomain)}
        domain={store.shopDomain}
        hint={store.tokenHint}
      />
    </div>
  );
}
