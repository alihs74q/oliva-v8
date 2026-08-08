import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAdminAuth } from "../middlewares/adminAuth.js";
import { uploadPromotionImage } from "../lib/objectStorageLite.js";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post(
  "/admin/media/upload",
  requireAdminAuth,
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const contentType = detectImageType(req.file.buffer);
    if (!contentType) {
      res.status(400).json({ error: "Only valid JPEG, PNG, GIF, or WebP images are allowed" });
      return;
    }
    try {
      const objectId = await uploadPromotionImage(req.file.buffer, contentType);
      const url = `/api/public/media/${objectId}`;
      res.status(201).json({
        id: objectId,
        url,
        altText: (req.body.altText as string) ?? "",
        filename: objectId,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      req.log.error({ err: error }, "Promotion image upload failed");
      res.status(502).json({ error: "Image storage is temporarily unavailable" });
    }
  },
);

function detectImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (buffer.length >= 6 && (buffer.subarray(0, 6).toString() === "GIF87a" || buffer.subarray(0, 6).toString() === "GIF89a")) return "image/gif";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}

export default router;
