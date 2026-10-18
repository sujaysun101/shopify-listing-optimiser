import type { Metadata } from "next";
import Link from "next/link";

import { DistributionChart, TrendChart } from "@/components/dashboard-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRepo } from "@/lib/repo";
import { requireUser } from "@/lib/session";
import { distribution, scoreBand } from "@/lib/scoring";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireUser();
  const repo = getRepo();
  const store = await repo.ensureStore(session.userId);
  const products = await repo.listProducts(store.id);
  const snapshots = await repo.listSnapshots(store.id);
  const average = products.length
    ? Math.round(products.reduce((sum, product) => sum + product.score, 0) / products.length)
    : 0;
  const needsWork = products.filter((product) => product.score < 70).length;
  const ready = products.filter((product) => scoreBand(product.score).key === "ready").length;
  const buckets = distribution(products.map((product) => product.score));
  const weakest = [...products].sort((a, b) => a.score - b.score).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Catalog</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {store.name} has {products.length} products. The average is the mean of the five checks on each listing.
        </p>
      </div>
      {products.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No products yet</CardTitle>
            <CardDescription>Import a Shopify CSV, or load the Hearth & Wick sample to see scores and charts.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link href="/app/import" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Import CSV</Link>
            <Link href="/app/settings" className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium">Load sample catalog</Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Catalog average</CardDescription>
                <CardTitle className="font-serif text-4xl">{average}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Below 70</CardDescription>
                <CardTitle className="font-serif text-4xl">{needsWork}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Ready to publish</CardDescription>
                <CardTitle className="font-serif text-4xl">{ready}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score distribution</CardTitle>
                <CardDescription>How the catalog splits across the four bands.</CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionChart data={buckets} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Improvements over time</CardTitle>
                <CardDescription>Weekly catalog average, with today recalculated from the current listings.</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart data={snapshots} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Lowest scores</CardTitle>
              <CardDescription>Start here if you are rewriting by hand.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {weakest.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <Link href={`/app/products/${product.id}`} className="font-medium hover:underline">{product.title}</Link>
                    <span className="tabular-nums text-muted-foreground">{product.score} · {scoreBand(product.score).label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
