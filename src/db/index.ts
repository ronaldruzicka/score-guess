import { drizzle } from "drizzle-orm/better-sqlite3";

import * as authSchema from "./auth-schema.ts";
import * as schema from "./schema.ts";

export const db = drizzle(process.env.DATABASE_URL ?? "file:./db.sqlite", {
  schema: { ...schema, ...authSchema },
});
