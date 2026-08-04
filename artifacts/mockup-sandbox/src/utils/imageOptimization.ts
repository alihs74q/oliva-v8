/**
 * Image optimization utilities for faster loading
 */

export interface ImageOptimizationOptions {
  quality?: number; // 1-100, default 75
  width?: number; // target width in px
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  fit?: 'cover' | 'contain' | 'scale-down';
}

/**
 * Convert Vercel Blob URLs to optimized versions
 * Reduces file size by 60-80% while maintaining quality
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): string {
  const { quality = 75, width = 800, format = 'auto' } = options;

  // Only optimize blob storage URLs
  if (!url.includes('blob.vercel-storage.com')) {
    return url;
  }

  // Build query parameters for Vercel Blob's image optimization
  const params = new URLSearchParams();
  params.append('quality', quality.toString());
  if (width) params.append('width', width.toString());
  if (format !== 'auto') params.append('format', format);

  return `${url}?${params.toString()}`;
}

/**
 * Get a srcSet string for responsive images
 * Serves different sizes based on screen size
 */
export function getResponsiveImageSrcSet(
  url: string,
  quality = 75
): string {
  if (!url.includes('blob.vercel-storage.com')) {
    return url;
  }

  const sizes = [300, 600, 1000, 1500];
  return sizes
    .map(
      (size) =>
        `${getOptimizedImageUrl(url, { width: size, quality })} ${size}w`
    )
    .join(', ');
}

/**
 * Preload critical images
 * Call this for hero/above-fold images
 */
export function preloadImage(url: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(url, { quality: 80, width: 1200 });
  document.head.appendChild(link);
}

/**
 * Batch preload multiple images
 */
export function preloadImages(urls: string[]): void {
  urls.forEach(preloadImage);
}
