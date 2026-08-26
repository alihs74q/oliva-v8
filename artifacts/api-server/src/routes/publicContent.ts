import { Router, type IRouter } from "express";
import { Readable } from "node:stream";
import { downloadPromotionImage } from "../lib/objectStorageLite.js";
import { contentEvents, type PublishedContentEvent } from "../lib/contentEvents.js";
import { getPublishedRelease } from "../lib/publicContentCache.js";

const router: IRouter = Router();

// GET /public/content — serve the currently published release snapshot
router.get("/public/content", async (req, res): Promise<void> => {
  const current = await getPublishedRelease();

  if (!current) {
    req.log.info("No published content found");
    res.status(404).json({ error: "No published content" });
    return;
  }

  const etag = `"oliva-content-${current.version}"`;
  res.set({
    "Cache-Control": "private, no-cache, must-revalidate",
    ETag: etag,
    "Last-Modified": current.publishedAt.toUTCString(),
    "X-Oliva-Content-Version": String(current.version),
    "Access-Control-Expose-Headers": "ETag, Last-Modified, X-Oliva-Content-Version",
  });
  if (req.get("If-None-Match") === etag) {
    res.status(304).end();
    return;
  }
  res.json(current.snapshot);
});

// GET /public/content/events — notify open public pages as soon as a release changes.
router.get("/public/content/events", (req, res): void => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("event: ready\ndata: {}\n\n");

  const handlePublished = (event: PublishedContentEvent) => {
    res.write(`event: published\ndata: ${JSON.stringify(event)}\n\n`);
  };
  const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), 25_000);

  contentEvents.on("published", handlePublished);
  req.on("close", () => {
    clearInterval(keepAlive);
    contentEvents.off("published", handlePublished);
  });
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
