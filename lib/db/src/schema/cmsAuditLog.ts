import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const cmsAuditLogTable = pgTable("cms_audit_log", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  action: text("action").notNull(), // e.g. 'create_product', 'publish', 'change_password'
  entityType: text("entity_type").notNull().default(""),
  entityId: text("entity_id").notNull().default(""),
  details: jsonb("details").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CmsAuditLog = typeof cmsAuditLogTable.$inferSelect;
