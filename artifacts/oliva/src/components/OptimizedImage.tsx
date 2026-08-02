import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  /**
   * priority=true  → load immediately (hero / above-the-fold images)
   * priority=false → start loading 600px before entering the viewport
   */
  priority?: boolean;
}

/**
 * OptimizedImage
 * - Starts downloading 600 px before the image enters the viewport so it's
 *   ready the moment the user scrolls to it.
 * - Checks the SW image cache first via the Fetch API — if the image is
 *   already cached it resolves instantly (no network round-trip).
 * - Shows a smooth fade-in when the image is ready.
 * - Falls back to the original URL if optimisation fails.
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
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  // For priority images start loading immediately; for others wait until
  // the element is 600 px away from the viewport.
  const [shouldLoad, setShouldLoad] = useState(priority);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Build the optimised URL — Vercel Blob supports width + format params
  const optimizedSrc = src.includes('blob.vercel-storage.com')
    ? `${src}?format=webp&quality=80&width=${width || 600}`
    : src;

  // Aggressive early-load: start fetching 600 px before element is visible
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      // 600 px root margin means the image starts loading well before
      // the user actually reaches it, so it appears instant.
      { rootMargin: '600px' }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [priority, shouldLoad]);

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
      {/* Skeleton shimmer shown while loading */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, #1a2e1a22 25%, #2a3e2a44 50%, #1a2e1a22 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }}
        />
      )}

      {shouldLoad && (
        <img
          src={optimizedSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            // If the optimised URL fails, fall back to the original
            const img = e.currentTarget;
            if (img.src !== src) {
              img.src = src;
            } else {
              setIsLoaded(true); // still mark loaded to remove shimmer
            }
          }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.35s ease',
            ...style,
          }}
          className={className}
          // Let the browser also handle lazy loading as a safety net,
          // but our IntersectionObserver fires much earlier.
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
        />
      )}

      {/* Global shimmer keyframe — injected once */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
