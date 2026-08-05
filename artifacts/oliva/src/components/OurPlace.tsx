/**
 * OurPlace.tsx
 * ─────────────────────────────────────────────────────────
 * Cinematic pinned-scroll experience for the "Our Place" page.
 * Uses framer-motion scroll-driven animations — no extra libraries.
 *
 * Architecture:
 *   • Tall outer track  (~550vh) is the scroll area
 *   • Sticky inner      (100svh) stays in view while track scrolls
 *   • useScroll tracks  scrollYProgress 0→1 across the full track
 *   • Four scenes, each occupying 25% of scroll travel
 *   • Images animate per-scene with staggered enter/exit
 *   • Fixed nav dots: right-side on desktop, bottom on mobile
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import { ourPlaceContent, type OurPlaceScene } from '../data/ourPlaceContent';
import { imageAssets } from '../utils/imageAssets';

// ─── constants ───────────────────────────────────────────
const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const SCENES = ourPlaceContent.scenes;
const N = SCENES.length; // 4

/** px offset from track top where each scene begins (fraction of track) */
function sceneRange(idx: number): [number, number] {
  return [idx / N, (idx + 1) / N];
}

// ─── main component ──────────────────────────────────────
export default function OurPlace({ onBack }: { onBack: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  // Track scroll progress across the full outer track
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Derive active scene from scroll position
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(Math.floor(v * N), N - 1);
    if (idx !== activeScene) setActiveScene(idx);
  });

  // Click-a-dot → scroll to that scene
  const scrollToScene = useCallback((idx: number) => {
    if (!trackRef.current) return;
    const trackH = trackRef.current.scrollHeight;
    const winH = window.innerHeight;
    const trackTop = trackRef.current.getBoundingClientRect().top + window.scrollY;
    const fraction = idx / N + 0.01; // tiny offset past scene boundary
    const target = trackTop + fraction * (trackH - winH);
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // Reset scroll when page mounts
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    /* Outer track — sets the scroll height */
    <div
      ref={trackRef}
      style={{ height: `${N * 140}vh`, position: 'relative' }}
    >
      {/* Sticky frame */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100svh',
          overflow: 'hidden',
          background: 'linear-gradient(160deg,#111a0d,#1a2612 55%,#0f1a0b)',
        }}
      >
        {/* ── subtle grain ── */}
        <div
          className="noh-grain"
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />

        {/* ── scene images (AnimatePresence syncs enter/exit) ── */}
        <AnimatePresence mode="sync">
          <SceneImages
            key={activeScene}
            scene={SCENES[activeScene]}
            sceneIdx={activeScene}
            scrollYProgress={scrollYProgress}
            reducedMotion={reducedMotion}
          />
        </AnimatePresence>

        {/* ── centered headline + subtitle ── */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -20 }}
              transition={{ duration: 0.65, ease: EASE }}
              style={{ textAlign: 'center', padding: '0 24px', maxWidth: 640 }}
            >
              {/* Headline */}
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(52px,10vw,120px)',
                fontWeight: 200,
                letterSpacing: '0.16em',
                lineHeight: 0.92,
                color: '#f5f2e8',
                textTransform: 'uppercase',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}>
                {SCENES[activeScene].titleTop}
              </h2>
              {SCENES[activeScene].titleBottom && (
                <h2 style={{
                  margin: '4px 0 0',
                  fontSize: 'clamp(52px,10vw,120px)',
                  fontWeight: 200,
                  letterSpacing: '0.16em',
                  lineHeight: 0.92,
                  color: 'transparent',
                  textTransform: 'uppercase',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  WebkitTextStroke: '1px rgba(245,242,232,0.55)',
                }}>
                  {SCENES[activeScene].titleBottom}
                </h2>
              )}

              {/* Thin divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
                style={{
                  height: 1, background: 'rgba(212,168,67,0.45)',
                  margin: '22px auto', width: 60,
                  transformOrigin: 'center',
                }}
              />

              {/* Subtitle */}
              <p style={{
                margin: 0,
                fontSize: 'clamp(13px,1.5vw,16px)',
                fontWeight: 400,
                letterSpacing: '0.08em',
                lineHeight: 1.7,
                color: 'rgba(245,242,232,0.55)',
                fontFamily: '"Manrope", system-ui, sans-serif',
                whiteSpace: 'pre-line',
              }}>
                {SCENES[activeScene].subtitle}
              </p>
              {SCENES[activeScene].body && (
                <p style={{
                  margin: '10px 0 0',
                  fontSize: 'clamp(12px,1.3vw,14px)',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  color: 'rgba(212,168,67,0.75)',
                  textTransform: 'uppercase',
                  fontFamily: '"Manrope", system-ui, sans-serif',
                }}>
                  {SCENES[activeScene].body}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── top bar: back button + logo ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(14px,2.5vw,24px) clamp(16px,3vw,32px)',
          background: 'linear-gradient(to bottom, rgba(10,14,8,0.65) 0%, transparent 100%)',
        }}>
          {/* Back */}
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(26,38,18,0.55)',
              border: '1px solid rgba(212,168,67,0.35)',
              borderRadius: 999,
              padding: '10px 20px',
              color: 'rgba(245,242,232,0.85)',
              fontSize: 13, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
              pointerEvents: 'auto',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.7)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(212,168,67,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.35)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Home
          </button>

          {/* Logo */}
          <div style={{
            width: 'clamp(44px,6vw,60px)', height: 'clamp(44px,6vw,60px)',
            borderRadius: '50%', background: '#596B3D',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(89,107,61,0.4)',
            flexShrink: 0,
          }}>
            <img
              src={imageAssets.logo}
              alt="Oliva"
              style={{ width: '78%', height: '78%', objectFit: 'contain' }}
            />
          </div>

          {/* spacer to balance flex */}
          <div style={{ width: 'clamp(80px,10vw,120px)' }} />
        </div>

        {/* ── scroll hint (scene 0 only) ── */}
        <AnimatePresence>
          {activeScene === 0 && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', bottom: 32, left: '50%',
                transform: 'translateX(-50%)', zIndex: 20,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
                pointerEvents: 'none',
              }}
            >
              <span style={{
                fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
                color: 'rgba(245,242,232,0.4)', fontFamily: '"Manrope", sans-serif',
              }}>Scroll</span>
              <motion.div
                className="noh-arrow"
                style={{ color: 'rgba(212,168,67,0.5)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── desktop nav dots (right) ── */}
        <NavDots
          activeScene={activeScene}
          scenes={SCENES}
          scrollToScene={scrollToScene}
        />
      </div>
    </div>
  );
}

