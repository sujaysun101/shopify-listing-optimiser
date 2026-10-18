import type { Metadata } from "next";

import { QueuePanel } from "@/components/queue-panel";
import { getRepo } from "@/lib/repo";
import { aiConfigured, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Queue" };
export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const products = await repo.listProducts(store.id);
  const job = await repo.latestJob(store.id);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Bulk queue</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Rewrites run one product at a time so you can watch progress. Each finished item is applied to the listing.
        </p>
      </div>
      <QueuePanel products={products} initialJob={job} aiReady={aiConfigured()} />
    </div>
  );
}
