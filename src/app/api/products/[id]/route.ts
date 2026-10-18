import { z } from "zod";

import { badRequest, readBody, workspace } from "@/lib/api";

const patchSchema = z.object({
  title: z.string().min(1).max(180).optional(),
  description: z.string().max(8000).optional(),
  vendor: z.string().max(120).optional(),
  productType: z.string().max(120).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  price: z.string().max(20).optional(),
  imageAlt: z.string().max(300).optional(),
  seoTitle: z.string().max(180).optional(),
  metaDescription: z.string().max(300).optional(),
  status: z.enum(["active", "draft"]).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = patchSchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Check the product fields and try again.");
  const { id } = await context.params;
  const product = await ctx.repo.updateProduct(ctx.store.id, id, body.data);
  if (!product) return badRequest("That product is not in this store.", 404);
  await ctx.repo.recordSnapshot(ctx.store.id);
  return Response.json({ product });
}
