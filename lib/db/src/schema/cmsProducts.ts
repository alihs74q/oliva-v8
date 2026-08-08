import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cmsProductsTable = pgTable("cms_products", {
  id: serial("id").primaryKey(),
  subcategoryDbId: integer("subcategory_db_id").notNull(), // FK to cms_subcategories.id
  name: text("name").notNull(),
  slug: text("slug").notNull().default(""),
  shortName: text("short_name").notNull().default(""),
  description: text("description").notNull().default(""),
  priceLbp: integer("price_lbp").notNull().default(0), // stored in LBP (e.g. 300000)
  priceUsd: text("price_usd").notNull().default(""), // calculated display string e.g. "$3.50"
  imageUrl: text("image_url"),
  galleryUrls: jsonb("gallery_urls").notNull().default([]),
  imageAlt: text("image_alt").notNull().default(""),
  imageFocalPoint: text("image_focal_point").notNull().default("center"),
  recipe: text("recipe").notNull().default(""), // bullet-separated with " · "
  flavors: jsonb("flavors").notNull().default([]), // string[]
  extras: jsonb("extras").notNull().default([]),
  calories: integer("calories").notNull().default(0),
  extraCalories: jsonb("extra_calories").notNull().default({}), // Record<string, number>
  tags: jsonb("tags").notNull().default([]),
  allergens: jsonb("allergens").notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  hidden: boolean("hidden").notNull().default(false),
  soldOut: boolean("sold_out").notNull().default(false),
  deleted: boolean("deleted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCmsProductSchema = createInsertSchema(cmsProductsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCmsProduct = z.infer<typeof insertCmsProductSchema>;
export type CmsProduct = typeof cmsProductsTable.$inferSelect;
