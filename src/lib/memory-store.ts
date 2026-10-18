import "server-only";

import {
  buildDemoProducts,
  buildDemoSnapshots,
  buildDemoStore,
  buildDemoVariants,
  DEFAULT_BRAND_VOICE,
  newId,
  sampleDrafts,
} from "@/lib/demo-catalog";
import { DEMO_USER_ID } from "@/lib/constants";
import { scoreProduct } from "@/lib/scoring";
import { todayKey } from "@/lib/text";
import type {
  Job,
  JobItem,
  Product,
  ProductDraft,
  ProductPatch,
  Repo,
  RewriteRecord,
  Snapshot,
  Store,
  Variant,
  VariantStatus,
} from "@/lib/types";

type MemoryState = {
  stores: Store[];
  products: Product[];
  snapshots: Snapshot[];
  rewrites: RewriteRecord[];
  variants: Variant[];
  jobs: Job[];
  jobItems: JobItem[];
};

function seedState(): MemoryState {
  const store = buildDemoStore(DEMO_USER_ID);
  const products = buildDemoProducts(store.id);
  return {
    stores: [store],
    products,
    snapshots: buildDemoSnapshots(store.id, products),
    rewrites: [],
    variants: buildDemoVariants(store.id),
    jobs: [],
    jobItems: [],
  };
}

