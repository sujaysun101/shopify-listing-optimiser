"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Hit = { id: string; title: string; productType: string; score: number };

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [seenOpen, setSeenOpen] = useState(open);
  if (open !== seenOpen) {
    setSeenOpen(open);
    if (!open) setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/products")
      .then((response) => response.json())
      .then((data: { products?: Hit[] }) => {
        if (!cancelled) setHits(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setHits([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;
  const filtered = hits
    .filter((hit) => `${hit.title} ${hit.productType}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/40 px-4 pt-[15vh]" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Search products"
        className="w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the catalog"
          className="w-full border-b bg-transparent px-4 py-3 text-sm outline-none"
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
        />
        <ul className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matching products.</li>
          ) : (
            filtered.map((hit) => (
              <li key={hit.id}>
                <button
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    router.push(`/app/products/${hit.id}`);
                    onClose();
                  }}
                >
                  <span>
                    <span className="block font-medium">{hit.title}</span>
                    <span className="text-xs text-muted-foreground">{hit.productType || "Uncategorized"}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">{hit.score}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
