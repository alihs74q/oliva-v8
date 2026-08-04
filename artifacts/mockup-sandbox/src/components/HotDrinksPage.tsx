import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { hotDrinks } from '../data/hotDrinks'
import OlivaLogo from './OlivaLogo'
import FlavorPicker from './FlavorPicker'

type View = 'hero' | 'all'
type NavRoute = 'home' | 'menu' | 'cold-drinks' | 'desserts' | 'hot-drinks'

const CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 0.8, 1]
const DRAG_THRESHOLD = 48
const LOCK_MS = 960

function bgWordFontSize(word: string): string {
  const vw = 80 / (word.length * 0.58)
  return `min(${vw.toFixed(1)}vw, 280px)`
}

// ─── Dissolve variants (cinematic, same motion model as ColdDrinksPage) ────────
const dissolveV = {
  enter: (d: number) => ({
    opacity: 0, x: d > 0 ? 28 : -28, scale: 0.97, filter: 'blur(8px)',
    transition: { duration: 0 },
  }),
  center: {
    opacity: 1, x: 0, scale: 1, filter: 'blur(0px)',
    transition: {
      opacity: { duration: 0.62, ease: CINEMATIC, delay: 0.32 },
      x:       { duration: 0.62, ease: CINEMATIC, delay: 0.32 },
      scale:   { duration: 0.72, ease: CINEMATIC, delay: 0.28 },
      filter:  { duration: 0.72, ease: CINEMATIC, delay: 0.28 },
    },
  },
  exit: (d: number) => ({
    opacity: 0, x: d > 0 ? -28 : 28, scale: 0.96, filter: 'blur(7px)',
    transition: {
      opacity: { duration: 0.42, ease: EXIT_EASE },
      x:       { duration: 0.42, ease: EXIT_EASE },
      scale:   { duration: 0.45, ease: EXIT_EASE },
      filter:  { duration: 0.38, ease: EXIT_EASE },
    },
  }),
}
const dissolveVReduced = {
  enter: { opacity: 0, transition: { duration: 0 } },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

// ─── Hot drink placeholder ─────────────────────────────────────────────────────
function HotDrinkPlaceholder({ size = 150 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size * 1.15} viewBox="0 0 120 138" fill="none"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <path d="M24 40 L96 40 L88 128 Q86 134 80 134 L40 134 Q34 134 32 128 Z"
          fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.26)" strokeWidth="1.5" />
        <path d="M88 60 Q110 60 110 80 Q110 100 88 100"
          fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="60" cy="42" rx="36" ry="4" fill="rgba(255,255,255,0.2)" />
        <path d="M44 30 Q40 22 44 14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M60 26 Q56 18 60 10" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M76 30 Q72 22 76 14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="60" cy="134" rx="44" ry="5" fill="rgba(255,255,255,0.14)" />
      </svg>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', fontWeight: 600 }}>
        Image Soon
      </p>
    </div>
  )
}

