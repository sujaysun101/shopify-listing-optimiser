import type { Metadata } from "next";

import { SettingsPanel } from "@/components/settings-panel";
import { getRepo } from "@/lib/repo";
import { demoDataMode, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const products = await repo.listProducts(store.id);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Name the shop and describe how it should sound.</p>
      </div>
      <SettingsPanel
        name={store.name}
        brandVoice={store.brandVoice}
        demoData={demoDataMode()}
        productCount={products.length}
      />
    </div>
  );
}
