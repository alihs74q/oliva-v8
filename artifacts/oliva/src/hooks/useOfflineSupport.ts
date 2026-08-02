import { useEffect, useState } from 'react';

interface OfflineSupportStatus {
  isOnline: boolean;
  cacheReady: boolean;
  imagesDownloaded: number;
}

/**
 * Registers our custom sw.js and tracks offline / cache status.
 * Uses the native ServiceWorker API directly — no Workbox dependency needed
 * because our sw.js is hand-written and handles everything itself.
 */
export const useOfflineSupport = () => {
  const [status, setStatus] = useState<OfflineSupportStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    cacheReady: false,
    imagesDownloaded: 0,
  });

  useEffect(() => {
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          // updateViaCache: 'none' forces the browser to always re-fetch
          // sw.js from the network so it never serves a stale SW file.
          updateViaCache: 'none',
        });

        // Mark cache as ready once the SW is active
        const markReady = async () => {
          setStatus((prev) => ({ ...prev, cacheReady: true }));

          // Count cached images
          if ('caches' in window) {
            try {
              const keys = await caches.keys();
              let total = 0;
              for (const key of keys) {
                if (key.startsWith('oliva-images')) {
                  const cache = await caches.open(key);
                  total += (await cache.keys()).length;
                }
              }
              setStatus((prev) => ({ ...prev, imagesDownloaded: total }));
            } catch (_) {}
          }
        };

        if (reg.active) {
          markReady();
        } else {
          // Wait for the SW to become active for the first time
          const worker = reg.installing ?? reg.waiting;
          worker?.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') markReady();
          });
        }

        // Listen for future updates (new deploy available)
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New version installed — the SW's skipWaiting() will activate it
              // on the next navigation automatically (registerType: 'autoUpdate').
            }
          });
        });

        // Check for updates immediately and every 60 s while the tab is open
        reg.update();
        const interval = setInterval(() => reg.update(), 60_000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return undefined;
      }
    };

    const handleOnline  = () => setStatus((p) => ({ ...p, isOnline: true }));
    const handleOffline = () => setStatus((p) => ({ ...p, isOnline: false }));

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    registerServiceWorker();

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
};
