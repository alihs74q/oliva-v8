import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  // NULL means the account holder has not yet set their password.
  // The set-initial-password endpoint is the only way to set it when NULL,
  // and only when a valid single-use setupToken is provided.
  passwordHash: text("password_hash"),
  // Single-use token generated at account creation. Must be provided with
  // set-initial-password. Cleared after first use. Never exposed via API.
  // The server operator delivers this to the admin out-of-band.
  setupToken: text("setup_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAdminUserSchema = createInsertSchema(adminUsersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsersTable.$inferSelect;
