import { productsToCsv } from "@/lib/csv";
import { workspace } from "@/lib/api";

export async function GET() {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const products = await ctx.repo.listProducts(ctx.store.id);
  const csv = productsToCsv(products.sort((a, b) => a.handle.localeCompare(b.handle)));
  const filename = `${ctx.store.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "catalog"}-copycart.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
