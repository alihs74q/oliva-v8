import { pgTable, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cmsReleasesTable = pgTable("cms_releases", {
  id: serial("id").primaryKey(),
  version: serial("version"),
  label: text("label").notNull().default(""),
  // Full snapshot of all CMS content at time of publish
  snapshot: jsonb("snapshot").notNull().default({}),
  publishedBy: text("published_by").notNull(),
  isCurrent: boolean("is_current").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCmsReleaseSchema = createInsertSchema(cmsReleasesTable).omit({ id: true, publishedAt: true });
export type InsertCmsRelease = z.infer<typeof insertCmsReleaseSchema>;
export type CmsRelease = typeof cmsReleasesTable.$inferSelect;
