"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TONES, type Job, type JobItem, type Product, type Tone } from "@/lib/types";

export function QueuePanel({
  products,
  initialJob,
  aiReady,
}: {
  products: Product[];
  initialJob: { job: Job; items: JobItem[] } | null;
  aiReady: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    products.filter((product) => product.score < 70).map((product) => product.id),
  );
  const [tone, setTone] = useState<Tone>("warm");
  const [job, setJob] = useState(initialJob);
  const [running, setRunning] = useState(false);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function start() {
    setRunning(true);
    try {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selected, tone }),
      });
      const data = (await response.json()) as { error?: string; job?: Job; items?: JobItem[] };
      if (!response.ok || !data.job || !data.items) throw new Error(data.error || "Could not start the queue");
      setJob({ job: data.job, items: data.items });
      await drain(data.job.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start");
      setRunning(false);
    }
  }

  async function drain(jobId: string) {
    setRunning(true);
    try {
      while (true) {
        const response = await fetch(`/api/queue/${jobId}/tick`, { method: "POST" });
        const data = (await response.json()) as { error?: string; job?: Job; items?: JobItem[] };
        if (response.status === 429) {
          toast.error(data.error || "Rate limit reached. The queue is paused.");
          break;
        }
        if (!response.ok || !data.job || !data.items) throw new Error(data.error || "Queue step failed");
        setJob({ job: data.job, items: data.items });
        if (data.job.status === "done") {
          toast.success("Queue finished");
          router.refresh();
          break;
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Queue step failed");
    } finally {
      setRunning(false);
    }
  }

  const progress = job ? Math.round((job.job.completed / Math.max(job.job.total, 1)) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Low scores are selected. The queue rewrites each one and applies every field.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Import a catalog before queueing rewrites.</p>
          ) : (
            products.map((product) => (
              <label key={product.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(product.id)}
                    onChange={() => toggle(product.id)}
                  />
                  {product.title}
                </span>
                <span className="tabular-nums text-muted-foreground">{product.score}</span>
              </label>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Run</CardTitle>
          <CardDescription>{aiReady ? "Live Claude rewrites." : "Sample rewrites, labeled in each product."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2">
            {TONES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={tone === item.id}
                onClick={() => setTone(item.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${tone === item.id ? "border-primary bg-primary/10" : ""}`}
              >
                <span className="block font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.hint}</span>
              </button>
            ))}
          </div>
          <Button onClick={start} disabled={running || selected.length === 0 || (job?.job.status === "running")}>
            {running ? "Working…" : `Optimize ${selected.length}`}
          </Button>
          {job && job.job.status !== "done" && !running ? (
            <Button variant="outline" onClick={() => drain(job.job.id)}>Resume queue</Button>
          ) : null}
          {job ? (
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} role="progressbar">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">
                {job.job.completed} of {job.job.total} · {job.job.status}
              </p>
              <ul className="max-h-48 space-y-1 overflow-auto text-xs">
                {job.items.map((item) => (
                  <li key={item.id}>
                    <span className="font-medium">{item.status}</span> · {item.productTitle}
                    {item.detail ? <span className="block text-muted-foreground">{item.detail}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
