import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/product-editor";
import { getRepo } from "@/lib/repo";
import { aiConfigured, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Product" };
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const product = await repo.getProduct(store.id, id);
  if (!product) notFound();
  const rewrite = await repo.latestRewrite(product.id);

  return (
    <div className="space-y-4">
      <Link href="/app/products" className="text-sm text-muted-foreground hover:text-foreground">
        Back to products
      </Link>
      <ProductEditor initialProduct={product} initialRewrite={rewrite} aiReady={aiConfigured()} />
    </div>
  );
}
