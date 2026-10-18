import { z } from "zod";

import { applyRewriteDecisions, badRequest, decisionSchema, readBody, workspace } from "@/lib/api";

const bodySchema = z.object({
  decisions: decisionSchema,
  addKeywords: z.boolean().optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Each field needs a decision of pending, accepted, or rejected.");
  const { id } = await context.params;
  const rewrite = await ctx.repo.getRewrite(id);
  if (!rewrite) return badRequest("That rewrite is no longer available.", 404);
  const product = await ctx.repo.getProduct(ctx.store.id, rewrite.productId);
  if (!product) return badRequest("That product is not in this store.", 404);
  const updated = await applyRewriteDecisions(ctx.repo, ctx.store.id, rewrite, body.data.decisions);
  if (!updated) return badRequest("Could not update the product.");
  if (body.data.addKeywords) {
    const tags = [...new Set([...updated.tags, ...rewrite.proposal.keywords])].slice(0, 12);
    const withTags = await ctx.repo.updateProduct(ctx.store.id, updated.id, { tags });
    return Response.json({ product: withTags, rewrite: { ...rewrite, decisions: body.data.decisions } });
  }
  return Response.json({ product: updated, rewrite: { ...rewrite, decisions: body.data.decisions } });
}
