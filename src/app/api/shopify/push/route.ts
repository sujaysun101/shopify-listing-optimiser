import { z } from "zod";

import { badRequest, readBody, workspace } from "@/lib/api";
import { pushProduct, storeToken } from "@/lib/shopify";

const bodySchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(100),
});

export async function POST(request: Request) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const connection = storeToken(ctx.store);
  if (!connection) return badRequest("Connect a Shopify store before pushing.");
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Choose at least one product to push.");
  const results = [];
  for (const productId of body.data.productIds) {
    const product = await ctx.repo.getProduct(ctx.store.id, productId);
    if (!product) {
      results.push({ productId, ok: false, message: "Not in this store." });
      continue;
    }
    try {
      const result = await pushProduct(connection.domain, connection.token, product);
      results.push({ productId, title: product.title, ...result });
    } catch (error) {
      results.push({
        productId,
        title: product.title,
        ok: false,
        message: error instanceof Error ? error.message : "Push failed.",
      });
    }
  }
  return Response.json({ results });
}
