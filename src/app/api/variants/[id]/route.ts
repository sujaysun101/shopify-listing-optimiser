import { z } from "zod";

import { badRequest, readBody, workspace } from "@/lib/api";

const bodySchema = z.object({
  status: z.enum(["draft", "live", "winner", "archived"]),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Choose draft, live, winner, or archived.");
  const { id } = await context.params;
  const variant = await ctx.repo.setVariantStatus(ctx.store.id, id, body.data.status);
  if (!variant) return badRequest("That title variant is not in this store.", 404);
  let product = await ctx.repo.getProduct(ctx.store.id, variant.productId);
  if (body.data.status === "winner" && product) {
    product = await ctx.repo.updateProduct(ctx.store.id, product.id, {
      title: variant.title,
      seoTitle: product.seoTitle.trim() ? product.seoTitle : variant.title,
    });
    await ctx.repo.recordSnapshot(ctx.store.id);
  }
  return Response.json({ variant, product });
}
