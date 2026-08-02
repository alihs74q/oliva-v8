import {
  useState, useRef, useEffect, useCallback,
} from 'react'
import {
  motion, AnimatePresence,
} from 'framer-motion'
import { desserts, type Dessert } from '../data/desserts'
import OlivaLogo from './OlivaLogo'
import FlavorPicker from './FlavorPicker'
import CurrencyToggle from './CurrencyToggle'
import { useCurrency } from '../hooks/useCurrency'
import type { Currency } from '../hooks/useCurrency'


type View = 'hero' | 'all'
type NavRoute = 'home' | 'menu' | 'cold-drinks' | 'desserts'

// Cinematic easing — same feel as Cold Drinks
const CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EXIT_EASE: [number, number, number, number] = [0.4, 0, 0.8, 1]
const DRAG_THRESHOLD = 48
const LOCK_MS = 980

// ─── Color helpers ────────────────────────────────────────────────────────────
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)) }
function toRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}
function toHex(r: number, g: number, b: number) {
  return '#' + ((1 << 24) | (clamp(r,0,255) << 16) | (clamp(g,0,255) << 8) | clamp(b,0,255)).toString(16).slice(1)
}
function shade(hex: string, amt: number) {
  const { r, g, b } = toRgb(hex)
  return toHex(r + amt, g + amt, b + amt)
}
function rgba(hex: string, a: number) {
  const { r, g, b } = toRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

// Big background word — same sizing formula as Cold Drinks
function bgWordFontSize(word: string): string {
  const vw = 86 / (word.length * 0.58)
  return `min(${vw.toFixed(1)}vw, 360px)`
}

// ─── Dissolve variants (cinematic, same quality as Cold Drinks) ────────────────
const dissolveV = {
  enter: (d: number) => ({
    opacity: 0, x: d > 0 ? 32 : -32, scale: 0.97, filter: 'blur(8px)',
    transition: { duration: 0 },
  }),
  center: {
    opacity: 1, x: 0, scale: 1, filter: 'blur(0px)',
    transition: {
      opacity: { duration: 0.64, ease: CINEMATIC, delay: 0.34 },
      x:       { duration: 0.64, ease: CINEMATIC, delay: 0.34 },
      scale:   { duration: 0.74, ease: CINEMATIC, delay: 0.3 },
      filter:  { duration: 0.74, ease: CINEMATIC, delay: 0.3 },
    },
  },
  exit: (d: number) => ({
    opacity: 0, x: d > 0 ? -30 : 30, scale: 0.96, filter: 'blur(7px)',
    transition: {
      opacity: { duration: 0.44, ease: EXIT_EASE },
      x:       { duration: 0.44, ease: EXIT_EASE },
      scale:   { duration: 0.46, ease: EXIT_EASE },
      filter:  { duration: 0.4, ease: EXIT_EASE },
    },
  }),
}
const dissolveVReduced = {
  enter: { opacity: 0, transition: { duration: 0 } },
  center: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}



// ─── Curved chocolate wave (static organic background shape) ──────────────────
function ChocoWave({ color, flip, heightPct }: { color: string; flip?: boolean; heightPct: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${heightPct}%`, pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 1440 760" preserveAspectRatio="none"
        style={{ position: 'absolute', width: '100%', height: '100%', display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}
        aria-hidden
      >
        <path
          d="M0,520 C220,470 360,560 560,520 C780,470 920,600 1140,540 C1280,500 1380,560 1440,520 L1440,760 L0,760 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

// ─── Product panel (one dissolve unit) ───────────────────────────────────────
function ProductPanel({ dessert, dir, reducedMotion, currency }: {
  dessert: Dessert; dir: number; reducedMotion: boolean; currency: Currency
}) {
  const variants = reducedMotion ? dissolveVReduced : dissolveV
  const dark = shade(dessert.themeColor, -12)
  const light = shade(dessert.themeColor, 64)

  return (
    <motion.div
      key={dessert.name} custom={dir} variants={variants}
      initial="enter" animate="center" exit="exit"
      style={{ position: 'absolute', inset: 0, willChange: 'opacity, transform, filter' }}
    >
      {/* Giant background word — same style as Cold Drinks (shortName only) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
        <span style={{
          fontSize: bgWordFontSize(dessert.shortName), fontWeight: 900, letterSpacing: '-0.04em',
          lineHeight: 1, color: rgba(dark, 0.13), whiteSpace: 'nowrap', userSelect: 'none',
        }}>{dessert.shortName}</span>
      </div>

      {/* Floating dessert composition */}
      <div className="dz-stage" style={{
        position: 'relative', zIndex: 4, height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(6px,1.4vh,14px) clamp(16px,4vw,48px)',
        gap: 'clamp(10px,1.8vh,18px)',
        overflow: 'hidden',
      }}>
        {/* Product frame — oval placeholder when no image; full-size king when image provided */}
        <div
          className={dessert.image ? 'dz-frame-img' : 'dz-frame'}
          style={{
            position: 'relative', zIndex: 5,
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            ...(dessert.image
              ? {
                  // KING SIZE — image dominates the panel
                  width: 'min(540px, 80vw)',
                  height: 'min(500px, 60vh)',
                }
              : {
                  width: 'min(380px, 64vw)', height: 'min(340px, 42vh)',
                  borderRadius: '50% 50% 46% 54% / 54% 48% 52% 46%',
                  background: `radial-gradient(circle at 32% 28%, ${rgba(light, 0.96)} 0%, ${rgba(dessert.themeColor, 0.94)} 60%, ${rgba(dark, 0.97)} 100%)`,
                  boxShadow: `0 40px 90px rgba(60,30,12,0.38), inset 0 8px 30px rgba(255,255,255,0.4), inset 0 -18px 40px rgba(60,30,12,0.28)`,
                  border: `1.5px solid rgba(255,255,255,0.45)`,
                  padding: '8%',
                }),
          }}
        >
          {/* Soft aura glow behind the image — visible depth on the cream page */}
          {dessert.image && (
            <div style={{
              position: 'absolute', inset: '-8%', zIndex: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse 75% 65% at 50% 55%, ${rgba(dessert.themeColor, 0.28)} 0%, ${rgba(light, 0.18)} 50%, transparent 75%)`,
              filter: 'blur(28px)',
            }} />
          )}
          {/* Inner highlight — only shown without a real image */}
          {!dessert.image && (
            <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4) 0%, transparent 55%)', pointerEvents: 'none' }} />
          )}
          {/* Price badge */}
          <motion.div
            key={currency}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', top: dessert.image ? '2%' : '4%', right: dessert.image ? '2%' : '4%', zIndex: 8,
              padding: currency === 'LBP' ? 'clamp(5px,0.8vw,9px) clamp(8px,1.2vw,12px)' : 'clamp(7px,1vw,11px) clamp(12px,1.6vw,18px)',
              borderRadius: 999,
              background: 'rgba(255,248,236,0.97)',
              border: `1.5px solid ${rgba(dark, 0.35)}`,
              boxShadow: '0 8px 22px rgba(60,30,12,0.28)',
              fontSize: currency === 'LBP' ? 'clamp(11px,1.3vw,15px)' : 'clamp(15px,2vw,24px)', fontWeight: 800,
              color: dessert.themeColor, letterSpacing: '-0.01em',
              lineHeight: 1, whiteSpace: 'nowrap',
            }}
          >
            {currency === 'USD' ? dessert.price : dessert.lbpPrice}
          </motion.div>
          {dessert.image && (
            <img
              src={dessert.image}
              alt={dessert.name}
              draggable={false}
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain',
                filter: `drop-shadow(0 28px 52px ${rgba(dessert.themeColor, 0.32)}) drop-shadow(0 8px 18px rgba(40,20,8,0.3))`,
                userSelect: 'none', position: 'relative', zIndex: 2,
              }}
            />
          )}
        </div>

        {/* Product info card — cream, rounded, centered under the frame */}
        <div className="dz-info" style={{
          position: 'relative', zIndex: 6,
          maxWidth: 520, width: '100%',
          padding: 'clamp(12px,1.8vw,22px) clamp(18px,2.6vw,30px)',
          borderRadius: 'clamp(20px,2.6vw,30px)',
          background: 'linear-gradient(150deg, rgba(255,248,236,0.97) 0%, rgba(255,236,224,0.95) 100%)',
          boxShadow: '0 22px 60px rgba(60,30,12,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.7)',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(4px,0.8vh,9px)',
        }}>
          <p style={{ margin: 0, fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, letterSpacing: '0.3em', color: rgba(dark, 0.7), textTransform: 'uppercase' }}>Desserts</p>
          <h2 style={{ margin: 0, fontSize: 'clamp(22px,3.4vw,42px)', fontWeight: 800, color: dark, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{dessert.name}</h2>
          <p style={{ margin: 0, fontSize: 'clamp(12px,1.2vw,15px)', color: rgba(dark, 0.72), lineHeight: 1.5, maxWidth: 420 }}>{dessert.description}</p>
          <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
            <FlavorPicker flavors={dessert.flavors} accent={dessert.themeColor} label="Choose Flavor" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Arrow button — round, semi-transparent, dessert-styled ────────────────────
function ArrowBtn({ dir, onClick, disabled, tone }: { dir: 'left' | 'right'; onClick: () => void; disabled: boolean; tone: { bg: string; fg: string } }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onPointerDown={e => e.stopPropagation()}
      onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}
      aria-label={dir === 'left' ? 'Previous dessert' : 'Next dessert'}
      style={{
        position: 'absolute', top: '50%', transform: `translateY(-50%) scale(${hover && !disabled ? 1.08 : 1})`,
        [dir === 'left' ? 'left' : 'right']: 'clamp(8px,2vw,28px)', zIndex: 20,
        width: 'clamp(44px,5.5vw,58px)', height: 'clamp(44px,5.5vw,58px)', borderRadius: '50%',
        background: hover && !disabled ? tone.bg : 'rgba(255,248,236,0.6)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${tone.fg}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'background 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s', padding: 0,
        boxShadow: '0 8px 24px rgba(60,30,12,0.18)',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tone.fg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: dir === 'right' ? 'scaleX(-1)' : 'none' }}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  )
}

