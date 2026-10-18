"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SettingsPanel({
  name,
  brandVoice,
  demoData,
  productCount,
}: {
  name: string;
  brandVoice: string;
  demoData: boolean;
  productCount: number;
}) {
  const router = useRouter();
  const [storeName, setStoreName] = useState(name);
  const [voice, setVoice] = useState(brandVoice);
  const [busy, setBusy] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy("save");
    try {
      const response = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: storeName, brandVoice: voice }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save");
      toast.success("Store settings saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  async function loadSample() {
    setBusy("sample");
    try {
      const response = await fetch("/api/store/sample", { method: "POST" });
      const data = (await response.json()) as { error?: string; count?: number };
      if (!response.ok) throw new Error(data.error || "Could not load the sample");
      toast.success("Hearth & Wick sample catalog loaded");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the sample");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
          <CardDescription>The name is shown in the workspace. Brand voice is sent with every rewrite.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={save}>
            <div className="space-y-1.5">
              <Label htmlFor="store-name">Store name</Label>
              <Input id="store-name" value={storeName} onChange={(event) => setStoreName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="voice">Brand voice</Label>
              <Textarea id="voice" className="min-h-36" value={voice} onChange={(event) => setVoice(event.target.value)} />
            </div>
            <Button type="submit" disabled={busy !== null}>Save settings</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
          <CardDescription>
            {demoData
              ? "This deploy has no DATABASE_URL, so the catalog lives in memory and is labeled Demo data. It resets when the server process restarts."
              : "This store is saved in Postgres."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{productCount} products in the workspace.</p>
          <Button variant="outline" onClick={loadSample} disabled={busy !== null}>
            Load the Hearth & Wick sample
          </Button>
          <p className="text-xs text-muted-foreground">
            Adds the candle and home-goods catalog without deleting products you already imported. Matching handles are updated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
