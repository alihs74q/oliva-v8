import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cmsSiteSettingsTable = pgTable("cms_site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCmsSiteSettingSchema = createInsertSchema(cmsSiteSettingsTable).omit({ id: true, updatedAt: true });
export type InsertCmsSiteSetting = z.infer<typeof insertCmsSiteSettingSchema>;
export type CmsSiteSetting = typeof cmsSiteSettingsTable.$inferSelect;
