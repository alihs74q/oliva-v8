import crypto from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@workspace/db";
import { adminSessionsTable, adminUsersTable } from "@workspace/db";

const SESSION_COOKIE = "oliva_admin_session";
const SESSION_DAYS = 7;

export function configuredAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return [...new Set(raw.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean))];
}

export function adminConfigIsValid(): boolean {
  return configuredAdminEmails().length === 3;
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}

export async function createAdminSession(adminUserId: string) {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(adminSessionsTable).values({ id, adminUserId, expiresAt });
  return { id, expiresAt };
}

export async function getAdminFromSession(sessionId?: string) {
  if (!sessionId) return null;
  const rows = await db
    .select({ id: adminUsersTable.id, email: adminUsersTable.email, active: adminUsersTable.active })
    .from(adminSessionsTable)
    .innerJoin(adminUsersTable, eq(adminSessionsTable.adminUserId, adminUsersTable.id))
    .where(and(eq(adminSessionsTable.id, sessionId), gt(adminSessionsTable.expiresAt, new Date()), eq(adminUsersTable.active, true)))
    .limit(1);
  const admin = rows[0];
  if (!admin || !configuredAdminEmails().includes(admin.email.toLowerCase())) return null;
  return admin;
}

export async function removeAdminSession(sessionId?: string) {
  if (sessionId) await db.delete(adminSessionsTable).where(eq(adminSessionsTable.id, sessionId));
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key)),
  );
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key)),
  );
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}