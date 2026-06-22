import { drizzle } from "drizzle-orm/better-sqlite3";

import * as authSchema from "./auth-schema.ts";
import * as schema from "./schema.ts";

const databaseUrl = process.env.DATABASE_URL ?? "file:./db.sqlite";
const databasePath = databaseUrl.startsWith("file:")
  ? databaseUrl.slice("file:".length)
  : databaseUrl;

export const db = drizzle(databasePath, {
  schema: { ...schema, ...authSchema },
});
