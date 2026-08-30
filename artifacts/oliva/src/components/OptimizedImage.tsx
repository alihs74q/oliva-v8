import React, { useEffect, useRef, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  priority?: boolean;
  /** Explicit tiny preview for local assets that do not have a generated variant. */
  lowSrc?: string;
}

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

type PendingImage = {
  src: string;
  priority: boolean;
  resolve: (loaded: boolean) => void;
};

const fullImageQueue: PendingImage[] = [];
let activeFullImages = 0;
const fullImagePromises = new Map<string, Promise<boolean>>();
const TINY_PREVIEW =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"%3E%3Crect width="36" height="36" fill="%23dce7d8"/%3E%3Ccircle cx="8" cy="6" r="18" fill="%23a9bd8b" opacity=".42"/%3E%3Ccircle cx="32" cy="31" r="18" fill="%23596b3d" opacity=".24"/%3E%3C/svg%3E';

function getConnection(): NetworkInformationLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

function isSlowConnection(): boolean {
  const connection = getConnection();
  return Boolean(
    connection?.saveData ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g',
  );
}

function getFullImageConcurrency(): number {
  return isSlowConnection() ? 1 : 2;
}

function drainFullImageQueue(): void {
  while (activeFullImages < getFullImageConcurrency() && fullImageQueue.length > 0) {
    const next = fullImageQueue.shift();
    if (!next) return;

    activeFullImages += 1;
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = next.priority ? 'high' : 'low';
    image.onload = () => {
      activeFullImages -= 1;
      next.resolve(true);
      drainFullImageQueue();
    };
    image.onerror = () => {
      activeFullImages -= 1;
      next.resolve(false);
      drainFullImageQueue();
    };
    image.src = next.src;
  }
}

function loadFullImage(src: string, priority: boolean): Promise<boolean> {
  const existing = fullImagePromises.get(src);
  if (existing) return existing;

  const promise = new Promise<boolean>((resolve) => {
    const pending = { src, priority, resolve };
    if (priority) fullImageQueue.unshift(pending);
    else fullImageQueue.push(pending);
    drainFullImageQueue();
  });
  fullImagePromises.set(src, promise);
  return promise;
}

function addQueryParams(src: string, params: Record<string, string>): string {
  try {
    const url = new URL(src, window.location.href);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  } catch {
    return src;
  }
}

function getPublicVariant(src: string, folder: 'menu-optimized' | 'menu-lqip'): string | null {
  try {
    const pathname = new URL(src, window.location.href).pathname;
    const decodedPath = decodeURIComponent(pathname);
    const match = decodedPath.match(/^\/images\/products\/(.+)\.[^/.]+$/);
    if (match) {
      return `/images/products-${folder === 'menu-lqip' ? 'lqip' : 'optimized'}/${encodeURIComponent(match[1])}.webp`;
    }

    const rootMatch = decodedPath.match(/^\/([^/]+)\.[^/.]+$/);
    if (rootMatch) {
      return `/${folder}/${encodeURIComponent(rootMatch[1])}.webp`;
    }
  } catch {
    return null;
  }
  return null;
}

function buildLowQualitySrc(src: string, width: number): string {
  const publicVariant = getPublicVariant(src, 'menu-lqip');
  if (publicVariant) return publicVariant;
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  if (src.includes('blob.vercel-storage.com')) {
    return addQueryParams(src, {
      format: 'webp',
      quality: '20',
      width: String(Math.min(width, 36)),
    });
  }

  if (src.includes('images.pexels.com') || src.includes('images.unsplash.com')) {
    return addQueryParams(src, {
      w: String(Math.min(width, 36)),
      q: '22',
      fm: 'webp',
    });
  }

  return TINY_PREVIEW;
}

function buildDeliverySrc(src: string, width: number): string {
  const publicVariant = getPublicVariant(src, 'menu-optimized');
  if (publicVariant) return publicVariant;

  if (src.includes('blob.vercel-storage.com')) {
    return addQueryParams(src, {
      format: 'webp',
      quality: '62',
      width: String(Math.min(width, 480)),
    });
  }

  if (src.includes('images.pexels.com') || src.includes('images.unsplash.com')) {
    return addQueryParams(src, {
      w: String(Math.min(width, 480)),
      q: '62',
      fm: 'webp',
    });
  }

  return src;
}

/**
 * Shows a tiny preview first and waits until the image is near the viewport
 * before requesting the compressed full image. This keeps long menu pages
 * usable on very slow connections instead of downloading every product at once.
 */
export default function OptimizedImage({
  src,
  alt,
  style,
  className,
  width,
  height,
  objectFit = 'cover',
  priority = false,
  lowSrc,
}: OptimizedImageProps) {
  const [shouldLoadFull, setShouldLoadFull] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previewSrc = lowSrc || buildLowQualitySrc(src, width || 600);
  const deliverySrc = buildDeliverySrc(src, width || 600);

  useEffect(() => {
    setShouldLoadFull(priority);
    if (priority) return;

    const node = wrapperRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      setShouldLoadFull(true);
      return;
    }

    const margin = isSlowConnection() ? '80px' : '240px';
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadFull(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, src]);

  useEffect(() => {
    let mounted = true;
    setIsLoaded(false);
    setIsPreviewLoaded(false);
    setResolvedSrc(deliverySrc);
    if (!shouldLoadFull) return () => { mounted = false; };

    void loadFullImage(deliverySrc, priority).then(async (loaded) => {
      if (!mounted) return;
      if (loaded) {
        setResolvedSrc(deliverySrc);
        setIsLoaded(true);
        return;
      }

      // Keep a safe fallback for a stale/missing generated variant.
      if (deliverySrc !== src) {
        const originalLoaded = await loadFullImage(src, priority);
        if (mounted && originalLoaded) {
          setResolvedSrc(src);
          setIsLoaded(true);
        }
      }
    });
    return () => { mounted = false; };
  }, [deliverySrc, priority, shouldLoadFull, src]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: width || '100%',
        height: height || '100%',
        overflow: 'hidden',
        backgroundColor: '#dce7d8',
      }}
    >
      {!isLoaded && (
        <img
          src={previewSrc}
          alt=""
          aria-hidden="true"
          onLoad={() => setIsPreviewLoaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isPreviewLoaded ? 0.92 : 0,
            filter: 'blur(4px)',
            transform: 'scale(1.04)',
            transition: 'opacity 0.2s ease',
            ...style,
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
        />
      )}
      {isLoaded && (
        <img
          src={resolvedSrc}
          alt={alt}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: 1,
            transition: 'opacity 0.35s ease',
            ...style,
          }}
          className={className}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}
    </div>
  );
}