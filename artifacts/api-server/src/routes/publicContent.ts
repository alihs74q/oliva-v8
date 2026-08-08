import { Router, type IRouter } from "express";
import { Readable } from "node:stream";
import { db } from "@workspace/db";
import { cmsReleasesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { downloadPromotionImage } from "../lib/objectStorageLite.js";

const router: IRouter = Router();

// GET /public/content — serve the currently published release snapshot
router.get("/public/content", async (req, res): Promise<void> => {
  const [current] = await db
    .select()
    .from(cmsReleasesTable)
    .where(eq(cmsReleasesTable.isCurrent, true))
    .orderBy(sql`${cmsReleasesTable.publishedAt} DESC`)
    .limit(1);

  if (!current) {
    req.log.info("No published content found");
    res.status(404).json({ error: "No published content" });
    return;
  }

  res.set("Cache-Control", "public, max-age=30");
  res.json(current.snapshot);
});

// GET /public/media/:filename — serve durable promotion/product images publicly.
router.get("/public/media/:filename", async (req, res): Promise<void> => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  if (!/^[a-zA-Z0-9_-]{16,80}$/.test(filename)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  try {
    const response = await downloadPromotionImage(filename);
    if (!response.ok || !response.body) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.set("Content-Type", response.headers.get("content-type") ?? "application/octet-stream");
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
  } catch (error) {
    req.log.error({ err: error }, "Promotion image download failed");
    res.status(502).json({ error: "Image storage is temporarily unavailable" });
  }
});

export default router;
