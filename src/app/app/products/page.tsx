import type { Metadata } from "next";
import Link from "next/link";

import { ProductTable } from "@/components/product-table";
import { getRepo } from "@/lib/repo";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const products = await repo.listProducts(store.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} listings, sorted with the weakest scores first.</p>
        </div>
        <Link href="/app/import" className="text-sm font-medium text-primary hover:underline">Import more</Link>
      </div>
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <h2 className="font-serif text-2xl">The catalog is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Bring in a Shopify export, or load the Hearth & Wick sample from settings.
          </p>
        </div>
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}
