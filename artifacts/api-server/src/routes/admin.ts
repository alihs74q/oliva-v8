import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { adminUsersTable, auditLogTable, contentDocumentsTable, siteReleasesTable, siteStateTable } from "@workspace/db";
import { createAdminSession, configuredAdminEmails, getAdminFromSession, hashPassword, removeAdminSession, sessionCookieName, verifyPassword } from "../lib/admin";

const router: IRouter = Router();
const isProduction = process.env.NODE_ENV === "production";
const secureCookie = isProduction;

async function requireAdmin(req: Request, res: Response) {
  const admin = await getAdminFromSession(req.cookies?.[sessionCookieName()]);
  if (!admin) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return admin;
}

router.post("/admin/auth/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!email || !password || !configuredAdminEmails().includes(email)) return res.status(401).json({ error: "Unable to sign in with those details" });
  const users = await db.select().from(adminUsersTable).where(and(eq(adminUsersTable.email, email), eq(adminUsersTable.active, true))).limit(1);
  const user = users[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ error: "Unable to sign in with those details" });
  const session = await createAdminSession(user.id);
  res.cookie(sessionCookieName(), session.id, { httpOnly: true, secure: secureCookie, sameSite: "lax", expires: session.expiresAt, path: "/" });
  return res.json({ admin: { email: user.email } });
});

router.post("/admin/auth/logout", async (req, res) => {
  await removeAdminSession(req.cookies?.[sessionCookieName()]);
  res.clearCookie(sessionCookieName(), { httpOnly: true, secure: secureCookie, sameSite: "lax", path: "/" });
  return res.status(204).send();
});

router.get("/admin/auth/me", async (req, res) => {
  const admin = await getAdminFromSession(req.cookies?.[sessionCookieName()]);
  return admin ? res.json({ admin: { email: admin.email } }) : res.status(401).json({ error: "Authentication required" });
});

router.get("/admin/config", (_req, res) => res.json({ configured: configuredAdminEmails().length === 3 }));

router.get("/content/active", async (_req, res) => {
  const state = (await db.select().from(siteStateTable).where(eq(siteStateTable.id, 1)).limit(1))[0];
  if (!state?.activeReleaseId) return res.status(404).json({ error: "No published content" });
  const release = (await db.select({ id: siteReleasesTable.id, snapshot: siteReleasesTable.snapshot, createdAt: siteReleasesTable.createdAt }).from(siteReleasesTable).where(eq(siteReleasesTable.id, state.activeReleaseId)).limit(1))[0];
  return release ? res.json({ release }) : res.status(404).json({ error: "No published content" });
});

router.get("/admin/content", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const docs = await db.select().from(contentDocumentsTable).where(eq(contentDocumentsTable.deleted, false)).orderBy(contentDocumentsTable.documentKey);
  const releases = await db.select({ id: siteReleasesTable.id, message: siteReleasesTable.message, createdAt: siteReleasesTable.createdAt }).from(siteReleasesTable).orderBy(desc(siteReleasesTable.id)).limit(20);
  return res.json({ documents: docs, releases });
});

router.put("/admin/content/:key", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const key = req.params.key;
  if (!/^[a-z0-9:_-]{1,80}$/.test(key) || !req.body || typeof req.body !== "object") return res.status(400).json({ error: "Invalid content document" });
  const current = (await db.select().from(contentDocumentsTable).where(eq(contentDocumentsTable.documentKey, key)).limit(1))[0];
  const expectedRevision = Number(req.body.expectedRevision ?? current?.revision ?? 1);
  if (current && current.revision !== expectedRevision) return res.status(409).json({ error: "This document changed. Reload it before saving.", document: current });
  const draft = req.body.draft;
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return res.status(400).json({ error: "Draft must be an object" });
  const updated = current
    ? (await db.update(contentDocumentsTable).set({ draft, revision: current.revision + 1, updatedBy: admin.id, updatedAt: new Date() }).where(and(eq(contentDocumentsTable.documentKey, key), eq(contentDocumentsTable.revision, expectedRevision))).returning())[0]
    : (await db.insert(contentDocumentsTable).values({ documentKey: key, draft, revision: 1, updatedBy: admin.id }).returning())[0];
  if (!updated) return res.status(409).json({ error: "This document changed. Reload it before saving." });
  await db.insert(auditLogTable).values({ adminUserId: admin.id, action: "update", entity: key, details: {} });
  return res.json({ document: updated });
});

router.post("/admin/publish", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const docs = await db.select().from(contentDocumentsTable).where(eq(contentDocumentsTable.deleted, false));
  if (!docs.length) return res.status(400).json({ error: "Add content before publishing" });
  const message = typeof req.body?.message === "string" && req.body.message.trim() ? req.body.message.trim().slice(0, 200) : "Published content update";
  const release = await db.transaction(async (tx) => {
    const created = (await tx.insert(siteReleasesTable).values({ snapshot: Object.fromEntries(docs.map((doc) => [doc.documentKey, doc.draft as Record<string, unknown>])), message, createdBy: admin.id }).returning())[0];
    await tx.insert(siteStateTable).values({ id: 1, activeReleaseId: created.id, updatedAt: new Date() }).onConflictDoUpdate({ target: siteStateTable.id, set: { activeReleaseId: created.id, updatedAt: new Date() } });
    return created;
  });
  await db.insert(auditLogTable).values({ adminUserId: admin.id, action: "publish", entity: "site", details: { releaseId: release.id } });
  return res.json({ release });
});

router.post("/admin/rollback/:id", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid release" });
  const previous = (await db.select().from(siteReleasesTable).where(eq(siteReleasesTable.id, id)).limit(1))[0];
  if (!previous) return res.status(404).json({ error: "Release not found" });
  const release = await db.transaction(async (tx) => {
    const created = (await tx.insert(siteReleasesTable).values({ snapshot: previous.snapshot, message: `Rollback of release ${id}`, createdBy: admin.id }).returning())[0];
    await tx.insert(siteStateTable).values({ id: 1, activeReleaseId: created.id, updatedAt: new Date() }).onConflictDoUpdate({ target: siteStateTable.id, set: { activeReleaseId: created.id, updatedAt: new Date() } });
    return created;
  });
  return res.json({ release });
});

export default router;