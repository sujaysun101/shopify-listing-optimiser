import { workspace } from "@/lib/api";

export async function GET() {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const products = await ctx.repo.listProducts(ctx.store.id);
  return Response.json({
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      productType: product.productType,
      score: product.score,
      price: product.price,
      status: product.status,
    })),
  });
}