// ─── Scene images ─────────────────────────────────────────
function SceneImages({
  scene,
  reducedMotion,
}: {
  scene: OurPlaceScene;
  sceneIdx: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scrollYProgress: any;
  reducedMotion: boolean;
}) {
  return (
    <>
      {scene.images.map((img, i) => {
        const delay = i * 0.08;

        // Build enter/exit variants per direction
        const enterX = img.enter === 'left' ? '-110%'
          : img.enter === 'right' ? '110%' : '0%';
        const enterY = img.enter === 'top' ? '-110%'
          : img.enter === 'bottom' ? '110%' : '0%';

        return (
          <motion.div
            key={img.src + i}
            initial={reducedMotion ? { opacity: 0 } : {
              opacity: 0,
              x: enterX,
              y: enterY,
              scale: 0.88,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: 1,
              x: '0%',
              y: '0%',
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={reducedMotion ? { opacity: 0 } : {
              opacity: 0,
              scale: 0.95,
              filter: 'blur(4px)',
            }}
            transition={{
              duration: reducedMotion ? 0.3 : 0.85,
              ease: EASE,
              delay,
            }}
            style={{
              position: 'absolute',
              top: img.style.top,
              bottom: img.style.bottom,
              left: img.style.left,
              right: img.style.right,
              width: img.style.width,
              maxWidth: img.style.maxWidth,
              aspectRatio: img.style.aspectRatio,
              zIndex: img.style.zIndex ?? 2,
              rotate: `${img.style.rotate}deg`,
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
              willChange: 'transform, opacity',
              // hide on very small screens for some images
              display: i > 1 ? 'var(--img-display, block)' : 'block',
            }}
          >
            {/* subtle parallax inner shift */}
            <motion.img
              src={img.src}
              alt={img.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </motion.div>
        );
      })}
    </>
  );
}

// ─── Navigation dots ──────────────────────────────────────
function NavDots({
  activeScene,
  scenes,
  scrollToScene,
}: {
  activeScene: number;
  scenes: OurPlaceScene[];
  scrollToScene: (idx: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      {/* Desktop: fixed right-side vertical dots */}
      <nav
        aria-label="Scene navigation"
        style={{
          position: 'absolute',
          right: 'clamp(16px,3vw,32px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          alignItems: 'flex-end',
        }}
        className="our-place-dots-desktop"
      >
        {scenes.map((s, i) => {
          const isActive = i === activeScene;
          const isHovered = i === hovered;
          return (
            <button
              key={s.id}
              onClick={() => scrollToScene(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Go to scene: ${s.label}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}
            >
              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive || isHovered ? 1 : 0,
                  x: isActive || isHovered ? 0 : 8,
                }}
                transition={{ duration: 0.25, ease: EASE }}
                style={{
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isActive ? 'rgba(212,168,67,0.9)' : 'rgba(245,242,232,0.6)',
                  fontFamily: '"Manrope", sans-serif',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 700 : 500,
                  pointerEvents: 'none',
                }}
              >
                {s.label}
              </motion.span>

              {/* Dot */}
              <motion.div
                animate={{
                  width: isActive ? 28 : 6,
                  height: isActive ? 6 : 6,
                  backgroundColor: isActive
                    ? 'rgba(212,168,67,0.9)'
                    : isHovered
                      ? 'rgba(245,242,232,0.5)'
                      : 'rgba(245,242,232,0.25)',
                }}
                transition={{ duration: 0.35, ease: EASE }}
                style={{
                  borderRadius: 999,
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* Mobile: bottom horizontal dots */}
      <nav
        aria-label="Scene navigation"
        style={{
          position: 'absolute',
          bottom: 'clamp(52px,8vw,64px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
        }}
        className="our-place-dots-mobile"
      >
        {scenes.map((s, i) => {
          const isActive = i === activeScene;
          return (
            <button
              key={s.id}
              onClick={() => scrollToScene(i)}
              aria-label={`Go to scene: ${s.label}`}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}
            >
              <motion.div
                animate={{
                  width: isActive ? 20 : 6,
                  backgroundColor: isActive
                    ? 'rgba(212,168,67,0.9)'
                    : 'rgba(245,242,232,0.3)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ height: 6, borderRadius: 999 }}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}
