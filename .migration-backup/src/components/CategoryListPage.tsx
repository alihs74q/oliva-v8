import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Subcategory, SubcategoryDrink } from '../data/subcategories'
import CurrencyToggle from './CurrencyToggle'
import { useCurrency } from '../hooks/useCurrency'
import type { Currency } from '../hooks/useCurrency'

export interface CategoryTheme {
  bgGradient: string
  glowColor: string
  text: string
  subtext: string
  accent: string
}

type NavRoute = 'home' | 'menu'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

export default function CategoryListPage({
  title, subtitle, theme, subcategories, navigate, onBack,
}: {
  title: string
  subtitle: string
  theme: CategoryTheme
  subcategories: Subcategory[]
  navigate: (to: NavRoute) => void
  onBack: () => void
}) {
  const [openSub, setOpenSub] = useState<Subcategory | null>(null)

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: theme.bgGradient,
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
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999,
            padding: '10px 20px', cursor: 'pointer',
            color: theme.text, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
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
      <div className="clp-scroll" style={{
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
        
        {/* Animated Logo */}
        <div style={{
          margin: 'clamp(12px,2vh,20px) 0',
          display: 'flex',
          justifyContent: 'center',
          perspective: '1200px',
        }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%284%29-XnkqrdTFPK1XQiDPMZmAUqfH4w4IPy.png"
            alt="Oliva"
            className="logo-3d"
            style={{
              height: 'clamp(160px,24vw,280px)',
              width: 'auto',
              objectFit: 'contain',
              filter: `drop-shadow(0 8px 24px ${theme.glowColor}60)`,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          />
        </div>
        
          <h1 style={{
            margin: '4px 0 0', fontSize: 'clamp(36px,7vw,72px)', fontWeight: 900,
            color: theme.text, letterSpacing: '-0.03em', lineHeight: 1,
          }}>{title}</h1>
        </motion.div>

        {/* Subcategory grid */}
        <div style={{
          padding: 'clamp(12px,2vh,24px) clamp(16px,4vw,40px) clamp(20px,3vh,40px)',
          maxWidth: 960, margin: '0 auto', width: '100%',
        }}>
        <div className="subcat-grid" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(16px,2.5vh,28px)',
          width: '100%',
        }}>
          {subcategories.map((sub, i) => {
            const isPlaceholder = sub.drinks.length === 0
            return (
              <motion.button
                key={sub.id}
                onClick={() => !isPlaceholder && setOpenSub(sub)}
                disabled={isPlaceholder}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: Math.min(i * 0.05, 0.3) }}
                whileTap={isPlaceholder ? {} : { scale: 0.97, transition: { duration: 0.12 } }}
                style={{
                  position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(145deg, ${sub.themeColor}40, ${sub.themeColor}15)`,
                  border: `1.5px solid ${isPlaceholder ? 'rgba(255,255,255,0.1)' : `${sub.accentColor}55`}`,
                  borderRadius: 24,
                  padding: 'clamp(16px,2.5vh,24px)',
                  cursor: isPlaceholder ? 'default' : 'pointer',
                  boxShadow: isPlaceholder ? 'none' : `0 8px 24px ${sub.themeColor}30`,
                  textAlign: 'left',
                  opacity: isPlaceholder ? 0.45 : 1,
                  display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 'clamp(12px,2vw,20px)',
                  minHeight: '180px',
                  willChange: 'transform',
                }}
              >
                {/* Left: Text content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ width: 44, height: 4, borderRadius: 3, background: sub.accentColor, opacity: 0.8 }} />
                  <div>
                    <h3 style={{
                      margin: 0, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900,
                      color: theme.text, letterSpacing: '-0.02em', lineHeight: 1.1,
                    }}>{sub.name}</h3>
                    <p style={{
                      margin: '6px 0 0', fontSize: 'clamp(14px,1.8vw,18px)', color: theme.subtext,
                      lineHeight: 1.5, fontWeight: 500,
                    }}>{sub.description}</p>
                  </div>
                  {!isPlaceholder && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      color: sub.accentColor, fontSize: 13, fontWeight: 800, letterSpacing: '0.04em',
                    }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 30, height: 30, borderRadius: '50%',
                        background: `${sub.accentColor}22`, border: `1px solid ${sub.accentColor}55`,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </span>
                      Press to see
                    </div>
                  )}
                </div>

                {/* Right: Image — smaller, solid bg, modern dark-green border */}
                <div style={{
                  flexShrink: 0,
                  width: 'clamp(100px,15vw,130px)',
                  height: 'clamp(100px,15vw,130px)',
                  borderRadius: 16,
                  background: sub.image ? '#1a3a2a' : `${sub.accentColor}18`,
                  border: '2px solid #1a3a2a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}>
                  {sub.image ? (
                    <img src={sub.image} alt={sub.name} draggable={false}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={sub.accentColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
        </div>
      </div>

      {/* Drink popup modal */}
      <AnimatePresence>
        {openSub && (
          <DrinkModal sub={openSub} theme={theme} onClose={() => setOpenSub(null)} />
        )}
      </AnimatePresence>

      <style>{`
        .clp-scroll::-webkit-scrollbar { width: 4px; }
        .clp-scroll::-webkit-scrollbar-track { background: transparent; }
        .clp-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        .clp-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
        @media (max-width: 640px) {
          .subcat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Drink popup modal ────────────�����───────────────────────────────────��──────
function DrinkModal({ sub, theme, onClose }: { sub: Subcategory; theme: CategoryTheme; onClose: () => void }) {
  const { currency, toggle } = useCurrency('USD')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,2vw,24px)' }}
    >
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{
          position: 'relative', zIndex: 1,
          width: 'min(620px, 94vw)',
          maxHeight: 'calc(100svh - 48px)',
          background: '#ffffff',
          border: `1.5px solid ${sub.accentColor}33`,
          borderRadius: 'clamp(22px,3vw,32px)',
          padding: 'clamp(20px,3vw,36px)',
          display: 'flex', flexDirection: 'column', gap: 'clamp(14px,2vh,20px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxShadow: `0 20px 60px rgba(0,0,0,0.25)`,
          willChange: 'transform',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ width: 44, height: 4, borderRadius: 3, background: sub.accentColor, marginBottom: 10 }} />
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase' }}>Menu</p>
            <h3 style={{ margin: '4px 0 0', fontSize: 'clamp(26px,3.4vw,36px)', fontWeight: 900, color: '#111', letterSpacing: '-0.02em' }}>{sub.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#333', transition: 'background 0.2s ease' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.12)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Currency toggle — above drink list */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
          <CurrencyToggle currency={currency} onToggle={toggle} />
        </div>

        {/* Drink list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.8vh,18px)' }}>
          {sub.drinks.map((drink, i) => (
            <DrinkCard key={drink.name} drink={drink} sub={sub} theme={theme} index={i} currency={currency} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Price sticky note ────────────────────────────────────────────────────────
function PriceStickyNote({ price, lbpPrice, currency }: { price: string; lbpPrice: string; currency: Currency }) {
  const displayedPrice = currency === 'USD' ? price : lbpPrice
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
function DrinkCard({ drink, index, currency }: { drink: SubcategoryDrink; sub: Subcategory; theme: CategoryTheme; index: number; currency: Currency }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: 0.08 + index * 0.05 }}
      style={{
        display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.8vh,16px)',
        background: '#f8f8f8',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 20,
        padding: 'clamp(14px,2vh,20px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
      }}
    >
      {/* Top row: image · name · price sticky note */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px,2vw,18px)' }}>
        {/* Image — smaller, modern light rim */}
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
          {drink.image ? (
            <img src={drink.image} alt={drink.name} draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          fontSize: 'clamp(18px,2.6vw,26px)', fontWeight: 800, color: '#111',
          lineHeight: 1.2, letterSpacing: '-0.01em',
        }}>{drink.name}</h4>

        {/* Price sticky note */}
        <PriceStickyNote price={drink.price} lbpPrice={drink.lbpPrice} currency={currency} />
      </div>
    </motion.div>
  )
}
