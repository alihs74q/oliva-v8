/**
 * Image Matching System
 * Automatically matches product names to image files using normalized filename comparison
 */

// Normalize a string for matching: lowercase, remove special chars, handle "and" ≈ "&"
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and") // Convert & to and for matching
    .replace(/[^\w\s]/g, "") // Remove special characters except spaces and word chars
    .replace(/\s+/g, "") // Remove spaces
    .trim();
}

// Build a map of available images from the public folder
let imageManifest: Record<string, string> | null = null;

function buildImageManifest(): Record<string, string> {
  if (imageManifest) return imageManifest;

  const manifest: Record<string, string> = {};

  // Import all images from public folder
  const imageGlob = import.meta.glob("../../public/**/*.{jpg,jpeg,png,webp,avif}", {
    eager: true,
  });

  for (const path in imageGlob) {
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

  // Dev warning only if product has no image
  if (!currentImage && process.env.NODE_ENV === "development") {
    console.warn(`[v0] No image found for product: "${productName}"`);
  }

  return currentImage;
}

/**
 * Get all available images in the manifest
 */
export function getAllImages(): Record<string, string> {
  return buildImageManifest();
}