// ─── Pagination dots ──────────────────────────────────────────────────────────
function Dots({ total, active, onDot, tone }: { total: number; active: number; onDot: (i: number) => void; tone: { fg: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <button key={i} onClick={() => onDot(i)} aria-label={`Dessert ${i + 1}`}
          style={{ width: i === active ? 30 : 9, height: 9, borderRadius: 5, background: i === active ? tone.fg : rgba(tone.fg, 0.4), border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)' }} />
      ))}
    </div>
  )
}

// ─── Hero view ────────────────────────────────────────────────────────────────
function HeroView({
  idx, dir, locked, reducedMotion, tone, currency, onCurrencyToggle,
  onPrev, onNext, onDot, onShowAll, onPointerDown,
}: {
  idx: number; dir: number; locked: boolean; reducedMotion: boolean
  tone: { bg: string; fg: string }
  currency: Currency; onCurrencyToggle: () => void
  onPrev: () => void; onNext: () => void; onDot: (i: number) => void; onShowAll: () => void
  onPointerDown: (e: React.PointerEvent) => void
}) {
  return (
    <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
    >
      {/* Currency toggle — top-right of the hero content area */}
      <div style={{ position: 'absolute', top: 12, right: 'clamp(60px,8vw,90px)', zIndex: 25, pointerEvents: 'all' }}>
        <CurrencyToggle currency={currency} onToggle={onCurrencyToggle} />
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
      >
        <AnimatePresence custom={dir} mode="sync">
          <ProductPanel key={idx} dessert={desserts[idx]} dir={dir} reducedMotion={reducedMotion} currency={currency} />
        </AnimatePresence>
        <ArrowBtn dir="left" onClick={onPrev} disabled={locked} tone={tone} />
        <ArrowBtn dir="right" onClick={onNext} disabled={locked} tone={tone} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 'clamp(14px,3vh,28px)', zIndex: 10 }}>
        <Dots total={desserts.length} active={idx} onDot={onDot} tone={tone} />
      </div>
    </motion.div>
  )
}

