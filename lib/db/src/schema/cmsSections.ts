import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cmsSectionsTable = pgTable("cms_sections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  hidden: boolean("hidden").notNull().default(false),
  deleted: boolean("deleted").notNull().default(false),
  // Theme data stored as JSON
  theme: jsonb("theme").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCmsSectionSchema = createInsertSchema(cmsSectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCmsSection = z.infer<typeof insertCmsSectionSchema>;
export type CmsSection = typeof cmsSectionsTable.$inferSelect;
