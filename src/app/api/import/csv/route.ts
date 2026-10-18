import { z } from "zod";

import { badRequest, readBody, workspace } from "@/lib/api";
import { csvToDrafts } from "@/lib/csv";

const bodySchema = z.object({
  csv: z.string().min(1, "Paste or upload a CSV.").max(2_000_000),
});

export async function POST(request: Request) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest(body.error.issues[0]?.message ?? "The CSV could not be read.");
  const parsed = csvToDrafts(body.data.csv);
  if (parsed.drafts.length === 0) {
    return badRequest(parsed.errors[0] ?? "No products were found in that file.");
  }
  const result = await ctx.repo.importProducts(ctx.store.id, parsed.drafts);
  await ctx.repo.recordSnapshot(ctx.store.id);
  return Response.json({ ...result, errors: parsed.errors, imported: parsed.drafts.length });
}
