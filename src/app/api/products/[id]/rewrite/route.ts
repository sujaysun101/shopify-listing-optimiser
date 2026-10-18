import { badRequest, readBody, toneSchema, workspace } from "@/lib/api";
import { generateRewrite } from "@/lib/ai";
import { proposalFromProduct } from "@/lib/sample-copy";
import { z } from "zod";

const bodySchema = z.object({ tone: toneSchema });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Choose a tone preset.");
  const { id } = await context.params;
  const product = await ctx.repo.getProduct(ctx.store.id, id);
  if (!product) return badRequest("That product is not in this store.", 404);
  const result = await generateRewrite({
    userId: ctx.session.userId,
    product,
    tone: body.data.tone,
    brandVoice: ctx.store.brandVoice,
  });
  if ("error" in result) return badRequest(result.error, result.status);
  const rewrite = await ctx.repo.saveRewrite({
    id: `rew_${crypto.randomUUID().slice(0, 8)}`,
    productId: product.id,
    tone: body.data.tone,
    source: result.source,
    notice: result.notice,
    original: proposalFromProduct(product),
    proposal: result.proposal,
    decisions: {
      title: "pending",
      seoTitle: "pending",
      description: "pending",
      metaDescription: "pending",
      imageAlt: "pending",
    },
    createdAt: new Date().toISOString(),
  });
  return Response.json({ rewrite });
}
