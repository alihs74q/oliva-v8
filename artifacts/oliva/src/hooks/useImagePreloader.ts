import { useEffect, useState } from 'react';
import { generateImageManifest, getHighPriorityImages, getLowPriorityImages } from '../utils/generateImageManifest';
import { preloadImages, preloadCategory, isCategoryReady } from '../utils/imagePreloader';

export function useImagePreloader() {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // First, preload high-priority images (homepage hero)
        const highPriority = getHighPriorityImages();
        if (highPriority.length > 0) {
          await preloadImages(highPriority, (loaded, total) => {
            if (isMounted) setProgress(Math.round((loaded / total) * 50));
          });
        }

        if (!isMounted) return;

        // Then preload all remaining images in background
        const lowPriority = getLowPriorityImages();
        if (lowPriority.length > 0) {
          // Don't await, let it load in background
          preloadImages(lowPriority, (loaded, total) => {
            if (isMounted) setProgress(50 + Math.round((loaded / total) * 50));
          }).catch(err => {
            console.warn('[useImagePreloader] Background preload error:', err);
          });
        }

        if (isMounted) {
          setIsReady(true);
          setProgress(100);
        }
      } catch (error) {
        console.error('[useImagePreloader] Init error:', error);
        if (isMounted) {
          setIsReady(true); // Still ready even if preload failed
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isReady, progress };
}

export function useCategoryPreload(category: string) {
  const [isReady, setIsReady] = useState(() => isCategoryReady(category));

  useEffect(() => {
    if (isCategoryReady(category)) {
      setIsReady(true);
      return;
    }

    let isMounted = true;

    const preload = async () => {
      try {
        const manifest = generateImageManifest();
        await preloadCategory(category, manifest);
        if (isMounted) {
          setIsReady(true);
        }
      } catch (err) {
        if (isMounted) {
          setIsReady(true); // Ready anyway
        }
      }
    };

    preload();

    return () => {
      isMounted = false;
    };
  }, [category]);

  return { isReady };
}
