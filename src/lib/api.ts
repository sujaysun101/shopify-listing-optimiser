import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getRepo } from "@/lib/repo";
import { requireApiUser } from "@/lib/session";
import { FIELD_KEYS, type FieldDecision, type FieldKey, type Repo, type RewriteRecord } from "@/lib/types";

export const toneSchema = z.enum(["warm", "concise", "luxury", "playful", "gift"]);

export const decisionSchema = z.object({
  title: z.enum(["pending", "accepted", "rejected"]),
  seoTitle: z.enum(["pending", "accepted", "rejected"]),
  description: z.enum(["pending", "accepted", "rejected"]),
  metaDescription: z.enum(["pending", "accepted", "rejected"]),
  imageAlt: z.enum(["pending", "accepted", "rejected"]),
});

export async function readBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

export function badRequest(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function workspace() {
  const session = await requireApiUser();
  if (!session) return { response: badRequest("Sign in required.", 401) };
  try {
    const repo = getRepo();
    const store = await repo.ensureStore(session.userId);
    return { session, repo, store };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open the store.";
    return { response: badRequest(message, 400) };
  }
}

export async function applyRewriteDecisions(
  repo: Repo,
  storeId: string,
  rewrite: RewriteRecord,
  decisions: Record<FieldKey, FieldDecision>,
) {
  const product = await repo.getProduct(storeId, rewrite.productId);
  if (!product) return null;
  const patch: Partial<Record<FieldKey, string>> = {};
  for (const field of FIELD_KEYS) {
    const decision = decisions[field];
    if (decision === "accepted") patch[field] = rewrite.proposal[field];
    if (decision === "rejected") patch[field] = rewrite.original[field];
  }
  const updated = await repo.updateProduct(storeId, product.id, patch);
  await repo.updateRewrite({ ...rewrite, decisions });
  if (updated) await repo.recordSnapshot(storeId);
  return updated;
}
