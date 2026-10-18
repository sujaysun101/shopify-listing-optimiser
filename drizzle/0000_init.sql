CREATE TABLE "bulk_job_items" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_title" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"detail" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bulk_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"tone" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"total" integer NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"handle" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"vendor" text DEFAULT '' NOT NULL,
	"product_type" text DEFAULT '' NOT NULL,
	"tags" jsonb NOT NULL,
	"price" text DEFAULT '' NOT NULL,
	"image_src" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"meta_description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"shopify_product_id" text,
	"shopify_image_id" text,
	"score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewrites" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"tone" text NOT NULL,
	"source" text NOT NULL,
	"notice" text,
	"original" jsonb NOT NULL,
	"proposal" jsonb NOT NULL,
	"decisions" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"recorded_on" text NOT NULL,
	"average_score" integer NOT NULL,
	"product_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"brand_voice" text DEFAULT '' NOT NULL,
	"shop_domain" text,
	"token_ciphertext" text,
	"token_hint" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stores_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "title_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"store_id" text NOT NULL,
	"label" text NOT NULL,
	"title" text NOT NULL,
	"hypothesis" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bulk_job_items" ADD CONSTRAINT "bulk_job_items_job_id_bulk_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."bulk_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_jobs" ADD CONSTRAINT "bulk_jobs_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewrites" ADD CONSTRAINT "rewrites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_snapshots" ADD CONSTRAINT "score_snapshots_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "title_variants" ADD CONSTRAINT "title_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "title_variants" ADD CONSTRAINT "title_variants_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "snapshots_store_day" ON "score_snapshots" USING btree ("store_id","recorded_on");