/**
 * Centralized image asset imports with Vite hashing
 * When an image file changes, Vite automatically generates a new hash in the filename
 * This ensures browsers download the new version instead of using stale cache
 */

// Import logo with Vite hashing
import olivaLogoUrl from '../../public/oliva-logo.png?url';

// Export hashed URLs - these change automatically when the source image changes
export const imageAssets = {
  logo: olivaLogoUrl,
} as const;

/**
 * Generate a manifest of hashed URLs for preloading
 * This is used by the Service Worker to know which URLs to cache
 */
export function getImageManifest() {
  return {
    local: [
      { url: imageAssets.logo, name: 'oliva-logo', category: 'logo' },
    ],
    remote: [] as any[], // Will be populated from product data
  };
}

/**
 * Get the current app version based on when assets were last built
 * This is used to clean up old caches when deploying
 */
export function getAppVersion(): string {
  // This will be replaced with actual build timestamp during build
  return 'v5';
}
