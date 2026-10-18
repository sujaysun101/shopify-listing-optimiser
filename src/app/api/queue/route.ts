import { z } from "zod";

import { badRequest, readBody, toneSchema, workspace } from "@/lib/api";

const bodySchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(40),
  tone: toneSchema,
});

export async function GET() {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const latest = await ctx.repo.latestJob(ctx.store.id);
  return Response.json({ job: latest });
}

export async function POST(request: Request) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Choose a tone and at least one product.");
  const open = await ctx.repo.latestJob(ctx.store.id);
  if (open && open.job.status !== "done") {
    return badRequest("A queue is already running. Finish it before starting another.");
  }
  const items = [];
  for (const productId of body.data.productIds) {
    const product = await ctx.repo.getProduct(ctx.store.id, productId);
    if (!product) continue;
    items.push({
      id: `item_${crypto.randomUUID().slice(0, 8)}`,
      jobId: "",
      productId: product.id,
      productTitle: product.title,
      status: "queued" as const,
      detail: "",
    });
  }
  if (items.length === 0) return badRequest("None of those products are in this store.");
  const job = {
    id: `job_${crypto.randomUUID().slice(0, 8)}`,
    storeId: ctx.store.id,
    tone: body.data.tone,
    status: "queued" as const,
    total: items.length,
    completed: 0,
    createdAt: new Date().toISOString(),
  };
  const stamped = items.map((item) => ({ ...item, jobId: job.id }));
  await ctx.repo.createJob(job, stamped);
  return Response.json({ job, items: stamped });
}
