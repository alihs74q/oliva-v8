import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'

interface DrinkGalleryProps {
  images: string[]
  alt: string
  autoPlayMs?: number
}

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '60%' : '-60%',
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-60%' : '60%',
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.32, ease: [0.4, 0, 0.8, 1] as const },
  }),
}

export default function DrinkGallery({ images, alt, autoPlayMs = 3500 }: DrinkGalleryProps) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [hovered, setHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = images.length

  const go = useCallback((next: number, direction: number) => {
    setDir(direction)
    setIndex((next + total) % total)
  }, [total])

  const prev = useCallback(() => go(index - 1, -1), [go, index])
  const next = useCallback(() => go(index + 1, 1), [go, index])

  // Auto-play
  useEffect(() => {
    if (total <= 1 || hovered) return
    autoRef.current = setInterval(() => go(index + 1, 1), autoPlayMs)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [total, hovered, index, go, autoPlayMs])

  // Reset index when images change (drink switched)
  useEffect(() => { setIndex(0) }, [images])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    dx < 0 ? next() : prev()
  }

  if (total === 0) return null

  // Single image — no chrome
  if (total === 1) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <img
          src={images[0]} alt={alt} draggable={false}
          style={{
            maxHeight: 'clamp(140px,34vh,380px)',
            maxWidth: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 24px 64px rgba(0,0,0,0.55))',
            userSelect: 'none',
            borderRadius: 16,
          }}
        />
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        height: '100%',
      }}
    >
      {/* Image stage */}
      <div style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 20,
      }}>
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.img
            key={index}
            src={images[index]}
            alt={`${alt} ${index + 1}`}
            draggable={false}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              maxHeight: 'clamp(130px,30vh,360px)',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 56px rgba(0,0,0,0.5))',
              userSelect: 'none',
              borderRadius: 14,
              willChange: 'transform, opacity',
            }}
          />
        </AnimatePresence>

        {/* Left arrow */}
        <GalleryArrow dir="left" onClick={prev} hovered={hovered} />
        {/* Right arrow */}
        <GalleryArrow dir="right" onClick={next} hovered={hovered} />
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, paddingBottom: 4 }}>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => go(i, i > index ? 1 : -1)}
            aria-label={`Photo ${i + 1}`}
            style={{
              width: i === index ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === index ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.22)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function GalleryArrow({ dir, onClick, hovered }: { dir: 'left' | 'right'; onClick: () => void; hovered: boolean }) {
  const [btnHovered, setBtnHovered] = useState(false)
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      aria-label={dir === 'left' ? 'Previous photo' : 'Next photo'}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: 6,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: btnHovered
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.25s ease, background 0.18s ease, transform 0.18s ease',
        // Always visible on touch devices
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: dir === 'right' ? 'scaleX(-1)' : 'none' }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}
