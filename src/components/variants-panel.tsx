"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product, Variant, VariantStatus } from "@/lib/types";

export function VariantsPanel({ variants, products }: { variants: Variant[]; products: Product[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(variants);
  const names = new Map(products.map((product) => [product.id, product.title]));

  async function setStatus(id: string, status: VariantStatus) {
    const response = await fetch(`/api/variants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await response.json()) as { error?: string; variant?: Variant };
    if (!response.ok || !data.variant) {
      toast.error(data.error || "Could not update the variant");
      return;
    }
    setRows((current) =>
      current.map((row) => {
        if (row.id === data.variant?.id) return data.variant;
        if (
          row.productId === data.variant?.productId &&
          row.status === status &&
          (status === "live" || status === "winner")
        ) {
          return { ...row, status: "archived" };
        }
        return row;
      }),
    );
    toast.success(status === "winner" ? "Winner applied to the product title" : "Variant updated");
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <h2 className="font-serif text-2xl">No title tests yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Open a product and choose “Make title variants”. Each set is three titles with a short hypothesis.
        </p>
        <Link
          href="/app/products"
          className={cn(
            "mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground",
          )}
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Hypothesis</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t align-top">
              <td className="px-4 py-3">
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">
                  {row.label} · <Link className="underline-offset-2 hover:underline" href={`/app/products/${row.productId}`}>{names.get(row.productId) ?? "Product"}</Link>
                </p>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{row.hypothesis}</td>
              <td className="px-4 py-3"><Badge variant="outline">{row.status}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(row.id, "live")}>Mark live</Button>
                  <Button size="sm" onClick={() => setStatus(row.id, "winner")}>Set winner</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
