import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userSessionsTable = pgTable("user_sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});