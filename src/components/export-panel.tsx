"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/lib/types";

export function ExportPanel({ products, connected }: { products: Product[]; connected: boolean }) {
  const [selected, setSelected] = useState<string[]>(products.map((product) => product.id));
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ title?: string; ok: boolean; message: string }[]>([]);
  const pushable = products.filter((product) => product.shopifyProductId);

  async function push() {
    setBusy(true);
    try {
      const response = await fetch("/api/shopify/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selected }),
      });
      const data = (await response.json()) as { error?: string; results?: { title?: string; ok: boolean; message: string }[] };
      if (!response.ok) throw new Error(data.error || "Push failed");
      setResults(data.results ?? []);
      toast.success("Shopify push finished");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Push failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Download CSV</CardTitle>
          <CardDescription>
            Shopify-compatible columns with the current titles, HTML descriptions, alt text, and SEO fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{products.length} products in this export.</p>
          <a
            href="/api/export"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Download optimized CSV
          </a>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Push to Shopify</CardTitle>
          <CardDescription>
            {connected
              ? "Updates title, description, tags, SEO metafields, and alt text for products that have a Shopify id."
              : "Connect the Admin API on the import page before pushing. CSV download does not need a connection."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pushable.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              None of these products have a Shopify id. Import them through the Admin API, or download the CSV and upload it in Shopify.
            </p>
          ) : (
            <ul className="max-h-56 space-y-1 overflow-auto text-sm">
              {pushable.map((product) => (
                <li key={product.id}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() =>
                        setSelected((current) =>
                          current.includes(product.id)
                            ? current.filter((id) => id !== product.id)
                            : [...current, product.id],
                        )
                      }
                    />
                    {product.title}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <Button onClick={push} disabled={!connected || busy || selected.length === 0 || pushable.length === 0}>
            {busy ? "Pushing…" : "Push selected"}
          </Button>
          {results.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {results.map((result, index) => (
                <li key={index}>
                  {result.ok ? "Updated" : "Skipped"} {result.title}: {result.message}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
