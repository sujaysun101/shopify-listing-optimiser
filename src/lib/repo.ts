import "server-only";

import { getDb } from "@/db";
import { createDrizzleRepo } from "@/lib/drizzle-store";
import { memoryRepo } from "@/lib/memory-store";
import type { Repo } from "@/lib/types";

export function getRepo(): Repo {
  const db = getDb();
  if (!db) return memoryRepo;
  return createDrizzleRepo(db);
}
