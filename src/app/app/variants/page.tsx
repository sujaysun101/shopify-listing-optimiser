import type { Metadata } from "next";

import { VariantsPanel } from "@/components/variants-panel";
import { getRepo } from "@/lib/repo";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Title tests" };
export const dynamic = "force-dynamic";

export default async function VariantsPage() {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const [variants, products] = await Promise.all([repo.listVariants(store.id), repo.listProducts(store.id)]);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Title tests</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Three titles per product. Mark one live while you compare, then set a winner to copy it onto the listing.
        </p>
      </div>
      <VariantsPanel variants={variants} products={products} />
    </div>
  );
}
