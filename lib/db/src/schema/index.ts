import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const adminUsersTable = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminSessionsTable = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  adminUserId: uuid("admin_user_id").notNull().references(() => adminUsersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contentDocumentsTable = pgTable("content_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentKey: text("document_key").notNull().unique(),
  draft: jsonb("draft").$type<Record<string, unknown>>().notNull(),
  revision: integer("revision").notNull().default(1),
  updatedBy: uuid("updated_by").references(() => adminUsersTable.id, { onDelete: "set null" }),
  deleted: boolean("deleted").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteReleasesTable = pgTable("site_releases", {
  id: serial("id").primaryKey(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  message: text("message").notNull(),
  createdBy: uuid("created_by").references(() => adminUsersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteStateTable = pgTable("site_state", {
  id: integer("id").primaryKey().default(1),
  activeReleaseId: integer("active_release_id").references(() => siteReleasesTable.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogTable = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  adminUserId: uuid("admin_user_id").references(() => adminUsersTable.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});