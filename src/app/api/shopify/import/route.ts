import { badRequest, workspace } from "@/lib/api";
import { importShopifyProducts, storeToken } from "@/lib/shopify";

export async function POST() {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const connection = storeToken(ctx.store);
  if (!connection) return badRequest("Connect a Shopify store before importing.");
  try {
    const drafts = await importShopifyProducts(connection.domain, connection.token);
    if (drafts.length === 0) return badRequest("Shopify returned no products.");
    const result = await ctx.repo.importProducts(ctx.store.id, drafts);
    await ctx.repo.recordSnapshot(ctx.store.id);
    return Response.json({ ...result, imported: drafts.length });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Shopify import failed.");
  }
}
