import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { jobItems, jobs, products, rewrites, snapshots, stores, variants } from "@/db/schema";
import {
  buildDemoSnapshots,
  DEFAULT_BRAND_VOICE,
  newId,
  sampleDrafts,
} from "@/lib/demo-catalog";
import { scoreProduct } from "@/lib/scoring";
import { todayKey } from "@/lib/text";
import type {
  FieldDecision,
  FieldKey,
  Job,
  JobItem,
  Product,
  ProductDraft,
  ProductPatch,
  Repo,
  RewriteProposal,
  RewriteRecord,
  Snapshot,
  Store,
  Tone,
  Variant,
  VariantStatus,
} from "@/lib/types";

type Database = NonNullable<ReturnType<typeof getDb>>;
type StoreRow = typeof stores.$inferSelect;
type ProductRow = typeof products.$inferSelect;

function mapStore(row: StoreRow): Store {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    brandVoice: row.brandVoice,
    shopDomain: row.shopDomain,
    tokenCiphertext: row.tokenCiphertext,
    tokenHint: row.tokenHint,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    storeId: row.storeId,
    handle: row.handle,
    title: row.title,
    description: row.description,
    vendor: row.vendor,
    productType: row.productType,
    tags: row.tags ?? [],
    price: row.price,
    imageSrc: row.imageSrc,
    imageAlt: row.imageAlt,
    seoTitle: row.seoTitle,
    metaDescription: row.metaDescription,
    status: row.status === "draft" ? "draft" : "active",
    shopifyProductId: row.shopifyProductId,
    shopifyImageId: row.shopifyImageId,
    score: row.score,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function productValues(storeId: string, draft: ProductDraft, existingId?: string) {
  const product = mapProduct({
    id: existingId ?? newId("prod"),
    storeId,
    handle: draft.handle,
    title: draft.title,
    description: draft.description,
    vendor: draft.vendor,
    productType: draft.productType,
    tags: draft.tags,
    price: draft.price,
    imageSrc: draft.imageSrc,
    imageAlt: draft.imageAlt,
    seoTitle: draft.seoTitle,
    metaDescription: draft.metaDescription,
    status: draft.status,
    shopifyProductId: draft.shopifyProductId ?? null,
    shopifyImageId: draft.shopifyImageId ?? null,
    score: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  product.score = scoreProduct(product).score;
  return {
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };
}

function mapRewrite(row: typeof rewrites.$inferSelect): RewriteRecord {
  return {
    id: row.id,
    productId: row.productId,
    tone: row.tone as Tone,
    source: row.source === "ai" ? "ai" : "sample",
    notice: row.notice,
    original: row.original,
    proposal: row.proposal,
    decisions: row.decisions,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapVariant(row: typeof variants.$inferSelect): Variant {
  const status: VariantStatus =
    row.status === "live" || row.status === "winner" || row.status === "archived" ? row.status : "draft";
  return {
    id: row.id,
    productId: row.productId,
    storeId: row.storeId,
    label: row.label,
    title: row.title,
    hypothesis: row.hypothesis,
    status,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapJob(row: typeof jobs.$inferSelect): Job {
  return {
    id: row.id,
    storeId: row.storeId,
    tone: row.tone as Tone,
    status: row.status === "running" || row.status === "done" ? row.status : "queued",
    total: row.total,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapJobItem(row: typeof jobItems.$inferSelect): JobItem {
  return {
    id: row.id,
    jobId: row.jobId,
    productId: row.productId,
    productTitle: row.productTitle,
    status: row.status === "done" || row.status === "failed" ? row.status : "queued",
    detail: row.detail,
  };
}

export function createDrizzleRepo(db: Database): Repo {
  return {
    mode: "postgres",
    async ensureStore(userId) {
      const existing = await db.select().from(stores).where(eq(stores.userId, userId)).limit(1);
      const found = existing[0];
      if (found) return mapStore(found);
      const store: Store = {
        id: newId("store"),
        userId,
        name: "My store",
        brandVoice: DEFAULT_BRAND_VOICE,
        shopDomain: null,
        tokenCiphertext: null,
        tokenHint: null,
        createdAt: new Date().toISOString(),
      };
      await db.insert(stores).values({ ...store, createdAt: new Date(store.createdAt) });
      return store;
    },
    async updateStore(storeId, patch) {
      const updated = await db.update(stores).set(patch).where(eq(stores.id, storeId)).returning();
      const row = updated[0];
      if (!row) throw new Error("Store not found");
      return mapStore(row);
    },
    async listProducts(storeId) {
      const rows = await db
        .select()
        .from(products)
        .where(eq(products.storeId, storeId))
        .orderBy(asc(products.score), asc(products.title));
      return rows.map(mapProduct);
    },
    async getProduct(storeId, productId) {
      const rows = await db
        .select()
        .from(products)
        .where(and(eq(products.storeId, storeId), eq(products.id, productId)))
        .limit(1);
      return rows[0] ? mapProduct(rows[0]) : null;
    },
    async updateProduct(storeId, productId, patch: ProductPatch) {
      const current = await this.getProduct(storeId, productId);
      if (!current) return null;
      const next: Product = { ...current, ...patch, tags: patch.tags ?? current.tags, updatedAt: new Date().toISOString() };
      next.score = scoreProduct(next).score;
      await db
        .update(products)
        .set({
          handle: next.handle,
          title: next.title,
          description: next.description,
          vendor: next.vendor,
          productType: next.productType,
          tags: next.tags,
          price: next.price,
          imageSrc: next.imageSrc,
          imageAlt: next.imageAlt,
          seoTitle: next.seoTitle,
          metaDescription: next.metaDescription,
          status: next.status,
          shopifyProductId: next.shopifyProductId,
          shopifyImageId: next.shopifyImageId,
          score: next.score,
          updatedAt: new Date(next.updatedAt),
        })
        .where(eq(products.id, productId));
      return next;
    },
    async importProducts(storeId, rows) {
      let created = 0;
      let updated = 0;
      for (const row of rows) {
        const existing = await db
          .select()
          .from(products)
          .where(and(eq(products.storeId, storeId), eq(products.handle, row.handle)))
          .limit(1);
        const current = existing[0];
        if (current) {
          const values = productValues(storeId, {
            ...row,
            shopifyProductId: row.shopifyProductId ?? current.shopifyProductId,
            shopifyImageId: row.shopifyImageId ?? current.shopifyImageId,
          }, current.id);
          await db
            .update(products)
            .set({ ...values, id: current.id, createdAt: current.createdAt })
            .where(eq(products.id, current.id));
          updated += 1;
        } else {
          await db.insert(products).values(productValues(storeId, row));
          created += 1;
        }
      }
      return { created, updated };
    },
    async loadSample(storeId) {
      const result = await this.importProducts(storeId, sampleDrafts());
      const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
      if (store[0]?.name === "My store") {
        await db.update(stores).set({ name: "Hearth & Wick" }).where(eq(stores.id, storeId));
      }
      const existingSnaps = await db.select().from(snapshots).where(eq(snapshots.storeId, storeId));
      if (existingSnaps.length === 0) {
        const catalog = await this.listProducts(storeId);
        const history = buildDemoSnapshots(storeId, catalog);
        if (history.length > 0) {
          await db.insert(snapshots).values(
            history.map((snapshot) => ({
              id: snapshot.id.startsWith("snap_") ? newId("snap") : snapshot.id,
              storeId,
              recordedOn: snapshot.recordedOn,
              averageScore: snapshot.averageScore,
              productCount: snapshot.productCount,
            })),
          );
        }
      }
      return result.created + result.updated;
    },
    async listSnapshots(storeId) {
      const rows = await db
        .select()
        .from(snapshots)
        .where(eq(snapshots.storeId, storeId))
        .orderBy(asc(snapshots.recordedOn));
      return rows.map(
        (row): Snapshot => ({
          id: row.id,
          storeId: row.storeId,
          recordedOn: row.recordedOn,
          averageScore: row.averageScore,
          productCount: row.productCount,
        }),
      );
    },
    async recordSnapshot(storeId) {
      const catalog = await this.listProducts(storeId);
      const recordedOn = todayKey();
      const averageScore =
        catalog.length === 0
          ? 0
          : Math.round(catalog.reduce((sum, product) => sum + product.score, 0) / catalog.length);
      const existing = await db
        .select()
        .from(snapshots)
        .where(and(eq(snapshots.storeId, storeId), eq(snapshots.recordedOn, recordedOn)))
        .limit(1);
      if (existing[0]) {
        await db
          .update(snapshots)
          .set({ averageScore, productCount: catalog.length })
          .where(eq(snapshots.id, existing[0].id));
        return {
          id: existing[0].id,
          storeId,
          recordedOn,
          averageScore,
          productCount: catalog.length,
        };
      }
      const snapshot = { id: newId("snap"), storeId, recordedOn, averageScore, productCount: catalog.length };
      await db.insert(snapshots).values(snapshot);
      return snapshot;
    },
    async saveRewrite(record) {
      await db.insert(rewrites).values({
        ...record,
        original: record.original satisfies RewriteProposal,
        proposal: record.proposal,
        decisions: record.decisions satisfies Record<FieldKey, FieldDecision>,
        createdAt: new Date(record.createdAt),
      });
      return record;
    },
    async latestRewrite(productId) {
      const rows = await db
        .select()
        .from(rewrites)
        .where(eq(rewrites.productId, productId))
        .orderBy(desc(rewrites.createdAt))
        .limit(1);
      return rows[0] ? mapRewrite(rows[0]) : null;
    },
    async getRewrite(id) {
      const rows = await db.select().from(rewrites).where(eq(rewrites.id, id)).limit(1);
      return rows[0] ? mapRewrite(rows[0]) : null;
    },
    async updateRewrite(record) {
      await db
        .update(rewrites)
        .set({ decisions: record.decisions, proposal: record.proposal, notice: record.notice })
        .where(eq(rewrites.id, record.id));
    },
    async listVariants(storeId) {
      const rows = await db
        .select()
        .from(variants)
        .where(eq(variants.storeId, storeId))
        .orderBy(desc(variants.createdAt));
      return rows.map(mapVariant);
    },
    async addVariants(records) {
      if (records.length === 0) return;
      await db.insert(variants).values(
        records.map((record) => ({
          ...record,
          createdAt: new Date(),
        })),
      );
    },
    async getVariant(storeId, id) {
      const rows = await db
        .select()
        .from(variants)
        .where(and(eq(variants.storeId, storeId), eq(variants.id, id)))
        .limit(1);
      return rows[0] ? mapVariant(rows[0]) : null;
    },
    async setVariantStatus(storeId, id, status) {
      const variant = await this.getVariant(storeId, id);
      if (!variant) return null;
      if (status === "live" || status === "winner") {
        const siblings = await db.select().from(variants).where(eq(variants.productId, variant.productId));
        for (const sibling of siblings) {
          if (sibling.id !== id && sibling.status === status) {
            await db.update(variants).set({ status: "archived" }).where(eq(variants.id, sibling.id));
          }
        }
      }
      await db.update(variants).set({ status }).where(eq(variants.id, id));
      return { ...variant, status };
    },
    async createJob(job, items) {
      await db.insert(jobs).values({ ...job, createdAt: new Date(job.createdAt) });
      if (items.length > 0) await db.insert(jobItems).values(items);
    },
    async getJob(storeId, id) {
      const rows = await db
        .select()
        .from(jobs)
        .where(and(eq(jobs.storeId, storeId), eq(jobs.id, id)))
        .limit(1);
      const job = rows[0];
      if (!job) return null;
      const items = await db.select().from(jobItems).where(eq(jobItems.jobId, job.id));
      return { job: mapJob(job), items: items.map(mapJobItem) };
    },
    async latestJob(storeId) {
      const rows = await db
        .select()
        .from(jobs)
        .where(eq(jobs.storeId, storeId))
        .orderBy(desc(jobs.createdAt))
        .limit(1);
      const job = rows[0];
      if (!job) return null;
      return this.getJob(storeId, job.id);
    },
    async saveJob(job, items) {
      await db
        .update(jobs)
        .set({ status: job.status, completed: job.completed, total: job.total })
        .where(eq(jobs.id, job.id));
      for (const item of items) {
        await db
          .update(jobItems)
          .set({ status: item.status, detail: item.detail, productTitle: item.productTitle })
          .where(eq(jobItems.id, item.id));
      }
    },
  };
}
