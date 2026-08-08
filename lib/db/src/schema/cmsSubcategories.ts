import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cmsSubcategoriesTable = pgTable("cms_subcategories", {
  id: serial("id").primaryKey(),
  sectionSlug: text("section_slug").notNull(),
  subcategoryId: text("subcategory_id").notNull(), // e.g. 'smoothies', 'milk-shake'
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  themeColor: text("theme_color").notNull().default("#333333"),
  accentColor: text("accent_color").notNull().default("#999999"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  hidden: boolean("hidden").notNull().default(false),
  deleted: boolean("deleted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCmsSubcategorySchema = createInsertSchema(cmsSubcategoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCmsSubcategory = z.infer<typeof insertCmsSubcategorySchema>;
export type CmsSubcategory = typeof cmsSubcategoriesTable.$inferSelect;