// ─── All Desserts card (Top-Sellers style) ─────────────────────────────────────
function DessertCard({ dessert, dist, cardW, cardH, onClick }: {
  dessert: Dessert; dist: number; cardW: number; cardH: number; onClick: () => void
}) {
  const abs = Math.abs(dist)
  const isCenter = abs === 0
  const dark = shade(dessert.themeColor, -16)
  const light = shade(dessert.themeColor, 60)
  return (
    <motion.div
      animate={{ scale: isCenter ? 1 : abs === 1 ? 0.9 : 0.8, opacity: isCenter ? 1 : abs === 1 ? 0.7 : abs === 2 ? 0.32 : 0 }}
      transition={{ duration: 0.45, ease: CINEMATIC }}
      onClick={onClick}
      style={{
        width: cardW, height: cardH, flexShrink: 0,
        borderRadius: 30,
        background: `linear-gradient(160deg, ${rgba(light, 0.96)} 0%, ${rgba(dessert.themeColor, 0.96)} 58%, ${rgba(dark, 0.98)} 100%)`,
        border: `1.5px solid rgba(255,255,255,${isCenter ? 0.6 : 0.3})`,
        cursor: isCenter ? 'pointer' : 'default',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: isCenter ? '0 36px 80px rgba(60,30,12,0.4)' : '0 10px 28px rgba(60,30,12,0.22)',
        filter: abs > 1 ? 'blur(2px)' : 'none',
        transition: 'box-shadow 0.35s, filter 0.35s',
      }}
    >
      {/* Image area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '26px 22px 14px', position: 'relative' }}>
        {!dessert.image && <div style={{ position: 'absolute', inset: '18px', borderRadius: '50% 50% 46% 54% / 54% 48% 52% 46%', background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35) 0%, transparent 60%)', pointerEvents: 'none' }} />}
        {dessert.image && (
          <img src={dessert.image} alt={dessert.name} draggable={false}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', userSelect: 'none', filter: 'drop-shadow(0 10px 26px rgba(40,20,8,0.4))', position: 'relative', zIndex: 2 }} />
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '16px 22px 22px', background: 'rgba(255,248,236,0.92)', borderTop: '1px solid rgba(255,255,255,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ margin: 0, fontSize: 'clamp(15px,1.7vw,19px)', fontWeight: 800, color: dark, lineHeight: 1.2 }}>{dessert.name}</p>
          <p style={{ margin: 0, marginLeft: 10, fontSize: 'clamp(15px,1.7vw,19px)', fontWeight: 800, color: dessert.themeColor, flexShrink: 0 }}>{dessert.price}</p>
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(11px,1.1vw,13px)', color: rgba(dark, 0.7), lineHeight: 1.45 }}>{dessert.description}</p>
      </div>
    </motion.div>
  )
}

// ─── All Desserts view (Top-Sellers-style carousel) ───────────────────────────
function AllDessertsView({ initialIdx, onSelect, onBack, tone }: {
  initialIdx: number; onSelect: (i: number) => void; onBack: () => void; tone: { bg: string; fg: string }
}) {
  const [idx, setIdx] = useState(initialIdx)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cw, setCw] = useState(0)
  const [ch, setCh] = useState(0)
  const trackX = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragStartX = useRef(0)
  const trackStart = useRef(0)

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const ro = new ResizeObserver(([e]) => { setCw(e.contentRect.width); setCh(e.contentRect.height) })
    ro.observe(el); return () => ro.disconnect()
  }, [])

  const FRAC = cw < 640 ? 0.82 : 0.46
  const GAP = 24
  const cardW = cw * FRAC
  const cardH = Math.min(520, Math.max(300, ch * 0.8))

  const getTarget = useCallback((i: number) => !cw ? 0 : cw / 2 - cardW / 2 - i * (cardW + GAP), [cw, cardW])
  const snap = useCallback((i: number) => setIdx(Math.max(0, Math.min(i, desserts.length - 1))), [])

  const animateTo = useCallback((end: number) => {
    const el = trackRef.current; if (!el) return
    const start = trackX.current
    const t0 = performance.now(); const dur = 520
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    let raf = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur)
      trackX.current = start + (end - start) * ease(p)
      el.style.transform = `translateX(${trackX.current}px)`
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!cw) return
    const end = getTarget(idx)
    const el = trackRef.current; if (el) { el.style.transform = `translateX(${end}px)`; trackX.current = end }
  }, [idx, getTarget, cw])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      trackX.current = trackStart.current + (e.clientX - dragStartX.current)
      const el = trackRef.current; if (el) el.style.transform = `translateX(${trackX.current}px)`
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return; dragging.current = false
      const diff = e.clientX - dragStartX.current
      if (Math.abs(diff) > DRAG_THRESHOLD) snap(idx + (diff < 0 ? 1 : -1))
      else animateTo(getTarget(idx))
    }
    const onCancel = () => { dragging.current = false; animateTo(getTarget(idx)) }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [idx, getTarget, snap, animateTo])

  const onPD = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true; dragStartX.current = e.clientX; trackStart.current = trackX.current
  }
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 8) snap(idx + (e.deltaX > 0 ? 1 : -1)) }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(desserts.length - 1, i + 1))
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <motion.div key="all" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.55, ease: CINEMATIC }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0 clamp(16px,3vh,28px)', gap: 'clamp(14px,2.5vh,24px)' }}
    >
      <motion.button initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.42, ease: CINEMATIC }}
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 999, background: 'rgba(255,248,236,0.9)', border: `1.5px solid ${tone.fg}`, color: tone.fg, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseOver={e => (e.currentTarget.style.background = 'transparent')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,248,236,0.9)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
        BACK TO PRODUCT VIEW
      </motion.button>

      <div ref={containerRef}
        style={{ flex: 1, width: '100%', overflow: 'hidden', cursor: 'grab', touchAction: 'pan-y', display: 'flex', alignItems: 'center' }}
        onPointerDown={onPD} onWheel={onWheel}
      >
        <div ref={trackRef} style={{ display: 'flex', gap: GAP, userSelect: 'none', willChange: 'transform' }}>
          {desserts.map((dessert, i) => (
            <DessertCard key={dessert.name} dessert={dessert} dist={i - idx} cardW={cardW} cardH={cardH}
              onClick={() => i === idx ? onSelect(i) : snap(i)} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {(['left', 'right'] as const).map(d => (
          <button key={d} onClick={() => snap(d === 'left' ? idx - 1 : idx + 1)}
            disabled={d === 'left' ? idx === 0 : idx === desserts.length - 1}
            style={{ width: 46, height: 46, borderRadius: '50%', border: `1.5px solid ${tone.fg}`, background: 'rgba(255,248,236,0.8)', color: tone.fg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (d === 'left' ? idx === 0 : idx === desserts.length - 1) ? 0.35 : 1, transition: 'opacity 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: d === 'right' ? 'scaleX(-1)' : 'none' }}><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        ))}
      </div>
      <Dots total={desserts.length} active={idx} onDot={snap} tone={tone} />
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DessertsPage({ navigate, onBack, initialSlug }: { navigate: (to: NavRoute) => void; onBack?: () => void; initialSlug?: string }) {
  const { currency, toggle: toggleCurrency } = useCurrency('USD')
  const [view, setView] = useState<View>('hero')
  const [heroIdx, setHeroIdx] = useState(() => {
    if (!initialSlug) return 0
    const i = desserts.findIndex(d => d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === initialSlug || d.shortName.toLowerCase() === initialSlug)
    return i >= 0 ? i : 0
  })
  const [dir, setDir] = useState(1)
  const [allInit, setAllInit] = useState(0)
  const [locked, setLocked] = useState(false)

  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pStartX = useRef<number | null>(null)
  const pStartY = useRef<number | null>(null)
  const isDrag = useRef(false)
  const reducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )

  const dessert = desserts[heroIdx]
  const tone = { bg: shade(dessert.themeColor, 64), fg: shade(dessert.themeColor, -10) }

  const paginate = useCallback((d: number) => {
    setLocked(prev => {
      if (prev) return prev
      setDir(d)
      setHeroIdx(p => (p + d + desserts.length) % desserts.length)
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
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') paginate(-1); else if (e.key === 'ArrowRight') paginate(1) }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [view, paginate])

  // Drag via window listeners — no pointer capture, so arrow clicks keep working
  useEffect(() => {
    if (view !== 'hero') return
    const onMove = (e: PointerEvent) => {
      if (pStartX.current === null) return
      const dx = Math.abs(e.clientX - pStartX.current), dy = Math.abs(e.clientY - (pStartY.current ?? 0))
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

  // Cream + pink canvas colors (constant dessert identity)
  const cream = '#FBF1E2'
  const softPink = '#F7E2DE'
  const choco = shade(dessert.themeColor, -8)

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* White canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#ffffff' }} />

      {/* Soft pink organic blob (top-right) — static */}
      <div style={{ position: 'absolute', top: '-12%', right: '-8%', width: '46vw', height: '46vw', maxWidth: 520, maxHeight: 520, borderRadius: '50% 42% 58% 48% / 48% 58% 42% 52%', background: rgba(shade(dessert.themeColor, 74), 0.5), filter: 'blur(8px)', zIndex: 1, transition: 'background 0.8s cubic-bezier(0.4,0,0.2,1)', pointerEvents: 'none' }} />

      {/* Curved chocolate wave at the bottom — color blends with active dessert, static */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%', zIndex: 2, pointerEvents: 'none' }}>
        <ChocoWave color={rgba(choco, 0.92)} heightPct={46} />
        <ChocoWave color={rgba(shade(dessert.themeColor, 30), 0.5)} heightPct={32} flip />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,4vw,40px)' }}>
        <button onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
          <OlivaLogo size={38} showText={false} />
          <span style={{ color: shade(dessert.themeColor, -22), fontWeight: 800, fontSize: 17, letterSpacing: '0.05em' }}>OLIVA</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,28px)' }}>
          {(['Home', 'Menu'] as const).map(label => (
            <button key={label} onClick={() => navigate(label.toLowerCase() as NavRoute)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: rgba(shade(dessert.themeColor, -22), 0.78), fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = shade(dessert.themeColor, -32))}
              onMouseOut={e => (e.currentTarget.style.color = rgba(shade(dessert.themeColor, -22), 0.78))}
            >{label}</button>
          ))}
          {onBack ? (
            <button onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: tone.bg, border: `1.5px solid ${tone.fg}`, color: tone.fg, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tone.bg }}
              onMouseOut={e => { e.currentTarget.style.background = tone.bg; e.currentTarget.style.color = tone.fg }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to Desserts
            </button>
          ) : (
            <button onClick={() => navigate('menu')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: tone.bg, border: `1.5px solid ${tone.fg}`, color: tone.fg, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tone.bg }}
              onMouseOut={e => { e.currentTarget.style.background = tone.bg; e.currentTarget.style.color = tone.fg }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Menu
            </button>
          )}
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 5 }}>
        <AnimatePresence mode="wait">
          {view === 'hero' ? (
            <HeroView key="hero" idx={heroIdx} dir={dir} locked={locked} reducedMotion={reducedMotion.current} tone={tone}
              currency={currency} onCurrencyToggle={toggleCurrency}
              onPrev={() => paginate(-1)} onNext={() => paginate(1)} onDot={goTo}
              onShowAll={() => { setAllInit(heroIdx); setView('all') }}
              onPointerDown={onPD}
            />
          ) : (
            <AllDessertsView key="all" initialIdx={allInit} tone={tone}
              onSelect={(i) => { setHeroIdx(i); setView('hero') }}
              onBack={() => setView('hero')}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .dz-stage    { gap: 10px !important; padding: 8px 14px !important; }
          .dz-frame    { width: 72vw !important; height: 38vh !important; padding: 10% !important; }
          .dz-frame-img{ width: 90vw !important; height: 48vh !important; }
          .dz-info     { padding: 12px 16px !important; }
        }
        @media (max-height: 640px) and (max-width: 720px) {
          .dz-frame    { width: 68vw !important; height: 32vh !important; }
          .dz-frame-img{ width: 86vw !important; height: 40vh !important; }
          .dz-info     { padding: 10px 14px !important; }
        }
      `}</style>
    </div>
  )
}
