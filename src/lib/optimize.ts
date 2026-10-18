import "server-only";

import { generateRewrite } from "@/lib/ai";
import { proposalFromProduct } from "@/lib/sample-copy";
import { FIELD_KEYS, type FieldKey, type Repo, type Store } from "@/lib/types";

export async function tickJob(repo: Repo, store: Store, jobId: string, userId: string) {
  const data = await repo.getJob(store.id, jobId);
  if (!data) return null;
  const next = data.items.find((item) => item.status === "queued");
  if (!next) {
    data.job.status = "done";
    await repo.saveJob(data.job, data.items);
    await repo.recordSnapshot(store.id);
    return { ...data, rateLimited: false };
  }
  const product = await repo.getProduct(store.id, next.productId);
  if (!product) {
    next.status = "failed";
    next.detail = "Product is no longer in the catalog.";
    data.job.completed += 1;
  } else {
    const result = await generateRewrite({
      userId,
      product,
      tone: data.job.tone,
      brandVoice: store.brandVoice,
    });
    if ("error" in result) {
      return { ...data, rateLimited: true, error: result.error, status: result.status };
    }
    const patch: Partial<Record<FieldKey, string>> = {};
    for (const field of FIELD_KEYS) patch[field] = result.proposal[field];
    const updated = await repo.updateProduct(store.id, product.id, patch);
    await repo.saveRewrite({
      id: `rew_${crypto.randomUUID().slice(0, 8)}`,
      productId: product.id,
      tone: data.job.tone,
      source: result.source,
      notice: result.notice,
      original: proposalFromProduct(product),
      proposal: result.proposal,
      decisions: {
        title: "accepted",
        seoTitle: "accepted",
        description: "accepted",
        metaDescription: "accepted",
        imageAlt: "accepted",
      },
      createdAt: new Date().toISOString(),
    });
    next.status = "done";
    next.detail = updated
      ? `${result.source === "sample" ? "Sample" : "AI"} rewrite applied. Score is now ${updated.score}.`
      : "Updated.";
    next.productTitle = updated?.title ?? next.productTitle;
    data.job.completed += 1;
  }
  data.job.status = data.job.completed >= data.job.total ? "done" : "running";
  await repo.saveJob(data.job, data.items);
  if (data.job.status === "done") await repo.recordSnapshot(store.id);
  return { ...data, rateLimited: false };
}
