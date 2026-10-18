import { z } from "zod";

import { badRequest, readBody, workspace } from "@/lib/api";
import { encryptionConfigured, encryptSecret } from "@/lib/crypto";
import { normalizeShopDomain } from "@/lib/shopify";

const bodySchema = z.object({
  domain: z.string().min(1).max(120),
  token: z.string().min(20).max(200),
});

export async function POST(request: Request) {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  if (!encryptionConfigured()) {
    return badRequest("Shopify tokens can be stored only when ENCRYPTION_KEY is set on the server.");
  }
  const body = bodySchema.safeParse(await readBody(request));
  if (!body.success) return badRequest("Use the shop’s myshopify.com domain and an Admin API access token.");
  const domain = normalizeShopDomain(body.data.domain);
  if (!domain) return badRequest("Enter the store’s myshopify.com domain, for example hearth-and-wick.myshopify.com.");
  const ciphertext = encryptSecret(body.data.token.trim());
  if (!ciphertext) return badRequest("The server could not encrypt that token.");
  const store = await ctx.repo.updateStore(ctx.store.id, {
    shopDomain: domain,
    tokenCiphertext: ciphertext,
    tokenHint: body.data.token.trim().slice(-4),
  });
  return Response.json({
    connected: true,
    domain: store.shopDomain,
    hint: store.tokenHint,
  });
}

export async function DELETE() {
  const ctx = await workspace();
  if ("response" in ctx) return ctx.response;
  await ctx.repo.updateStore(ctx.store.id, {
    shopDomain: null,
    tokenCiphertext: null,
    tokenHint: null,
  });
  return Response.json({ connected: false });
}
