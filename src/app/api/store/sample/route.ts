import { workspace } from "@/lib/api";

export async function POST() {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const count = await ctx.repo.loadSample(ctx.store.id);
  await ctx.repo.recordSnapshot(ctx.store.id);
  return Response.json({ count });
}
