import { eq } from "drizzle-orm";
import { existsSync, readFileSync } from "fs";

import { getDb } from "@/db";
import { products, snapshots, stores, variants } from "@/db/schema";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  buildDemoProducts,
  buildDemoSnapshots,
  buildDemoStore,
  buildDemoVariants,
} from "@/lib/demo-catalog";

function loadEnvFile() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const key = match[1];
      if (!key || process.env[key]) continue;
      process.env[key] = match[2]?.replace(/^"|"$/g, "") ?? "";
    }
  }
}

async function main() {
  loadEnvFile();
  const db = getDb();
  if (!db) {
    console.error("DATABASE_URL is not set. The app will use the in-memory Hearth & Wick catalog instead.");
    process.exit(1);
  }
  const store = buildDemoStore(DEMO_USER_ID);
  const existing = await db.select().from(stores).where(eq(stores.userId, DEMO_USER_ID)).limit(1);
  if (existing[0]) {
    await db.delete(stores).where(eq(stores.id, existing[0].id));
  }
  await db.insert(stores).values({ ...store, createdAt: new Date(store.createdAt) });
  const catalog = buildDemoProducts(store.id);
  await db.insert(products).values(
    catalog.map((product) => ({
      ...product,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
    })),
  );
  await db.insert(snapshots).values(buildDemoSnapshots(store.id, catalog));
  await db.insert(variants).values(
    buildDemoVariants(store.id).map((variant) => ({
      ...variant,
      createdAt: new Date(variant.createdAt),
    })),
  );
  console.log(`Seeded Hearth & Wick with ${catalog.length} products for ${DEMO_USER_ID}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
