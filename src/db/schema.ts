import { integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import type { FieldDecision, FieldKey, RewriteProposal } from "@/lib/types";

export const stores = pgTable("stores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  name: text("name").notNull(),
  brandVoice: text("brand_voice").notNull().default(""),
  shopDomain: text("shop_domain"),
  tokenCiphertext: text("token_ciphertext"),
  tokenHint: text("token_hint"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  handle: text("handle").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  vendor: text("vendor").notNull().default(""),
  productType: text("product_type").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull(),
  price: text("price").notNull().default(""),
  imageSrc: text("image_src").notNull().default(""),
  imageAlt: text("image_alt").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  status: text("status").notNull().default("active"),
  shopifyProductId: text("shopify_product_id"),
  shopifyImageId: text("shopify_image_id"),
  score: integer("score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const snapshots = pgTable(
  "score_snapshots",
  {
    id: text("id").primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    recordedOn: text("recorded_on").notNull(),
    averageScore: integer("average_score").notNull(),
    productCount: integer("product_count").notNull(),
  },
  (table) => [uniqueIndex("snapshots_store_day").on(table.storeId, table.recordedOn)],
);

export const rewrites = pgTable("rewrites", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  tone: text("tone").notNull(),
  source: text("source").notNull(),
  notice: text("notice"),
  original: jsonb("original").$type<RewriteProposal>().notNull(),
  proposal: jsonb("proposal").$type<RewriteProposal>().notNull(),
  decisions: jsonb("decisions").$type<Record<FieldKey, FieldDecision>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const variants = pgTable("title_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  title: text("title").notNull(),
  hypothesis: text("hypothesis").notNull().default(""),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobs = pgTable("bulk_jobs", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  tone: text("tone").notNull(),
  status: text("status").notNull().default("queued"),
  total: integer("total").notNull(),
  completed: integer("completed").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobItems = pgTable("bulk_job_items", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productTitle: text("product_title").notNull(),
  status: text("status").notNull().default("queued"),
  detail: text("detail").notNull().default(""),
});