// ─── Per-drink content panel (dissolves on change) ────────────────────────────
function ProductPanel({ drink, dir, reducedMotion }: {
  drink: typeof hotDrinks[number]; dir: number; reducedMotion: boolean
}) {
  const variants = reducedMotion ? dissolveVReduced : dissolveV
  const placeholderSize = typeof window !== 'undefined'
    ? Math.min(180, Math.max(100, window.innerHeight * 0.24))
    : 140

  return (
    <motion.div
      key={drink.name} custom={dir} variants={variants}
      initial="enter" animate="center" exit="exit"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', willChange: 'opacity, transform, filter' }}
    >
      {/* Giant background word — subtle, inside the glass panel */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <span style={{
          fontSize: bgWordFontSize(drink.shortName), fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1,
          color: 'rgba(0,0,0,0.04)', whiteSpace: 'nowrap', userSelect: 'none',
        }}>{drink.shortName}</span>
      </div>

      {/* Two-column grid: text left, image right */}
      <div className="hdp-grid" style={{
        position: 'relative', zIndex: 1,
        height: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 'clamp(10px,3vw,48px)',
        alignItems: 'center',
        padding: 'clamp(18px,3.5vh,44px) clamp(22px,4vw,56px)',
      }}>
        {/* Left: text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px,1.6vh,16px)' }}>
          <p style={{ margin: 0, fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Hot Drinks</p>
          <h2 style={{ margin: 0, fontSize: 'clamp(24px,3.8vw,60px)', fontWeight: 800, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            {drink.name}
          </h2>
          <p style={{ margin: 0, fontSize: 'clamp(13px,1.2vw,16px)', color: 'rgba(0,0,0,0.55)', lineHeight: 1.6, maxWidth: 320 }}>
            {drink.description}
          </p>
          <div style={{ marginTop: '4px' }}>
            <FlavorPicker flavors={drink.flavors} accent={drink.themeColor} />
          </div>
        </div>

        {/* Right: image */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {drink.image ? (
            <img src={drink.image} alt={drink.name} draggable={false}
              style={{ maxHeight: 'clamp(140px,34vh,380px)', objectFit: 'contain', filter: 'drop-shadow(0 24px 64px rgba(0,0,0,0.55))', userSelect: 'none' }} />
          ) : (
            <HotDrinkPlaceholder size={placeholderSize} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Arrow button ─────────────────────────────────────────────────────────────
function ArrowBtn({ dir, onClick, disabled }: { dir: 'left' | 'right'; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      onPointerDown={e => e.stopPropagation()}
      aria-label={dir === 'left' ? 'Previous drink' : 'Next drink'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [dir === 'left' ? 'left' : 'right']: 'clamp(6px,1.2vw,16px)', zIndex: 20,
        width: 'clamp(38px,4.5vw,50px)', height: 'clamp(38px,4.5vw,50px)', borderRadius: '50%',
        background: 'rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.35 : 1,
        transition: 'background 0.2s, opacity 0.3s', padding: 0,
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = 'rgba(0,0,0,0.12)' }}
      onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: dir === 'right' ? 'scaleX(-1)' : 'none' }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

// ─── Pagination dots ──────────────────────────────────────────────────────────
function Dots({ total, active, onDot }: { total: number; active: number; onDot: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {Array.from({ length: total }, (_, i) => (
        <button key={i} onClick={() => onDot(i)} aria-label={`Drink ${i + 1}`}
          style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, background: i === active ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.18)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)' }} />
      ))}
    </div>
  )
}

// ─── "See All" grid card ──────────────────────────────────────────────────────
function DrinkGridCard({ drink, isActive, onClick }: {
  drink: typeof hotDrinks[number]; isActive: boolean; onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 360, damping: 18 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover || isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(10px)',
        border: isActive ? '1.5px solid rgba(255,255,255,0.55)' : '1px solid rgba(255,255,255,0.18)',
        borderRadius: 18,
        padding: '18px 14px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        textAlign: 'center',
        transition: 'background 0.18s, border-color 0.18s',
      }}
    >
      {/* Image — smaller, solid orange bg, modern dark-green border */}
      <div style={{
        width: 72, height: 72, flexShrink: 0,
        borderRadius: 14,
        background: '#f97316',
        border: '2px solid #1a3a2a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.28)',
      }}>
        {drink.image ? (
          <img src={drink.image} alt={drink.name} draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' }} />
        ) : (
          <HotDrinkPlaceholder size={44} />
        )}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{drink.name}</p>

      </div>
    </motion.button>
  )
}

// ─── "See All Hot Drinks" overlay ─────────────────────────────────────────────
function AllHotDrinksOverlay({ activeIdx, onSelect, onClose }: {
  activeIdx: number; onSelect: (i: number) => void; onClose: () => void
}) {
  return (
    <motion.div
      key="hdp-all"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,2vw,24px)' }}
    >
      {/* Backdrop — click to close */}
      <div onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }} />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.42, ease: CINEMATIC, delay: 0.05 }}
        style={{
          position: 'relative', zIndex: 1,
          width: 'min(860px, 94vw)',
          maxHeight: 'calc(100svh - 48px)',
          background: 'rgba(15,6,0,0.58)',
          backdropFilter: 'blur(28px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.17)',
          borderRadius: 'clamp(20px,2.5vw,30px)',
          padding: 'clamp(18px,3vw,34px)',
          display: 'flex', flexDirection: 'column', gap: 'clamp(14px,2.5vh,22px)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Menu</p>
            <h3 style={{ margin: '3px 0 0', fontSize: 'clamp(17px,2.2vw,24px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>All Hot Drinks</h3>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Grid */}
        <div className="hdp-all-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(8px,1.8vw,16px)',
        }}>
          {hotDrinks.map((drink, i) => (
            <DrinkGridCard key={drink.name} drink={drink} isActive={i === activeIdx}
              onClick={() => onSelect(i)} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HotDrinksPage({ navigate, onBack, initialSlug }: { navigate: (to: NavRoute) => void; onBack?: () => void; initialSlug?: string }) {
  const [view, setView] = useState<View>('hero')
  const [heroIdx, setHeroIdx] = useState(() => {
    if (!initialSlug) return 0
    const i = hotDrinks.findIndex(d => d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === initialSlug || d.shortName.toLowerCase() === initialSlug)
    return i >= 0 ? i : 0
  })
  const [dir, setDir] = useState(1)
  const [locked, setLocked] = useState(false)

  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pStartX = useRef<number | null>(null)
  const pStartY = useRef<number | null>(null)
  const isDrag = useRef(false)
  const reducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  const drink = hotDrinks[heroIdx]

  const paginate = useCallback((d: number) => {
    setLocked(prev => {
      if (prev) return prev
      setDir(d)
      setHeroIdx(p => (p + d + hotDrinks.length) % hotDrinks.length)
      if (lockTimer.current) clearTimeout(lockTimer.current)
      lockTimer.current = setTimeout(() => setLocked(false), LOCK_MS)
      return true
    })
  }, [])

  const goTo = useCallback((i: number) => {
    if (i === heroIdx) return
    setLocked(prev => {
      if (prev) return prev
      setDir(i > heroIdx ? 1 : -1)
      setHeroIdx(i)
      if (lockTimer.current) clearTimeout(lockTimer.current)
      lockTimer.current = setTimeout(() => setLocked(false), LOCK_MS)
      return true
    })
  }, [heroIdx])

  useEffect(() => () => { if (lockTimer.current) clearTimeout(lockTimer.current) }, [])

  useEffect(() => {
    if (view !== 'hero') return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paginate(-1)
      else if (e.key === 'ArrowRight') paginate(1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [view, paginate])

  useEffect(() => {
    if (view !== 'hero') return
    const onMove = (e: PointerEvent) => {
      if (pStartX.current === null) return
      const dx = Math.abs(e.clientX - pStartX.current)
      const dy = Math.abs(e.clientY - (pStartY.current ?? 0))
      if (dx > dy && dx > 8) isDrag.current = true
    }
    const onUp = (e: PointerEvent) => {
      if (pStartX.current === null) return
      const diff = e.clientX - pStartX.current
      if (isDrag.current && Math.abs(diff) > DRAG_THRESHOLD) paginate(diff < 0 ? 1 : -1)
      pStartX.current = null; pStartY.current = null; isDrag.current = false
    }
    const onCancel = () => { pStartX.current = null; pStartY.current = null; isDrag.current = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [view, paginate])

  const onPD = useCallback((e: React.PointerEvent) => {
    if (view !== 'hero') return
    pStartX.current = e.clientX; pStartY.current = e.clientY; isDrag.current = false
  }, [view])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Background: white ────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#ffffff' }} />

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'relative', zIndex: 10, height: 64, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,40px)',
      }}>
      {/* Autumn branch decoration — right side, visible on page */}
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%286%29-7rNm5WuqVaTQAbGerhaSK8lM9cMGAV.png"
        alt="Autumn branch decoration"
        style={{
          position: 'fixed',
          right: 'clamp(-20px, -5vw, 60px)',
          top: 'clamp(80px, 8vh, 180px)',
          width: 'clamp(280px, 35vw, 500px)',
          height: 'auto',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 999,
          mixBlendMode: 'darken',
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
        }}
      />
        <button onClick={() => navigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
          <OlivaLogo size={38} showText={false} />
          <span style={{ color: '#111', fontWeight: 800, fontSize: 17, letterSpacing: '0.05em' }}>OLIVA</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,28px)' }}>
          {(['Home', 'Menu'] as const).map(label => (
            <button key={label}
              onClick={() => navigate(label.toLowerCase() as NavRoute)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.55)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = '#000')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.55)')}
            >{label}</button>
          ))}
          {onBack ? (
            <button onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.15)', color: '#111', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Hot Drinks
            </button>
          ) : (
            <button onClick={() => navigate('menu')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.15)', color: '#111', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Menu
            </button>
          )}
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1, position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'clamp(10px,2vh,18px) clamp(10px,2.5vw,24px) 0',
          gap: 'clamp(10px,1.8vh,18px)',
          overflow: 'hidden',
        }}
        onPointerDown={onPD}
      >
        {/* Panel + arrows wrapper */}
        <div style={{
          position: 'relative', width: '100%', maxWidth: 1080,
          flex: 1, minHeight: 0,
          display: 'flex', alignItems: 'stretch',
        }}>
          {/* Clean white panel */}
          <div style={{
            flex: 1,
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 'clamp(16px,2.2vw,28px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <AnimatePresence custom={dir} mode="sync">
              <ProductPanel
                key={heroIdx}
                drink={hotDrinks[heroIdx]}
                dir={dir}
                reducedMotion={reducedMotion.current}
              />
            </AnimatePresence>
          </div>

          {/* Arrows — outside the panel, inside the wrapper */}
          <ArrowBtn dir="left" onClick={() => paginate(-1)} disabled={locked} />
          <ArrowBtn dir="right" onClick={() => paginate(1)} disabled={locked} />
        </div>

        {/* Bottom controls: dots only */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0, paddingBottom: 'clamp(12px,2.5vh,24px)', zIndex: 10 }}>
          <Dots total={hotDrinks.length} active={heroIdx} onDot={goTo} />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hdp-grid { grid-template-columns: 1fr !important; padding: 14px 18px !important; gap: 14px !important; }
          .hdp-grid > div:last-child { order: -1; }
          .hdp-all-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 380px) {
          .hdp-all-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
