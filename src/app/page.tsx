"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Listing {
  optimizedTitle: string;
  bulletPoints: string[];
  fullDescription: string;
  seoKeywords: string[];
  pricingNotes: string;
  metaDescription: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-xs text-blue-600 hover:text-blue-800 underline"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Home() {
  const [form, setForm] = useState({ productName: "", currentDescription: "", targetAudience: "", price: "", category: "" });
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function optimize() {
    if (!form.productName.trim()) return;
    setLoading(true);
    setError("");
    setListing(null);
    try {
      const res = await fetch("/api/optimize-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setListing(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Shopify Listing Optimiser</h1>
            <p className="text-xs text-slate-500">AI-powered product listing generator</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Enter your product info and get a fully optimized Shopify listing instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Product Name *</Label>
                <Input placeholder="e.g. Bamboo Cutting Board Set" value={form.productName} onChange={e => set("productName", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input placeholder="e.g. Kitchen & Dining" value={form.category} onChange={e => set("category", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Price</Label>
                <Input placeholder="e.g. $29.99" value={form.price} onChange={e => set("price", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Target Audience</Label>
                <Input placeholder="e.g. Home cooks, gift buyers" value={form.targetAudience} onChange={e => set("targetAudience", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Current Description (optional)</Label>
              <Textarea placeholder="Paste your existing description or leave blank..." className="min-h-24" value={form.currentDescription} onChange={e => set("currentDescription", e.target.value)} />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button onClick={optimize} disabled={loading || !form.productName.trim()} className="w-full bg-green-600 hover:bg-green-700">
              {loading ? "Optimizing..." : "Generate Optimized Listing"}
            </Button>
          </CardContent>
        </Card>

        {listing && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">SEO Title</CardTitle>
                  <CopyButton text={listing.optimizedTitle} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-slate-800">{listing.optimizedTitle}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Bullet Points</CardTitle>
                  <CopyButton text={listing.bulletPoints.join("\n")} />
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {listing.bulletPoints.map((bp, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700"><span className="text-green-600 font-bold">&#10003;</span>{bp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Full Description</CardTitle>
                  <CopyButton text={listing.fullDescription} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{listing.fullDescription}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">SEO Keywords</CardTitle>
                    <CopyButton text={listing.seoKeywords.join(", ")} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {listing.seoKeywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Pricing Notes</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-slate-700">{listing.pricingNotes}</p></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-slate-500 uppercase tracking-wide">Meta Description</CardTitle>
                  <CopyButton text={listing.metaDescription} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{listing.metaDescription}</p>
                <p className="text-xs text-slate-400 mt-1">{listing.metaDescription.length} / 155 chars</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
