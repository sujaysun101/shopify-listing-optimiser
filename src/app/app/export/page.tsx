import type { Metadata } from "next";

import { ExportPanel } from "@/components/export-panel";
import { getRepo } from "@/lib/repo";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Export" };
export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const products = await repo.listProducts(store.id);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Export</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Take the current catalog with you. CSV always works. The Admin API push runs only for a connected store.
        </p>
      </div>
      <ExportPanel products={products} connected={Boolean(store.tokenCiphertext && store.shopDomain)} />
    </div>
  );
}
