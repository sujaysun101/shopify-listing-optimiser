"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImportPanel({
  encryptionReady,
  connected,
  domain,
  hint,
}: {
  encryptionReady: boolean;
  connected: boolean;
  domain: string | null;
  hint: string | null;
}) {
  const router = useRouter();
  const [csvName, setCsvName] = useState("");
  const [shopDomain, setShopDomain] = useState(domain ?? "");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [link, setLink] = useState({ connected, domain, hint });

  async function importCsv(file: File) {
    setBusy("csv");
    setCsvName(file.name);
    try {
      const csv = await file.text();
      const response = await fetch("/api/import/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = (await response.json()) as { error?: string; created?: number; updated?: number; errors?: string[] };
      if (!response.ok) throw new Error(data.error || "Import failed");
      toast.success(`Imported ${data.created ?? 0} new and updated ${data.updated ?? 0}`);
      if (data.errors?.length) toast.message(data.errors[0]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setBusy(null);
    }
  }

  async function connect(event: React.FormEvent) {
    event.preventDefault();
    setBusy("connect");
    try {
      const response = await fetch("/api/shopify/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: shopDomain, token }),
      });
      const data = (await response.json()) as { error?: string; domain?: string; hint?: string };
      if (!response.ok) throw new Error(data.error || "Could not connect");
      setToken("");
      setLink({ connected: true, domain: data.domain ?? shopDomain, hint: data.hint ?? null });
      toast.success("Shopify store connected");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not connect");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    setBusy("disconnect");
    try {
      const response = await fetch("/api/shopify/connect", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not disconnect");
      setLink({ connected: false, domain: null, hint: null });
      toast.success("Shopify disconnected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disconnect");
    } finally {
      setBusy(null);
    }
  }

  async function pull() {
    setBusy("pull");
    try {
      const response = await fetch("/api/shopify/import", { method: "POST" });
      const data = (await response.json()) as { error?: string; created?: number; updated?: number };
      if (!response.ok) throw new Error(data.error || "Import failed");
      toast.success(`Shopify import: ${data.created ?? 0} new, ${data.updated ?? 0} updated`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>CSV import</CardTitle>
          <CardDescription>
            Use a Shopify product export. Copycart reads Handle, Title, Body (HTML), Vendor, Type, Tags, Variant Price, Image Src, Image Alt Text, SEO Title, SEO Description, and Status. Extra variant rows collapse onto the handle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="csv">Product CSV</Label>
          <Input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importCsv(file);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {busy === "csv" ? `Reading ${csvName}…` : "A sample file is available if you want to try the columns first."}
          </p>
          <a className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/samples/hearth-and-wick.csv">
            Download a 3-product sample CSV
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shopify Admin API</CardTitle>
          <CardDescription>
            Optional. The access token is encrypted on the server and never sent back to the browser. Import and push work only after a store is connected and ENCRYPTION_KEY is configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!encryptionReady ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm">
              Token storage is off until the server has ENCRYPTION_KEY. CSV import still works.
            </p>
          ) : null}
          {link.connected ? (
            <div className="space-y-3">
              <p className="text-sm">
                Connected to <span className="font-medium">{link.domain}</span>
                {link.hint ? <span className="text-muted-foreground"> · token ending {link.hint}</span> : null}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={pull} disabled={busy !== null}>Import products</Button>
                <Button variant="outline" onClick={disconnect} disabled={busy !== null}>Disconnect</Button>
              </div>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={connect}>
              <div className="space-y-1.5">
                <Label htmlFor="domain">Store domain</Label>
                <Input
                  id="domain"
                  value={shopDomain}
                  onChange={(event) => setShopDomain(event.target.value)}
                  placeholder="your-shop.myshopify.com"
                  autoComplete="off"
                  disabled={!encryptionReady}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="token">Admin API access token</Label>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  autoComplete="off"
                  disabled={!encryptionReady}
                />
              </div>
              <Button type="submit" disabled={!encryptionReady || busy !== null || token.length < 20}>
                Save connection
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
