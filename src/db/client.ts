import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";

import * as schema from "@/db/schema";

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

export const getOptionalDb = cache(() => {
  try {
    const { env } = getCloudflareContext();
    const cloudflareEnv = env as Cloudflare.Env;
    if (!cloudflareEnv.DB) return null;

    return drizzle(cloudflareEnv.DB, { schema });
  } catch {
    return null;
  }
});

export const getDb = cache(() => {
  const db = getOptionalDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }

  return db;
});
