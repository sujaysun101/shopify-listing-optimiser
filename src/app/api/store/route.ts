import { z } from "zod";

import { badRequest, readBody, workspace } from "@/lib/api";

const bodySchema = z.object({
  name: z.string().min(1).max(80),
  brandVoice: z.string().max(1000),
});

export async function PATCH(request: Request) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Store name is required, and the brand voice must stay under 1000 characters.");
  const store = await ctx.repo.updateStore(ctx.store.id, body.data);
  return Response.json({
    store: { id: store.id, name: store.name, brandVoice: store.brandVoice },
  });
}
