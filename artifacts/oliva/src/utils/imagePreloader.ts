/** Image preloader with concurrent loading, caching, and retry logic */

import type { ImageAsset } from './generateImageManifest';

interface PreloadState {
  loaded: Set<string>;
  failed: Set<string>;
  loading: Set<string>;
  categoryReady: Map<string, boolean>;
}

const CACHE_VERSION = 'oliva-img-cache-v1';
const MAX_CONCURRENT = 6;
const RETRY_ATTEMPTS = 2;

let preloadState: PreloadState = {
  loaded: new Set(),
  failed: new Set(),
  loading: new Set(),
  categoryReady: new Map(),
};

/**
 * Decode image in browser by rendering to canvas
 */
async function decodeImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Verify image is actually decoded
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        resolve();
      } catch (e) {
        resolve(); // Still resolve, image is loaded
      }
    };
    
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    
    img.src = url;
  });
}

/**
 * Load and cache a single image with retry
 */
async function loadImageWithRetry(url: string, retries: number = RETRY_ATTEMPTS): Promise<boolean> {
  try {
    // Check if already loaded
    if (preloadState.loaded.has(url)) {
      return true;
    }
    
    // Check cache first
    const cached = await getCachedImage(url);
    if (cached) {
      preloadState.loaded.add(url);
      return true;
    }
    
    // Load image
    await decodeImage(url);
    
    // Cache it
    await cacheImage(url);
    
    preloadState.loaded.add(url);
    return true;
  } catch (error) {
    if (retries > 0) {
      // Retry after small delay
      await new Promise(r => setTimeout(r, 500));
      return loadImageWithRetry(url, retries - 1);
    }
    preloadState.failed.add(url);
    console.warn(`[ImagePreloader] Failed to load ${url} after retries`);
    return false;
  }
}

/**
 * Load multiple images concurrently
 */
async function loadImagesConcurrently(images: string[]): Promise<void> {
  const queue = [...images];
  const active: Promise<any>[] = [];

  return new Promise(resolve => {
    const processNext = async () => {
      if (queue.length === 0 && active.length === 0) {
        resolve();
        return;
      }

      while (active.length < MAX_CONCURRENT && queue.length > 0) {
        const url = queue.shift();
        if (url && !preloadState.loading.has(url)) {
          preloadState.loading.add(url);
          const promise = loadImageWithRetry(url)
            .then(success => {
              preloadState.loading.delete(url);
              processNext();
            })
            .catch(err => {
              preloadState.loading.delete(url);
              processNext();
            });
          active.push(promise);
        }
      }

      if (active.length > 0) {
        await Promise.race(active);
        active.splice(0, active.findIndex(p => p.then) + 1);
      }
    };

    processNext();
  });
}

/**
 * Cache image in IndexedDB
 */
async function cacheImage(url: string): Promise<void> {
  if (!('indexedDB' in window)) return;

  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(CACHE_VERSION, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'url' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('images', 'readwrite');
      const store = tx.objectStore('images');
      store.put({ url, blob, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
  } catch (err) {
    // Cache failed, continue anyway
  }
}

/**
 * Get cached image
 */
async function getCachedImage(url: string): Promise<boolean> {
  if (!('indexedDB' in window)) return false;

  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(CACHE_VERSION, 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const found = await new Promise<boolean>((resolve) => {
      const tx = db.transaction('images', 'readonly');
      const store = tx.objectStore('images');
      const req = store.get(url);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });

    db.close();
    return found;
  } catch (err) {
    return false;
  }
}

/**
 * Start preloading images with concurrent requests
 */
export async function preloadImages(images: ImageAsset[], onProgress?: (loaded: number, total: number) => void): Promise<void> {
  const urls = images.map(img => img.url);
  
  const reportProgress = () => {
    if (onProgress) {
      const loaded = preloadState.loaded.size;
      onProgress(loaded, urls.length);
    }
  };

  // Initial report
  reportProgress();

  // Load all images with max 6 concurrent
  await loadImagesConcurrently(urls);

  // Final report
  reportProgress();
}

/**
 * Preload category images and mark as ready
 */
export async function preloadCategory(category: string, images: ImageAsset[]): Promise<void> {
  const categoryImages = images.filter(img => img.category === category);
  await loadImagesConcurrently(categoryImages.map(img => img.url));
  preloadState.categoryReady.set(category, true);
}

/**
 * Check if category images are preloaded
 */
export function isCategoryReady(category: string): boolean {
  return preloadState.categoryReady.get(category) ?? false;
}

/**
 * Get preload progress
 */
export function getPreloadProgress(): { loaded: number; failed: number; total: number } {
  return {
    loaded: preloadState.loaded.size,
    failed: preloadState.failed.size,
    total: preloadState.loaded.size + preloadState.failed.size,
  };
}

/**
 * Reset preload state
 */
export function resetPreloadState(): void {
  preloadState = {
    loaded: new Set(),
    failed: new Set(),
    loading: new Set(),
    categoryReady: new Map(),
  };
}
