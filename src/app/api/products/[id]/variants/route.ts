import { z } from "zod";

import { badRequest, readBody, toneSchema, workspace } from "@/lib/api";
import { generateVariants } from "@/lib/ai";

const bodySchema = z.object({ tone: toneSchema });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Choose a tone preset.");
  const { id } = await context.params;
  const product = await ctx.repo.getProduct(ctx.store.id, id);
  if (!product) return badRequest("That product is not in this store.", 404);
  const result = await generateVariants({
    userId: ctx.session.userId,
    product,
    tone: body.data.tone,
    brandVoice: ctx.store.brandVoice,
    storeId: ctx.store.id,
  });
  if ("error" in result) return badRequest(result.error, result.status);
  const createdAt = new Date().toISOString();
  const variants = result.variants.map((variant) => ({ ...variant, createdAt }));
  await ctx.repo.addVariants(variants);
  return Response.json({ variants, source: result.source, notice: result.notice });
}
