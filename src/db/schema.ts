import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "./auth-schema.ts";

export const predictions = sqliteTable(
  "predictions",
  {
    awayScore: integer("away_score").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`,
    ),
    homeScore: integer("home_score").notNull(),
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    matchId: integer("match_id").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
      () => new Date(),
    ),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("user_match_idx").on(table.userId, table.matchId)],
);

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(user, {
    fields: [predictions.userId],
    references: [user.id],
  }),
}));
