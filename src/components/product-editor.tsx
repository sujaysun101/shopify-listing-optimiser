"use client";

import { Check, TriangleAlert, X } from "lucide-react";
import type { Check as ScoreCheck } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ScoreRing } from "@/components/score-ring";
import { WordDiff } from "@/components/word-diff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { scoreProduct } from "@/lib/scoring";
import { TONES, type FieldKey, type Product, type RewriteRecord, type Tone } from "@/lib/types";

const fields: { key: FieldKey; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "seoTitle", label: "SEO title" },
  { key: "metaDescription", label: "Meta description" },
  { key: "imageAlt", label: "Alt text" },
  { key: "description", label: "Description" },
];

function statusIcon(status: ScoreCheck["status"]) {
  if (status === "pass") return <Check className="size-4 text-emerald-700 dark:text-emerald-300" aria-hidden />;
  if (status === "warn") return <TriangleAlert className="size-4 text-amber-700 dark:text-amber-300" aria-hidden />;
  return <X className="size-4 text-destructive" aria-hidden />;
}

function statusLabel(status: ScoreCheck["status"]) {
  if (status === "pass") return "Pass";
  if (status === "warn") return "Watch";
  return "Fix";
}

async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string; product?: Product; rewrite?: RewriteRecord };
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function ProductEditor({
  initialProduct,
  initialRewrite,
  aiReady,
}: {
  initialProduct: Product;
  initialRewrite: RewriteRecord | null;
  aiReady: boolean;
}) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [draft, setDraft] = useState(initialProduct);
  const [tagText, setTagText] = useState(initialProduct.tags.join(", "));
  const [rewrite, setRewrite] = useState(initialRewrite);
  const [tone, setTone] = useState<Tone>(initialRewrite?.tone ?? "warm");
  const [busy, setBusy] = useState<string | null>(null);
  const scored = useMemo(
    () => scoreProduct({ ...draft, tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean) }),
    [draft, tagText],
  );
  const dirty =
    draft.title !== product.title ||
    draft.description !== product.description ||
    draft.seoTitle !== product.seoTitle ||
    draft.metaDescription !== product.metaDescription ||
    draft.imageAlt !== product.imageAlt ||
    draft.productType !== product.productType ||
    tagText !== product.tags.join(", ");

  async function save() {
    setBusy("save");
    try {
      const data = await send(`/api/products/${product.id}`, "PATCH", {
        title: draft.title,
        description: draft.description,
        seoTitle: draft.seoTitle,
        metaDescription: draft.metaDescription,
        imageAlt: draft.imageAlt,
        productType: draft.productType,
        tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if (data.product) {
        setProduct(data.product);
        setDraft(data.product);
        setTagText(data.product.tags.join(", "));
      }
      toast.success("Listing saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  async function rewriteListing() {
    setBusy("rewrite");
    try {
      const data = await send(`/api/products/${product.id}/rewrite`, "POST", { tone });
      if (data.rewrite) setRewrite(data.rewrite);
      toast.success(data.rewrite?.source === "sample" ? "Sample rewrite ready" : "Rewrite ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not rewrite");
    } finally {
      setBusy(null);
    }
  }

  async function decide(next: RewriteRecord["decisions"], addKeywords = false) {
    if (!rewrite) return;
    setBusy("decide");
    try {
      const data = await send(`/api/rewrites/${rewrite.id}`, "POST", { decisions: next, addKeywords });
      if (data.product) {
        setProduct(data.product);
        setDraft(data.product);
        setTagText(data.product.tags.join(", "));
      }
      if (data.rewrite) setRewrite(data.rewrite);
      toast.success("Decisions saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not apply");
    } finally {
      setBusy(null);
    }
  }

  async function makeVariants() {
    setBusy("variants");
    try {
      const response = await fetch(`/api/products/${product.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone }),
      });
      const data = (await response.json()) as { error?: string; notice?: string | null };
      if (!response.ok) throw new Error(data.error || "Could not create titles");
      toast.success(data.notice ? "Sample titles added" : "Title variants added");
      router.push("/app/variants");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create titles");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{draft.productType || "Uncategorized"} · {draft.vendor}</p>
          <h1 className="font-serif text-3xl tracking-tight">{draft.title || "Untitled"}</h1>
        </div>
        <ScoreRing score={scored.score} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Score checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scored.checks.map((check) => (
              <div key={check.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {statusIcon(check.status)}
                    {check.label}
                    <span className="sr-only">{statusLabel(check.status)}</span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {statusLabel(check.status)} · {check.points}/{check.max}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{check.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rewrite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!aiReady ? (
                <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-foreground">
                  Sample copy is on. Add ANTHROPIC_API_KEY to draft with Claude. Sample rewrites are labeled and still accept field by field.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Tone preset">
                {TONES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={tone === item.id}
                    onClick={() => setTone(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-left text-sm ${tone === item.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={rewriteListing} disabled={busy !== null}>
                  {busy === "rewrite" ? "Drafting…" : "Rewrite listing"}
                </Button>
                <Button variant="outline" onClick={makeVariants} disabled={busy !== null}>
                  {busy === "variants" ? "Writing titles…" : "Make title variants"}
                </Button>
              </div>
              {rewrite?.notice ? (
                <p className="text-sm text-muted-foreground">{rewrite.notice}</p>
              ) : null}
              {rewrite ? (
                <div className="space-y-5">
                  {fields.map((field) => {
                    const decision = rewrite.decisions[field.key];
                    return (
                      <div key={field.key} className="rounded-xl border p-3">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-medium">{field.label}</h2>
                            <Badge variant={decision === "accepted" ? "default" : "outline"}>{decision}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={decision === "accepted" ? "default" : "outline"}
                              disabled={busy !== null}
                              onClick={() => decide({ ...rewrite.decisions, [field.key]: "accepted" })}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant={decision === "rejected" ? "secondary" : "ghost"}
                              disabled={busy !== null}
                              onClick={() => decide({ ...rewrite.decisions, [field.key]: "rejected" })}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                        <WordDiff from={rewrite.original[field.key]} to={rewrite.proposal[field.key]} />
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      disabled={busy !== null}
                      onClick={() =>
                        decide({
                          title: "accepted",
                          seoTitle: "accepted",
                          description: "accepted",
                          metaDescription: "accepted",
                          imageAlt: "accepted",
                        })
                      }
                    >
                      Accept all fields
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy !== null}
                      onClick={() => decide(rewrite.decisions, true)}
                    >
                      Add suggested keywords to tags
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rewrite.proposal.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pick a tone and rewrite. You will see the current listing beside the draft and can keep or drop each field.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                  <p className="text-xs text-muted-foreground">{draft.title.length} characters · aim for 45–65</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seo">SEO title</Label>
                  <Input id="seo" value={draft.seoTitle} onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value })} />
                  <p className="text-xs text-muted-foreground">{draft.seoTitle.length || draft.title.length} characters used for the score when set</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <Input id="type" value={draft.productType} onChange={(event) => setDraft({ ...draft, productType: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={tagText} onChange={(event) => setTagText(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" className="min-h-40" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meta">Meta description</Label>
                <Textarea id="meta" value={draft.metaDescription} onChange={(event) => setDraft({ ...draft, metaDescription: event.target.value })} />
                <p className="text-xs text-muted-foreground">{draft.metaDescription.length} / 160 characters</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alt">Image alt text</Label>
                <Input id="alt" value={draft.imageAlt} onChange={(event) => setDraft({ ...draft, imageAlt: event.target.value })} />
              </div>
              <Button onClick={save} disabled={!dirty || busy !== null}>
                {busy === "save" ? "Saving…" : "Save listing"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
