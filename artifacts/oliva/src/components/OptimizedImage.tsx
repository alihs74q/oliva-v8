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
  /** Tiny preview for local Vite assets that cannot be resized by a CDN. */
  lowSrc?: string;
}

type PendingImage = {
  src: string;
  resolve: (loaded: boolean) => void;
};

const fullImageQueue: PendingImage[] = [];
let activeFullImages = 0;
const fullImagePromises = new Map<string, Promise<boolean>>();

function drainFullImageQueue(): void {
  while (activeFullImages < 3 && fullImageQueue.length > 0) {
    const next = fullImageQueue.shift();
    if (!next) return;

    activeFullImages += 1;
    const image = new Image();
    image.decoding = 'async';
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

function loadFullImage(src: string): Promise<boolean> {
  const existing = fullImagePromises.get(src);
  if (existing) return existing;

  const promise = new Promise<boolean>((resolve) => {
    fullImageQueue.push({ src, resolve });
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

function buildLowQualitySrc(src: string, width: number): string {
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  if (src.includes('blob.vercel-storage.com')) {
    return addQueryParams(src, {
      format: 'webp',
      quality: '28',
      width: String(Math.min(width, 120)),
    });
  }

  if (src.includes('images.pexels.com') || src.includes('images.unsplash.com')) {
    return addQueryParams(src, {
      w: String(Math.min(width, 120)),
      q: '32',
      fm: 'webp',
    });
  }

  return src;
}

/**
 * Paints a small blurred preview first, then swaps in the original image.
 * The module-level queue keeps original downloads alive and limits them to
 * three at a time so leaving the page does not cancel the cache warm-up.
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previewSrc = lowSrc || buildLowQualitySrc(src, width || 600);

  useEffect(() => {
    let mounted = true;
    void loadFullImage(src).then((loaded) => {
      if (mounted && loaded) setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [src]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: width || '100%',
        height: height || '100%',
        overflow: 'hidden',
        backgroundColor: '#1a2e1a22',
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
            filter: 'blur(5px)',
            transform: 'scale(1.04)',
            transition: 'opacity 0.2s ease',
            ...style,
          }}
          loading="eager"
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
        />
      )}
      {isLoaded && (
        <img
          src={src}
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
          loading="eager"
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}
    </div>
  );
}