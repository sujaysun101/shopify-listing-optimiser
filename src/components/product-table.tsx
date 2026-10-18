"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/text";
import { scoreBand } from "@/lib/scoring";
import type { Product } from "@/lib/types";

export function ProductTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [band, setBand] = useState("all");
  const types = useMemo(
    () => [...new Set(products.map((product) => product.productType).filter(Boolean))].sort(),
    [products],
  );
  const [type, setType] = useState("all");
  const filtered = products.filter((product) => {
    const haystack = `${product.title} ${product.handle} ${product.tags.join(" ")}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (type !== "all" && product.productType !== type) return false;
    if (band !== "all" && scoreBand(product.score).key !== band) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, handle, or tag"
          aria-label="Search products"
        />
        <select
          aria-label="Filter by score"
          value={band}
          onChange={(event) => setBand(event.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="all">All scores</option>
          <option value="work">Needs work</option>
          <option value="fair">Fair</option>
          <option value="strong">Strong</option>
          <option value="ready">Ready</option>
        </select>
        <select
          aria-label="Filter by type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="all">All types</option>
          {types.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing in the catalog matches those filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Type</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Price</th>
                <th className="px-4 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const bandInfo = scoreBand(product.score);
                return (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3">
                      <Link href={`/app/products/${product.id}`} className="font-medium hover:underline">
                        {product.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.handle}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{product.productType || "—"}</td>
                    <td className="hidden px-4 py-3 tabular-nums sm:table-cell">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 tabular-nums">{product.score}</span>
                        <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:block">
                          <span className="block h-full bg-primary" style={{ width: `${product.score}%` }} />
                        </span>
                        <Badge variant="outline">{bandInfo.label}</Badge>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
