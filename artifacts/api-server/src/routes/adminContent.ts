import { Router, type IRouter } from "express";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import type { SQLWrapper } from "drizzle-orm";
import {
  cmsSectionsTable,
  cmsSubcategoriesTable,
  cmsProductsTable,
  cmsSiteSettingsTable,
  cmsReleasesTable,
  cmsAuditLogTable,
} from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { requireAdminAuth } from "../middlewares/adminAuth.js";
import type { AdminSession } from "../middlewares/adminAuth.js";
import {
  SectionUpdate,
  SectionInput,
  SubcategoryInput,
  SubcategoryUpdate,
  ProductInput,
  ProductUpdate,
  ReorderInput,
  PublishInput,
  SettingsUpdate,
  ExchangeRateUpdate,
} from "../lib/validation.js";
import { loadFullContent, computeUsd } from "../lib/cmsHelpers.js";

const router: IRouter = Router();
router.use(requireAdminAuth);

let autoPublishQueue = Promise.resolve();

function callerEmail(req: Parameters<typeof requireAdminAuth>[0]): string {
  return ((req.session as AdminSession).adminEmail) ?? "unknown";
}

function shouldAutoPublish(req: Parameters<typeof requireAdminAuth>[0]): boolean {
  if (req.method === "GET" || req.path.startsWith("/admin/releases")) return false;
  return ["/admin/sections", "/admin/subcategories", "/admin/products", "/admin/settings", "/admin/exchange-rate"]
    .some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`));
}

async function publishCurrentSnapshot(email: string, label: string) {
  const sections = await loadFullContent(false);
  const settingsRows = await db.select().from(cmsSiteSettingsTable);
  const snapshot = {
    sections,
    settings: Object.fromEntries(settingsRows.map((r) => [r.key, r.value])),
    publishedAt: new Date().toISOString(),
  };

  return db.transaction(async (tx) => {
    await tx.update(cmsReleasesTable).set({ isCurrent: false });
    const [release] = await tx.insert(cmsReleasesTable)
      .values({ label, snapshot, publishedBy: email, isCurrent: true })
      .returning();
    await tx.insert(cmsAuditLogTable).values({
      userEmail: email,
      action: "publish",
      entityType: "release",
      entityId: String(release.id),
      details: { label, automatic: true },
    });
    return release;
  });
}

function queueAutomaticPublish(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!shouldAutoPublish(req)) {
    next();
    return;
  }

  res.once("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return;
    autoPublishQueue = autoPublishQueue
      .then(async () => {
        await publishCurrentSnapshot(callerEmail(req), "Automatic live update");
      })
      .catch((error: unknown) => {
        req.log.error({ err: error }, "Automatic content publish failed");
      });
  });
  next();
}

router.use(queueAutomaticPublish);

function expectedRevision(body: unknown): Date | undefined {
  if (!body || typeof body !== "object") return undefined;
  const value = (body as Record<string, unknown>).expectedUpdatedAt;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revisionMatches(
  updatedAt: SQLWrapper,
  revision: Date,
) {
  // PostgreSQL timestamps can retain microseconds, while JavaScript ISO
  // strings only round-trip milliseconds. Compare the serialized millisecond
  // value rather than requiring impossible exact Date equality.
  return sql`date_trunc('milliseconds', ${updatedAt}) = date_trunc('milliseconds', ${revision})`;
}

async function getRate(): Promise<{ ratePerUsd: number; roundingTo: number }> {
  const rows = await db.select().from(cmsSiteSettingsTable);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    ratePerUsd: parseInt(map["exchange_rate_lbp_per_usd"] ?? "89500", 10),
    roundingTo: parseInt(map["exchange_rate_rounding"] ?? "50000", 10),
  };
}

// ─── Sections ─────────────────────────────────────────────────────────────────
router.get("/admin/sections", async (req, res): Promise<void> => {
  const sections = await loadFullContent(true);
  res.json(sections);
});

router.patch("/admin/sections/:sectionSlug", async (req, res): Promise<void> => {
  const sectionSlug = Array.isArray(req.params.sectionSlug) ? req.params.sectionSlug[0] : req.params.sectionSlug;
  const parsed = SectionUpdate.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.subtitle !== undefined) updates.subtitle = parsed.data.subtitle;
  if (parsed.data.hidden !== undefined) updates.hidden = parsed.data.hidden;
  if (parsed.data.theme !== undefined) updates.theme = parsed.data.theme;
  const revision = expectedRevision(req.body);
  const where = revision
    ? and(eq(cmsSectionsTable.slug, sectionSlug), revisionMatches(cmsSectionsTable.updatedAt, revision))
    : eq(cmsSectionsTable.slug, sectionSlug);
  const [updated] = await db.update(cmsSectionsTable).set(updates).where(where).returning();
  if (!updated && revision) { res.status(409).json({ error: "This section changed since you opened it. Reload and try again." }); return; }
  if (!updated) { res.status(404).json({ error: "Section not found" }); return; }
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "update_section", entityType: "section", entityId: updated.slug, details: updates });
  const sections = await loadFullContent(true);
  res.json(sections.find((s) => s.slug === updated.slug));
});

router.post("/admin/sections", async (req, res): Promise<void> => {
  const parsed = SectionInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const existing = await db.select({ sortOrder: cmsSectionsTable.sortOrder }).from(cmsSectionsTable);
  const [created] = await db.insert(cmsSectionsTable).values({
    slug: parsed.data.slug,
    name: parsed.data.name,
    subtitle: parsed.data.subtitle ?? "",
    theme: parsed.data.theme ?? {},
    sortOrder: existing.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1,
  }).returning();
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "create_section", entityType: "section", entityId: created.slug, details: {} });
  res.status(201).json(created);
});

router.delete("/admin/sections/:sectionSlug", async (req, res): Promise<void> => {
  const sectionSlug = Array.isArray(req.params.sectionSlug) ? req.params.sectionSlug[0] : req.params.sectionSlug;
  const [updated] = await db.update(cmsSectionsTable).set({ deleted: true }).where(eq(cmsSectionsTable.slug, sectionSlug)).returning();
  if (!updated) { res.status(404).json({ error: "Section not found" }); return; }
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "delete_section", entityType: "section", entityId: sectionSlug, details: {} });
  res.sendStatus(204);
});

router.post("/admin/sections/:sectionSlug/restore", async (req, res): Promise<void> => {
  const sectionSlug = Array.isArray(req.params.sectionSlug) ? req.params.sectionSlug[0] : req.params.sectionSlug;
  const [updated] = await db.update(cmsSectionsTable).set({ deleted: false }).where(eq(cmsSectionsTable.slug, sectionSlug)).returning();
  if (!updated) { res.status(404).json({ error: "Section not found" }); return; }
  res.json(updated);
});

// ─── Subcategories ────────────────────────────────────────────────────────────
router.post("/admin/sections/:sectionSlug/subcategories", async (req, res): Promise<void> => {
  const sectionSlug = Array.isArray(req.params.sectionSlug) ? req.params.sectionSlug[0] : req.params.sectionSlug;
  const parsed = SubcategoryInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const existing = await db.select({ sortOrder: cmsSubcategoriesTable.sortOrder }).from(cmsSubcategoriesTable).where(eq(cmsSubcategoriesTable.sectionSlug, sectionSlug));
  const maxSort = existing.reduce((m, r) => Math.max(m, r.sortOrder), -1);
  const subId = parsed.data.subcategoryId ?? parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const [sub] = await db.insert(cmsSubcategoriesTable).values({
    sectionSlug, subcategoryId: subId, name: parsed.data.name, description: parsed.data.description ?? "",
    themeColor: parsed.data.themeColor ?? "#333333", accentColor: parsed.data.accentColor ?? "#999999",
    imageUrl: parsed.data.imageUrl ?? null, sortOrder: maxSort + 1,
  }).returning();
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "create_subcategory", entityType: "subcategory", entityId: String(sub.id), details: { name: sub.name } });
  res.status(201).json({ ...sub, imageUrl: sub.imageUrl ?? null, products: [], createdAt: sub.createdAt.toISOString(), updatedAt: sub.updatedAt.toISOString() });
});

router.patch("/admin/subcategories/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = SubcategoryUpdate.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.themeColor !== undefined) updates.themeColor = parsed.data.themeColor;
  if (parsed.data.accentColor !== undefined) updates.accentColor = parsed.data.accentColor;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.hidden !== undefined) updates.hidden = parsed.data.hidden;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;
  const revision = expectedRevision(req.body);
  const where = revision
    ? and(eq(cmsSubcategoriesTable.id, id), revisionMatches(cmsSubcategoriesTable.updatedAt, revision))
    : eq(cmsSubcategoriesTable.id, id);
  const [updated] = await db.update(cmsSubcategoriesTable).set(updates).where(where).returning();
  if (!updated && revision) { res.status(409).json({ error: "This subcategory changed since you opened it. Reload and try again." }); return; }
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "update_subcategory", entityType: "subcategory", entityId: String(id), details: updates });
  const products = await db.select().from(cmsProductsTable).where(eq(cmsProductsTable.subcategoryDbId, id));
  res.json({ ...updated, imageUrl: updated.imageUrl ?? null, products: products.map((p) => ({ ...p, flavors: (p.flavors as string[]) ?? [], imageUrl: p.imageUrl ?? null, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })), createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
});

router.delete("/admin/subcategories/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.update(cmsSubcategoriesTable).set({ deleted: true }).where(eq(cmsSubcategoriesTable.id, id));
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "delete_subcategory", entityType: "subcategory", entityId: String(id), details: {} });
  res.sendStatus(204);
});

router.post("/admin/subcategories/:id/restore", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [updated] = await db.update(cmsSubcategoriesTable).set({ deleted: false }).where(eq(cmsSubcategoriesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  const products = await db.select().from(cmsProductsTable).where(eq(cmsProductsTable.subcategoryDbId, id));
  res.json({ ...updated, imageUrl: updated.imageUrl ?? null, products: products.map((p) => ({ ...p, flavors: (p.flavors as string[]) ?? [], imageUrl: p.imageUrl ?? null, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })), createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
});

// POST /admin/subcategories/:id/duplicate
router.post("/admin/subcategories/:id/duplicate", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [orig] = await db.select().from(cmsSubcategoriesTable).where(eq(cmsSubcategoriesTable.id, id));
  if (!orig) { res.status(404).json({ error: "Not found" }); return; }
  const existing = await db.select({ sortOrder: cmsSubcategoriesTable.sortOrder }).from(cmsSubcategoriesTable).where(eq(cmsSubcategoriesTable.sectionSlug, orig.sectionSlug));
  const maxSort = existing.reduce((m, r) => Math.max(m, r.sortOrder), orig.sortOrder);
  const newSubId = `${orig.subcategoryId}-copy-${Date.now()}`;
  const [copy] = await db.insert(cmsSubcategoriesTable).values({
    sectionSlug: orig.sectionSlug, subcategoryId: newSubId, name: `${orig.name} (Copy)`,
    description: orig.description, themeColor: orig.themeColor, accentColor: orig.accentColor,
    imageUrl: orig.imageUrl, sortOrder: maxSort + 1,
  }).returning();
  // Duplicate all non-deleted products
  const origProducts = await db.select().from(cmsProductsTable).where(eq(cmsProductsTable.subcategoryDbId, id));
  const copyProducts = await Promise.all(
    origProducts.filter((p) => !p.deleted).map((p, i) =>
      db.insert(cmsProductsTable).values({
        subcategoryDbId: copy.id, name: p.name, shortName: p.shortName, description: p.description,
        priceLbp: p.priceLbp, priceUsd: p.priceUsd, imageUrl: p.imageUrl, recipe: p.recipe,
        flavors: p.flavors, extras: p.extras, tags: p.tags, allergens: p.allergens,
        calories: p.calories, extraCalories: p.extraCalories,
        proteinGrams: p.proteinGrams, carbsGrams: p.carbsGrams, fatGrams: p.fatGrams,
        featured: p.featured,
        sortOrder: i,
      }).returning().then(([r]) => r)
    )
  );
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "duplicate_subcategory", entityType: "subcategory", entityId: String(copy.id), details: { originalId: id } });
  res.status(201).json({
    ...copy, imageUrl: copy.imageUrl ?? null,
    products: copyProducts.map((p) => ({ ...p, flavors: (p.flavors as string[]) ?? [], imageUrl: p.imageUrl ?? null, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
    createdAt: copy.createdAt.toISOString(), updatedAt: copy.updatedAt.toISOString(),
  });
});

// ─── Products ─────────────────────────────────────────────────────────────────
router.post("/admin/subcategories/:subcategoryId/products", async (req, res): Promise<void> => {
  const subcategoryId = parseInt(Array.isArray(req.params.subcategoryId) ? req.params.subcategoryId[0] : req.params.subcategoryId, 10);
  const parsed = ProductInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const rate = await getRate();
  const priceUsd = computeUsd(parsed.data.priceLbp, rate.ratePerUsd, rate.roundingTo);
  const existing = await db.select({ sortOrder: cmsProductsTable.sortOrder }).from(cmsProductsTable).where(eq(cmsProductsTable.subcategoryDbId, subcategoryId));
  const maxSort = existing.reduce((m, r) => Math.max(m, r.sortOrder), -1);
  const [product] = await db.insert(cmsProductsTable).values({
    subcategoryDbId: subcategoryId, name: parsed.data.name,
    slug: parsed.data.slug ?? parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    shortName: parsed.data.shortName ?? parsed.data.name.split(" ")[0].toUpperCase(),
    description: parsed.data.description ?? "", priceLbp: parsed.data.priceLbp, priceUsd,
    imageUrl: parsed.data.imageUrl ?? null, galleryUrls: parsed.data.galleryUrls ?? [],
    imageAlt: parsed.data.imageAlt ?? "", imageFocalPoint: parsed.data.imageFocalPoint ?? "center",
    recipe: parsed.data.recipe ?? "", flavors: parsed.data.flavors ?? [],
    extras: parsed.data.extras ?? [], tags: parsed.data.tags ?? [],
     calories: parsed.data.calories ?? 0, extraCalories: parsed.data.extraCalories ?? {},
     proteinGrams: parsed.data.proteinGrams ?? 0,
     carbsGrams: parsed.data.carbsGrams ?? 0,
     fatGrams: parsed.data.fatGrams ?? 0,
    allergens: parsed.data.allergens ?? [], featured: parsed.data.featured ?? false,
    sortOrder: maxSort + 1,
  }).returning();
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "create_product", entityType: "product", entityId: String(product.id), details: { name: product.name } });
  res.status(201).json({ ...product, flavors: (product.flavors as string[]) ?? [], imageUrl: product.imageUrl ?? null, createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString() });
});

router.patch("/admin/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = ProductUpdate.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.slug !== undefined) updates.slug = parsed.data.slug;
  if (parsed.data.shortName !== undefined) updates.shortName = parsed.data.shortName;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.galleryUrls !== undefined) updates.galleryUrls = parsed.data.galleryUrls;
  if (parsed.data.imageAlt !== undefined) updates.imageAlt = parsed.data.imageAlt;
  if (parsed.data.imageFocalPoint !== undefined) updates.imageFocalPoint = parsed.data.imageFocalPoint;
  if (parsed.data.recipe !== undefined) updates.recipe = parsed.data.recipe;
  if (parsed.data.flavors !== undefined) updates.flavors = parsed.data.flavors;
  if (parsed.data.extras !== undefined) updates.extras = parsed.data.extras;
  if (parsed.data.calories !== undefined) updates.calories = parsed.data.calories;
  if (parsed.data.extraCalories !== undefined) updates.extraCalories = parsed.data.extraCalories;
  if (parsed.data.proteinGrams !== undefined) updates.proteinGrams = parsed.data.proteinGrams;
  if (parsed.data.carbsGrams !== undefined) updates.carbsGrams = parsed.data.carbsGrams;
  if (parsed.data.fatGrams !== undefined) updates.fatGrams = parsed.data.fatGrams;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
  if (parsed.data.allergens !== undefined) updates.allergens = parsed.data.allergens;
  if (parsed.data.featured !== undefined) updates.featured = parsed.data.featured;
  if (parsed.data.hidden !== undefined) updates.hidden = parsed.data.hidden;
  if (parsed.data.soldOut !== undefined) updates.soldOut = parsed.data.soldOut;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;
  if (parsed.data.subcategoryDbId !== undefined) updates.subcategoryDbId = parsed.data.subcategoryDbId;
  if (parsed.data.priceLbp !== undefined) {
    updates.priceLbp = parsed.data.priceLbp;
    const rate = await getRate();
    updates.priceUsd = computeUsd(parsed.data.priceLbp, rate.ratePerUsd, rate.roundingTo);
  }
  const revision = expectedRevision(req.body);
  const where = revision
    ? and(eq(cmsProductsTable.id, id), revisionMatches(cmsProductsTable.updatedAt, revision))
    : eq(cmsProductsTable.id, id);
  const [updated] = await db.update(cmsProductsTable).set(updates).where(where).returning();
  if (!updated && revision) { res.status(409).json({ error: "This product changed since you opened it. Reload and try again." }); return; }
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "update_product", entityType: "product", entityId: String(id), details: updates });
  res.json({ ...updated, flavors: (updated.flavors as string[]) ?? [], imageUrl: updated.imageUrl ?? null, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
});

router.post("/admin/products/:id/move", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = ProductUpdate.pick({ subcategoryDbId: true }).safeParse(req.body);
  if (!parsed.success || parsed.data.subcategoryDbId === undefined) {
    res.status(400).json({ error: "A destination subcategory is required" });
    return;
  }
  const destination = await db.select({ id: cmsSubcategoriesTable.id })
    .from(cmsSubcategoriesTable)
    .where(eq(cmsSubcategoriesTable.id, parsed.data.subcategoryDbId));
  if (destination.length === 0) { res.status(404).json({ error: "Destination subcategory not found" }); return; }
  const [updated] = await db.update(cmsProductsTable)
    .set({ subcategoryDbId: parsed.data.subcategoryDbId })
    .where(eq(cmsProductsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Product not found" }); return; }
  await db.insert(cmsAuditLogTable).values({
    userEmail: callerEmail(req), action: "move_product", entityType: "product",
    entityId: String(id), details: { subcategoryDbId: parsed.data.subcategoryDbId },
  });
  res.json(updated);
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.update(cmsProductsTable).set({ deleted: true }).where(eq(cmsProductsTable.id, id));
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "delete_product", entityType: "product", entityId: String(id), details: {} });
  res.sendStatus(204);
});

router.post("/admin/products/:id/restore", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [updated] = await db.update(cmsProductsTable).set({ deleted: false }).where(eq(cmsProductsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, flavors: (updated.flavors as string[]) ?? [], imageUrl: updated.imageUrl ?? null, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
});

router.post("/admin/products/:id/duplicate", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [orig] = await db.select().from(cmsProductsTable).where(eq(cmsProductsTable.id, id));
  if (!orig) { res.status(404).json({ error: "Not found" }); return; }
  const existing = await db.select({ sortOrder: cmsProductsTable.sortOrder }).from(cmsProductsTable).where(eq(cmsProductsTable.subcategoryDbId, orig.subcategoryDbId));
  const maxSort = existing.reduce((m, r) => Math.max(m, r.sortOrder), orig.sortOrder);
  const [copy] = await db.insert(cmsProductsTable).values({
    subcategoryDbId: orig.subcategoryDbId, name: `${orig.name} (Copy)`, shortName: orig.shortName,
    description: orig.description, priceLbp: orig.priceLbp, priceUsd: orig.priceUsd,
    imageUrl: orig.imageUrl, recipe: orig.recipe, flavors: orig.flavors, sortOrder: maxSort + 1,
     calories: orig.calories, extraCalories: orig.extraCalories,
  }).returning();
  await db.insert(cmsAuditLogTable).values({ userEmail: callerEmail(req), action: "duplicate_product", entityType: "product", entityId: String(copy.id), details: { originalId: id } });
  res.status(201).json({ ...copy, flavors: (copy.flavors as string[]) ?? [], imageUrl: copy.imageUrl ?? null, createdAt: copy.createdAt.toISOString(), updatedAt: copy.updatedAt.toISOString() });
});

// ─── Reorder ──────────────────────────────────────────────────────────────────
router.post("/admin/sections/reorder", async (req, res): Promise<void> => {
  const parsed = ReorderInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await Promise.all(parsed.data.ids.map((id: number, idx: number) => db.update(cmsSectionsTable).set({ sortOrder: idx }).where(eq(cmsSectionsTable.id, id))));
  res.sendStatus(204);
});

router.post("/admin/subcategories/reorder", async (req, res): Promise<void> => {
  const parsed = ReorderInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await Promise.all(parsed.data.ids.map((id: number, idx: number) => db.update(cmsSubcategoriesTable).set({ sortOrder: idx }).where(eq(cmsSubcategoriesTable.id, id))));
  res.sendStatus(204);
});

router.post("/admin/products/reorder", async (req, res): Promise<void> => {
  const parsed = ReorderInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await Promise.all(parsed.data.ids.map((id: number, idx: number) => db.update(cmsProductsTable).set({ sortOrder: idx }).where(eq(cmsProductsTable.id, id))));
  res.sendStatus(204);
});

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get("/admin/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(cmsSiteSettingsTable);
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  const parsed = SettingsUpdate.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  for (const [key, value] of Object.entries(parsed.data)) {
    const v = (value as string | undefined) ?? "";
    await db.insert(cmsSiteSettingsTable).values({ key, value: v })
      .onConflictDoUpdate({ target: cmsSiteSettingsTable.key, set: { value: v } });
  }
  const rows = await db.select().from(cmsSiteSettingsTable);
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

// ─── Exchange rate ────────────────────────────────────────────────────────────
router.get("/admin/exchange-rate", async (_req, res): Promise<void> => {
  res.json(await getRate());
});

router.patch("/admin/exchange-rate", async (req, res): Promise<void> => {
  const parsed = ExchangeRateUpdate.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { ratePerUsd, roundingTo } = parsed.data;
  const currentRounding = (await getRate()).roundingTo;
  await db.insert(cmsSiteSettingsTable).values({ key: "exchange_rate_lbp_per_usd", value: String(ratePerUsd) })
    .onConflictDoUpdate({ target: cmsSiteSettingsTable.key, set: { value: String(ratePerUsd) } });
  if (roundingTo !== undefined) {
    await db.insert(cmsSiteSettingsTable).values({ key: "exchange_rate_rounding", value: String(roundingTo) })
      .onConflictDoUpdate({ target: cmsSiteSettingsTable.key, set: { value: String(roundingTo) } });
  }
  const effectiveRounding = roundingTo ?? currentRounding;
  const allProducts = await db.select().from(cmsProductsTable);
  await Promise.all(allProducts.map((p) => db.update(cmsProductsTable).set({ priceUsd: computeUsd(p.priceLbp, ratePerUsd, effectiveRounding) }).where(eq(cmsProductsTable.id, p.id))));
  res.json({ ratePerUsd, roundingTo: effectiveRounding });
});

// ─── Releases ─────────────────────────────────────────────────────────────────
router.get("/admin/releases", async (_req, res): Promise<void> => {
  const releases = await db.select({
    id: cmsReleasesTable.id, version: cmsReleasesTable.version, label: cmsReleasesTable.label,
    publishedBy: cmsReleasesTable.publishedBy, isCurrent: cmsReleasesTable.isCurrent, publishedAt: cmsReleasesTable.publishedAt,
  }).from(cmsReleasesTable).orderBy(sql`${cmsReleasesTable.publishedAt} DESC`);
  res.json(releases.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() })));
});

router.post("/admin/releases", async (req, res): Promise<void> => {
  const parsed = PublishInput.safeParse(req.body);
  const label = parsed.success ? (parsed.data.label ?? "") : "";
  const email = callerEmail(req);
  const release = await publishCurrentSnapshot(email, label);

  res.status(201).json({ ...release, publishedAt: release.publishedAt.toISOString() });
});

router.post("/admin/releases/:id/rollback", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const email = callerEmail(req);

  // Atomic: verify target exists, then swap isCurrent in one transaction
  const updated = await db.transaction(async (tx) => {
    const [target] = await tx.select().from(cmsReleasesTable).where(eq(cmsReleasesTable.id, id));
    if (!target) return null;
    await tx.update(cmsReleasesTable).set({ isCurrent: false });
    const [u] = await tx.update(cmsReleasesTable).set({ isCurrent: true }).where(eq(cmsReleasesTable.id, id)).returning();
    await tx.insert(cmsAuditLogTable).values({ userEmail: email, action: "rollback", entityType: "release", entityId: String(id), details: {} });
    return u;
  });

  if (!updated) { res.status(404).json({ error: "Release not found" }); return; }
  res.json({ ...updated, publishedAt: updated.publishedAt.toISOString() });
});

router.get("/admin/media", async (_req, res): Promise<void> => {
  res.json([]);
});

export default router;
