import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Subcategory, SubcategoryDrink } from '../data/subcategories'
import CurrencyToggle from './CurrencyToggle'
import { useCurrency } from '../hooks/useCurrency'
import type { Currency } from '../hooks/useCurrency'
import { getImageForProduct } from '../utils/imageMatching'
import { imageAssets } from '../utils/imageAssets'
import { ViewRecipeButton } from './ViewRecipeButton'
import { DEFAULT_EXTRA_CALORIES, getStaticCalories } from '../data/nutrition'
import { getDefaultProductExtras, getMenuExtra, formatLbp, formatUsdFromLbp, type MenuExtraName } from '../data/menuExtras'

export interface CategoryTheme {
  bgGradient: string
  glowColor: string
  text: string
  subtext: string
  accent: string
}

// ─── Base palette ─────────────────────────────────────────────────────────────
const PAGE_BG    = '#F7F3E8'  // creamy white — main page background
const SURFACE    = '#EEF0E4'  // olive white — default button background
const OLIVA_GRN  = '#596B3D'  // Oliva green — back button, small accents
const DARK_TEXT  = '#1a1a1a'  // page title
const MUTED_TEXT = 'rgba(0,0,0,0.58)'

type NavRoute = 'home' | 'menu'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

// ─── Hero Gallery ─────────────────────────────────────────────────────────────
function HeroGallery({ images, accent }: { images: string[]; accent: string }) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [hovered, setHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const total = images.length

  const go = useCallback((next: number, direction: number) => {
    setDir(direction)
    setIndex((next + total) % total)
  }, [total])

  // Keep navigation responsive: only warm the next couple of slides when the
  // browser is idle instead of decoding the whole gallery during page mount.
  useEffect(() => {
    const schedule = window.requestIdleCallback
      ? (callback: () => void) => window.requestIdleCallback(callback, { timeout: 1200 })
      : (callback: () => void) => window.setTimeout(callback, 500)
    const cancel = schedule(() => {
      images.slice(0, 3).forEach(src => {
        const img = new Image()
        img.decoding = 'async'
        img.src = src
      })
    })
    return () => {
      if (typeof cancel === 'number') window.clearTimeout(cancel)
    }
  }, [images])

  useEffect(() => {
    if (hovered) return
    const id = setInterval(() => go(index + 1, 1), 3500)
    return () => clearInterval(id)
  }, [hovered, index, go])

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    dx < 0 ? go(index + 1, 1) : go(index - 1, -1)
  }

  const slideV = {
    enter: (d: number) => ({ x: d > 0 ? '55%' : '-55%', opacity: 0, scale: 0.88 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
    exit: (d: number) => ({ x: d > 0 ? '-55%' : '55%', opacity: 0, scale: 0.88, transition: { duration: 0.3, ease: [0.4, 0, 0.8, 1] as [number,number,number,number] } }),
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'relative',
        width: 'clamp(380px,66vw,760px)',
        aspectRatio: '16/9',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#111',
        boxShadow: `0 8px 40px rgba(0,0,0,0.22), 0 0 0 3px ${accent}40`,
        flexShrink: 0,
      }}
    >
      {/* Slides */}
      <AnimatePresence custom={dir} mode="popLayout" initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          alt={`gallery ${index + 1}`}
          draggable={false}
          custom={dir}
          variants={slideV}
          initial="enter"
          animate="center"
          exit="exit"
           loading={index === 0 ? 'eager' : 'lazy'}
           decoding="async"
          fetchPriority={index === 0 ? 'high' : 'auto'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', willChange: 'transform, opacity' }}
        />
      </AnimatePresence>

      {/* Left arrow */}
      <button
        onClick={() => go(index - 1, -1)}
        aria-label="Previous"
        style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0.45, transition: 'opacity 0.25s', zIndex: 10, padding: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={() => go(index + 1, 1)}
        aria-label="Next"
        style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0.45, transition: 'opacity 0.25s', zIndex: 10, padding: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      {/* Dots */}
      <div style={{
        position: 'absolute', bottom: 10, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 5, zIndex: 10,
      }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => go(i, i > index ? 1 : -1)}
            style={{
              width: i === index ? 18 : 6, height: 6, borderRadius: 3, padding: 0, border: 'none', cursor: 'pointer',
              background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Price sticky note ────────────────────────────────────────────────────────
function PriceStickyNote({ price, lbpPrice, totalLbp, currency }: { price: string; lbpPrice: string; totalLbp?: number; currency: Currency }) {
  const displayedPrice = totalLbp !== undefined
    ? currency === 'USD' ? formatUsdFromLbp(totalLbp) : formatLbp(totalLbp)
    : currency === 'USD' ? price : lbpPrice
  const isLBP = currency === 'LBP'

  return (
    <div style={{ position: 'relative', flexShrink: 0, transform: 'rotate(3deg)', transformOrigin: 'center top' }}>
      {/* Tape strip */}
      <div style={{
        position: 'absolute', top: -9, left: '50%',
        transform: 'translateX(-50%) rotate(-5deg)',
        width: 40, height: 16,
        background: 'rgba(255,255,255,0.34)',
        borderLeft: '1px solid rgba(255,255,255,0.25)',
        borderRight: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
      {/* Note paper */}
      <motion.div
        key={currency}
        initial={{ rotateY: 90, opacity: 0, scale: 0.85 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{
          minWidth: isLBP ? 'clamp(100px,14vw,140px)' : 'clamp(52px,8vw,68px)',
          padding: isLBP
            ? 'clamp(10px,1.4vw,14px) clamp(10px,1.6vw,14px)'
            : 'clamp(12px,1.6vw,16px) clamp(12px,1.8vw,18px)',
          background: isLBP
            ? 'linear-gradient(155deg, #fff5b0, #f5e04a)'
            : 'linear-gradient(155deg, #ffe994, #fcd968)',
          color: '#3a2c0c',
          borderRadius: 3,
          boxShadow: '0 8px 16px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.5)',
          textAlign: 'center',
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: isLBP ? 'clamp(11px,1.3vw,15px)' : 'clamp(17px,2vw,24px)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
      >
        {displayedPrice}
      </motion.div>
    </div>
  )
}

// ─── Individual drink card ────────────────────────────────────────────────────
function DrinkCard({ drink, sub, index, currency, isMobile }: { drink: SubcategoryDrink; sub: Subcategory; theme?: CategoryTheme; index: number; currency: Currency; isMobile: boolean }) {
  const [open, setOpen] = useState(false)
  const [selectedExtras, setSelectedExtras] = useState<MenuExtraName[]>([])
  const displayImage = getImageForProduct(drink.name, drink.image ?? undefined)
  const baseCalories = drink.calories ?? getStaticCalories(drink.name)
  const extras = (drink.extras ?? getDefaultProductExtras(drink.name, sub.id))
    .filter((name): name is MenuExtraName => Boolean(getMenuExtra(name)))
  const baseLbp = drink.priceLbp ?? (parseInt((drink.lbpPrice ?? '').replace(/[^0-9]/g, ''), 10) || 0)
  const extraLbp = selectedExtras.reduce((sum, name) => sum + (getMenuExtra(name)?.priceLbp ?? 0), 0)
  const totalLbp = baseLbp + extraLbp
  const totalCalories = baseCalories + selectedExtras.reduce((sum, extra) => sum + (drink.extraCalories?.[extra] ?? DEFAULT_EXTRA_CALORIES[extra] ?? 0), 0)
  const nutritionItems = [
    { label: 'Protein', value: drink.proteinGrams ? `${drink.proteinGrams}g` : 'Not listed', icon: '💪', tone: '#DCE9C5' },
    { label: 'Carbs', value: drink.carbsGrams ? `${drink.carbsGrams}g` : 'Not listed', icon: '⚡', tone: '#F6E6B4' },
    { label: 'Fat', value: drink.fatGrams ? `${drink.fatGrams}g` : 'Not listed', icon: '🥑', tone: '#F2D9C8' },
  ]
  const soldOut = Boolean(drink.soldOut)
  const hasDetails = Boolean(
    drink.recipe ||
    baseCalories ||
    extras.length ||
    soldOut ||
    drink.proteinGrams ||
    drink.carbsGrams ||
    drink.fatGrams,
  )

  return (
    <motion.div
      className="clp-product-card"
      initial={isMobile ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={isMobile ? { duration: 0 } : { duration: 0.3, ease: EASE, delay: 0.08 + index * 0.05 }}
      style={{
        display: 'flex', flexDirection: 'column',
        background: '#f8f8f8',
        border: `1px solid ${soldOut ? '#b91c1c55' : open ? '#596B3D40' : 'rgba(0,0,0,0.07)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: soldOut ? '0 4px 16px rgba(185,28,28,0.08)' : open ? '0 6px 20px rgba(89,107,61,0.15)' : '0 4px 16px rgba(0,0,0,0.07)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Top row: image · name · price sticky note */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px,2vw,18px)',
        padding: 'clamp(14px,2vh,20px)',
      }}>
        {/* Image */}
        <div style={{
          flexShrink: 0,
          width: 'clamp(72px,12vw,96px)', height: 'clamp(72px,12vw,96px)',
          borderRadius: 14,
          background: '#e8f0eb',
          border: '1px solid rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {displayImage ? (
           <img src={displayImage} alt={drink.name} draggable={false}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
               style={{ width: '100%', height: '100%', objectFit: 'cover', filter: soldOut ? 'grayscale(0.75)' : undefined, opacity: soldOut ? 0.62 : 1 }} />
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          )}
        </div>

        {/* Name */}
        <h4 style={{
          flex: 1, minWidth: 0, margin: 0, alignSelf: 'center',
           fontSize: 'clamp(18px,2.6vw,26px)', fontWeight: 800, color: soldOut ? '#991b1b' : '#111',
          lineHeight: 1.2, letterSpacing: '-0.01em',
        }}>{drink.name}</h4>

        {/* Price sticky note */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <PriceStickyNote price={drink.price} lbpPrice={drink.lbpPrice} totalLbp={selectedExtras.length ? totalLbp : undefined} currency={currency} />
          {soldOut && <span style={{ color: '#b91c1c', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Out of stock</span>}
        </div>
      </div>

      {/* View Recipe button — only shown when recipe exists */}
      {hasDetails && (
        <div style={{ padding: '0 clamp(14px,2vh,20px) clamp(14px,2vh,20px)' }}>
          <ViewRecipeButton
            isExpanded={open}
            disabled={soldOut}
            onClick={() => { if (!soldOut) setOpen(prev => !prev) }}
          />

          {/* Smooth animated recipe panel */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="recipe"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                   padding: 'clamp(14px,1.7vh,18px)',
                   background: 'linear-gradient(145deg, #f8f5eb, #eef2e5)',
                   border: '1px solid #596B3D55',
                   borderRadius: 16,
                   boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
                }}>
                   {/* Calorie counter */}
                   <div style={{
                     display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                     padding: '12px 14px', marginBottom: 16, borderRadius: 13,
                     background: '#596B3D', color: '#fff',
                     boxShadow: '0 8px 18px rgba(89,107,61,0.2)',
                   }}>
                     <div>
                       <p style={{ margin: 0, fontFamily: '"Manrope", sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.72 }}>Your total</p>
                       <motion.div key={totalCalories} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontFamily: '"Manrope", sans-serif', fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>
                         {totalCalories.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.76 }}>CAL</span>
                       </motion.div>
                     </div>
                     <span style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.13)', fontSize: 20 }}>◒</span>
                   </div>
                    {/* Nutrition callouts */}
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7, marginBottom: 15 }}>
                     {nutritionItems.map((item) => (
                       <div key={item.label} style={{
                         minWidth: 0, padding: '9px 7px', borderRadius: 12, background: item.tone,
                         border: '1px solid rgba(89,107,61,0.12)', textAlign: 'center',
                       }}>
                         <div style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</div>
                         <div style={{ marginTop: 5, color: '#596B3D', fontFamily: '"Manrope", sans-serif', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.label}</div>
                         <div style={{ marginTop: 2, color: item.value === 'Not listed' ? 'rgba(52,65,42,0.5)' : '#27331f', fontFamily: '"Manrope", sans-serif', fontSize: 11, fontWeight: 850, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</div>
                       </div>
                     ))}
                   </div>
                  {/* Ingredients */}
                  <p style={{
                    margin: '0 0 8px',
                     fontFamily: '"Manrope", sans-serif',
                     fontSize: 10, fontWeight: 800,
                     letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: '#596B3D',
                    opacity: 0.9,
                  }}>Ingredients</p>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 10px', marginBottom: 14 }}>
                     {(drink.recipe ?? '').split(' · ').filter(Boolean).map((item, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                         padding: '7px 11px',
                         background: 'rgba(255,255,255,0.82)',
                         border: '1px solid rgba(89,107,61,0.18)',
                         borderRadius: 10,
                         fontFamily: '"Manrope", sans-serif',
                        fontSize: 'clamp(11px,1.2vw,13px)',
                         fontWeight: 650,
                         color: '#34412a',
                         boxShadow: '0 2px 6px rgba(40,55,30,0.05)',
                      }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#596B3D', flexShrink: 0 }} />
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Optional Extras */}
                  {(() => {
                    if (extras.length === 0) return null
                    
                    return (
                      <>
                        <p style={{
                           margin: '12px 0 9px',
                           fontFamily: '"Manrope", sans-serif',
                           fontSize: 10, fontWeight: 800,
                           letterSpacing: '0.16em', textTransform: 'uppercase',
                          color: '#596B3D',
                          opacity: 0.9,
                        }}>Optional Extras</p>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                           {extras.map((extra) => {
                              const definition = getMenuExtra(extra)
                              if (!definition) return null
                              const isSelected = selectedExtras.includes(extra)
                              return (
                             <motion.button
                                key={extra}
                               type="button"
                               whileTap={{ scale: 0.94 }}
                                onClick={() => setSelectedExtras(prev => isSelected ? prev.filter(item => item !== extra) : [...prev, extra])}
                               style={{
                                 display: 'inline-flex', alignItems: 'center', gap: 6,
                                 padding: '8px 11px',
                                  background: isSelected ? '#596B3D' : '#fff',
                                  border: `1px solid ${isSelected ? '#596B3D' : '#596B3D50'}`,
                                 borderRadius: 10,
                                 fontFamily: '"Manrope", sans-serif',
                                 fontSize: 'clamp(10px,1.1vw,12px)',
                                  color: isSelected ? '#fff' : '#596B3D',
                                 fontWeight: 750,
                                 cursor: 'pointer',
                                 transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
                                  boxShadow: isSelected ? '0 5px 12px rgba(89,107,61,0.2)' : 'none',
                               }}
                             >
                                <span style={{ fontSize: 15, fontWeight: 800 }}>{isSelected ? '✓' : '+'}</span>
                                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
                                  <span>{definition.name}</span>
                                  <span style={{ opacity: 0.68, fontSize: 9, fontWeight: 700 }}>+{formatLbp(definition.priceLbp)} · +{drink.extraCalories?.[extra] ?? definition.calories} cal</span>
                                </span>
                             </motion.button>
                              )
                           })}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CategoryListPage({
  title, subtitle, theme, subcategories, navigate, onBack, heroImages,
}: {
  title: string
  subtitle: string
  theme: CategoryTheme
  subcategories: Subcategory[]
  navigate: (to: NavRoute) => void
  onBack: () => void
  heroImages?: string[]
}) {
  const { currency, toggle } = useCurrency('LBP')
  const subcategoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  const scrollToSubcategory = (subcategoryId: string) => {
    const element = subcategoryRefs.current[subcategoryId]
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: PAGE_BG,
    }}>
      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 10, height: 68, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
        padding: '0 clamp(16px,4vw,40px)',
      }}>
        <button onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(89,107,61,0.08)',
            border: `1px solid ${OLIVA_GRN}`, borderRadius: 999,
            padding: '10px 20px', cursor: 'pointer',
            color: OLIVA_GRN, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
            transition: 'transform 0.2s ease, background 0.2s ease',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          BACK
        </button>
      </nav>

      {/* Scrollable content container */}
      <div ref={scrollContainerRef} className="clp-scroll" style={{
        flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{ textAlign: 'center', padding: 'clamp(4px,1vh,12px) clamp(16px,4vw,40px) 0' }}
        >
          <p style={{
            margin: 0, fontSize: 'clamp(11px,1.4vw,14px)', fontWeight: 800, letterSpacing: '0.35em',
            color: theme.accent, textTransform: 'uppercase',
          }}>{subtitle}</p>

          {/* Hero: gallery or logo */}
          <div style={{
            margin: 'clamp(12px,2vh,20px) 0',
            display: 'flex',
            justifyContent: 'center',
            perspective: '1200px',
          }}>
            {heroImages && heroImages.length > 0 ? (
              <HeroGallery images={heroImages} accent={theme.accent} />
            ) : (
              <div style={{
                width: 'clamp(200px,26vw,300px)',
                height: 'clamp(200px,26vw,300px)',
                borderRadius: '50%',
                background: theme.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img
                  src={imageAssets.logo}
                  alt="Oliva"
                  className="logo-3d"
                  style={{
                    width: '78%',
                    height: '78%',
                    objectFit: 'contain',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </div>

          <h1 style={{
            margin: '4px 0 0', fontSize: 'clamp(36px,7vw,72px)', fontWeight: 900,
            color: DARK_TEXT, letterSpacing: '-0.03em', lineHeight: 1,
          }}>{title}</h1>
        </motion.div>

        {/* Subcategory Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          style={{
            padding: 'clamp(8px,1.5vh,14px) clamp(16px,4vw,40px)',
            display: 'flex',
            gap: 'clamp(6px,1vw,12px)',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
          className="subcat-nav"
        >
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => scrollToSubcategory(sub.id)}
              style={{
                whiteSpace: 'nowrap',
                flexShrink: 0,
                padding: 'clamp(8px,1.2vh,12px) clamp(14px,2vw,18px)',
                borderRadius: 20,
                border: `1.5px solid ${theme.accent}`,
                background: SURFACE,
                color: theme.accent,
                fontSize: 'clamp(12px,1.4vw,14px)',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.accent
                e.currentTarget.style.color = PAGE_BG
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = SURFACE
                e.currentTarget.style.color = theme.accent
              }}
            >
              {sub.name}
            </button>
          ))}
        </motion.div>

        {/* Currency Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 'clamp(12px,2vh,18px) clamp(16px,4vw,40px) 0',
        }}>
          <CurrencyToggle currency={currency} onToggle={toggle} />
        </div>

        {/* Grouped Product List */}
        <div style={{
          padding: 'clamp(12px,2vh,24px) clamp(16px,4vw,40px) clamp(20px,3vh,40px)',
          maxWidth: 960,
          margin: '0 auto',
          width: '100%',
        }}>
          {subcategories.map((sub, i) => (
            <motion.div
              className="clp-subcategory"
              key={sub.id}
              ref={(el) => {
                if (el) subcategoryRefs.current[sub.id] = el
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={isMobile ? { duration: 0 } : { duration: 0.4, ease: EASE, delay: Math.min(i * 0.08, 0.4) }}
              style={{
                marginBottom: 'clamp(28px,4vh,48px)',
                scrollMarginTop: '100px',
              }}
            >
              {/* Subcategory Header */}
              <div style={{
                marginBottom: 'clamp(16px,2.5vh,24px)',
              }}>
                <div
                  style={{
                    width: 44,
                    height: 4,
                    borderRadius: 3,
                    background: sub.accentColor,
                    marginBottom: 10,
                  }}
                />
                <h3
                  style={{
                    margin: '4px 0 0',
                    fontSize: 'clamp(26px,3.4vw,36px)',
                    fontWeight: 900,
                    color: sub.accentColor,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {sub.name}
                </h3>
                {sub.description && (
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: 'clamp(13px,1.6vw,16px)',
                      color: MUTED_TEXT,
                      lineHeight: 1.5,
                    }}
                  >
                    {sub.description}
                  </p>
                )}
              </div>

              {/* Products Grid */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(12px,1.8vh,18px)',
                }}
              >
                {sub.drinks.map((drink, index) => (
                  <DrinkCard
                    key={drink.name}
                    drink={drink}
                    sub={sub}
                    index={index}
                    currency={currency}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .clp-scroll::-webkit-scrollbar { width: 4px; }
        .clp-scroll::-webkit-scrollbar-track { background: transparent; }
        .clp-scroll::-webkit-scrollbar-thumb { background: rgba(89,107,61,0.2); border-radius: 2px; }
        .clp-scroll { scrollbar-width: thin; scrollbar-color: rgba(89,107,61,0.2) transparent; }
        .clp-scroll { overscroll-behavior-y: contain; }
        .clp-product-card { content-visibility: auto; contain-intrinsic-size: 190px; }
        .clp-subcategory { content-visibility: auto; contain-intrinsic-size: 420px; }
        .subcat-nav::-webkit-scrollbar { height: 3px; }
        .subcat-nav::-webkit-scrollbar-track { background: transparent; }
        .subcat-nav::-webkit-scrollbar-thumb { background: rgba(89,107,61,0.15); border-radius: 2px; }
        .subcat-nav { scrollbar-width: thin; scrollbar-color: rgba(89,107,61,0.15) transparent; }
      `}</style>
    </div>
  )
}