const globalState = globalThis as unknown as { __copycart?: MemoryState };
function state() {
  if (!globalState.__copycart) globalState.__copycart = seedState();
  return globalState.__copycart;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function touch(product: Product, patch: ProductPatch): Product {
  const next: Product = {
    ...product,
    ...patch,
    tags: patch.tags ?? product.tags,
    updatedAt: new Date().toISOString(),
  };
  next.score = scoreProduct(next).score;
  return next;
}

function fromDraft(storeId: string, draft: ProductDraft, existing?: Product): Product {
  const base: Product = {
    id: existing?.id ?? newId("prod"),
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
    shopifyProductId: draft.shopifyProductId ?? existing?.shopifyProductId ?? null,
    shopifyImageId: draft.shopifyImageId ?? existing?.shopifyImageId ?? null,
    score: 0,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  base.score = scoreProduct(base).score;
  return base;
}

function average(products: Product[]) {
  if (products.length === 0) return 0;
  return Math.round(products.reduce((sum, product) => sum + product.score, 0) / products.length);
}

export const memoryRepo: Repo = {
  mode: "memory",
  async ensureStore(userId) {
    const db = state();
    const found = db.stores.find((store) => store.userId === userId);
    if (found) return clone(found);
    if (userId === DEMO_USER_ID) {
      const seeded = buildDemoStore(userId);
      db.stores.push(seeded);
      db.products.push(...buildDemoProducts(seeded.id));
      db.snapshots.push(...buildDemoSnapshots(seeded.id, db.products.filter((product) => product.storeId === seeded.id)));
      db.variants.push(...buildDemoVariants(seeded.id));
      return clone(seeded);
    }
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
    db.stores.push(store);
    return clone(store);
  },
  async updateStore(storeId, patch) {
    const db = state();
    const store = db.stores.find((item) => item.id === storeId);
    if (!store) throw new Error("Store not found");
    Object.assign(store, patch);
    return clone(store);
  },
  async listProducts(storeId) {
    return clone(
      state()
        .products.filter((product) => product.storeId === storeId)
        .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title)),
    );
  },
  async getProduct(storeId, productId) {
    const product = state().products.find((item) => item.storeId === storeId && item.id === productId);
    return product ? clone(product) : null;
  },
  async updateProduct(storeId, productId, patch) {
    const db = state();
    const index = db.products.findIndex((item) => item.storeId === storeId && item.id === productId);
    const current = db.products[index];
    if (!current) return null;
    const next = touch(current, patch);
    db.products[index] = next;
    return clone(next);
  },
  async importProducts(storeId, rows) {
    const db = state();
    let created = 0;
    let updated = 0;
    for (const row of rows) {
      const index = db.products.findIndex((item) => item.storeId === storeId && item.handle === row.handle);
      if (index >= 0) {
        const current = db.products[index];
        if (!current) continue;
        db.products[index] = fromDraft(storeId, row, current);
        updated += 1;
      } else {
        db.products.push(fromDraft(storeId, row));
        created += 1;
      }
    }
    return { created, updated };
  },
  async loadSample(storeId) {
    const result = await this.importProducts(storeId, sampleDrafts());
    const store = state().stores.find((item) => item.id === storeId);
    if (store && store.name === "My store") store.name = "Hearth & Wick";
    if (state().snapshots.filter((item) => item.storeId === storeId).length === 0) {
      const products = state().products.filter((item) => item.storeId === storeId);
      state().snapshots.push(...buildDemoSnapshots(storeId, products));
    }
    if (storeId === state().stores.find((item) => item.userId === DEMO_USER_ID)?.id) {
      return result.created + result.updated;
    }
    return result.created + result.updated;
  },
  async listSnapshots(storeId) {
    return clone(
      state()
        .snapshots.filter((item) => item.storeId === storeId)
        .sort((a, b) => a.recordedOn.localeCompare(b.recordedOn)),
    );
  },
  async recordSnapshot(storeId) {
    const db = state();
    const products = db.products.filter((item) => item.storeId === storeId);
    const recordedOn = todayKey();
    const snapshot: Snapshot = {
      id: newId("snap"),
      storeId,
      recordedOn,
      averageScore: average(products),
      productCount: products.length,
    };
    const index = db.snapshots.findIndex((item) => item.storeId === storeId && item.recordedOn === recordedOn);
    if (index >= 0) {
      const current = db.snapshots[index];
      if (current) db.snapshots[index] = { ...snapshot, id: current.id };
    } else {
      db.snapshots.push(snapshot);
    }
    const saved = db.snapshots.find((item) => item.storeId === storeId && item.recordedOn === recordedOn);
    return clone(saved ?? snapshot);
  },
  async saveRewrite(record) {
    state().rewrites.unshift(record);
    return clone(record);
  },
  async latestRewrite(productId) {
    const record = state().rewrites.find((item) => item.productId === productId);
    return record ? clone(record) : null;
  },
  async getRewrite(id) {
    const record = state().rewrites.find((item) => item.id === id);
    return record ? clone(record) : null;
  },
  async updateRewrite(record) {
    const db = state();
    const index = db.rewrites.findIndex((item) => item.id === record.id);
    if (index >= 0) db.rewrites[index] = record;
  },
  async listVariants(storeId) {
    return clone(
      state()
        .variants.filter((item) => item.storeId === storeId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },
  async addVariants(records) {
    state().variants.unshift(...records);
  },
  async getVariant(storeId, id) {
    const variant = state().variants.find((item) => item.storeId === storeId && item.id === id);
    return variant ? clone(variant) : null;
  },
  async setVariantStatus(storeId, id, status: VariantStatus) {
    const db = state();
    const variant = db.variants.find((item) => item.storeId === storeId && item.id === id);
    if (!variant) return null;
    if (status === "live" || status === "winner") {
      for (const item of db.variants) {
        if (item.productId === variant.productId && item.id !== variant.id && item.status === status) {
          item.status = "archived";
        }
      }
    }
    variant.status = status;
    return clone(variant);
  },
  async createJob(job, items) {
    const db = state();
    db.jobs.unshift(job);
    db.jobItems.push(...items);
  },
  async getJob(storeId, id) {
    const db = state();
    const job = db.jobs.find((item) => item.storeId === storeId && item.id === id);
    if (!job) return null;
    return {
      job: clone(job),
      items: clone(db.jobItems.filter((item) => item.jobId === job.id)),
    };
  },
  async latestJob(storeId) {
    const job = state().jobs.find((item) => item.storeId === storeId);
    if (!job) return null;
    return this.getJob(storeId, job.id);
  },
  async saveJob(job, items) {
    const db = state();
    const index = db.jobs.findIndex((item) => item.id === job.id);
    if (index >= 0) db.jobs[index] = job;
    db.jobItems = db.jobItems.filter((item) => item.jobId !== job.id).concat(items);
  },
};
