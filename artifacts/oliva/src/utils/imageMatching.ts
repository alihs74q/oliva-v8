/**
 * Image Matching System
 * Automatically matches product names to image files using normalized filename comparison
 */

// Normalize a string for matching: lowercase, remove special chars, handle "and" ≈ "&"
function normalizeForMatching(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and") // Convert & to and for matching
    .replace(/[^\w\s]/g, "") // Remove special characters except spaces and word chars
    .replace(/\s+/g, "") // Remove spaces
    .trim();
}

// Build a map of available images from the public folder
let imageManifest: Record<string, string> | null = null;
const FALLBACK_PRODUCT_IMAGE = "/oliva-logo.png";

function buildImageManifest(): Record<string, string> {
  if (imageManifest) return imageManifest;

  const manifest: Record<string, string> = {};

  // Import all images from public folder
  const imageGlob = import.meta.glob("../../public/**/*.{jpg,jpeg,png,webp,avif}", {
    eager: true,
  });

  for (const path in imageGlob) {
    if (
      path.includes("/public/images/products-optimized/") ||
      path.includes("/public/images/products-lqip/") ||
      path.includes("/public/menu-optimized/") ||
      path.includes("/public/menu-lqip/")
    ) {
      continue;
    }
    // Extract filename without extension
    const filename = path.split("/").pop() || "";
    const normalized = normalizeForMatching(filename.split(".")[0]);

    if (normalized) {
      // Build the public path (removes the "../../public" prefix)
      const publicPath = "/" + path.split("public/")[1];
      manifest[normalized] = publicPath;
    }
  }

  imageManifest = manifest;
  return manifest;
}

/**
 * Get the image path for a product by matching its name to available images
 * @param productName - The name of the product
 * @param currentImage - The current image (fallback if matching fails)
 * @returns The matched image path or the current image
 */
export function getImageForProduct(
  productName: string,
  currentImage?: string
): string | undefined {
  if (!productName) return currentImage;

  const manifest = buildImageManifest();
  const normalized = normalizeForMatching(productName);

  if (normalized && manifest[normalized]) {
    return manifest[normalized];
  }

  // Every menu card needs a stable visual even when a product does not have a
  // dedicated source image yet (for example, water and court bookings).
  return currentImage ?? FALLBACK_PRODUCT_IMAGE;
}

/**
 * Get all available images in the manifest
 */
export function getAllImages(): Record<string, string> {
  return buildImageManifest();
}
