import { motion } from 'framer-motion'
import OlivaLogo from './OlivaLogo'
import { shishaItems } from '../data/shisha'
import CurrencyToggle from './CurrencyToggle'
import { useCurrency } from '../hooks/useCurrency'
import type { Currency } from '../hooks/useCurrency'

type NavRoute = 'home' | 'menu' | 'cold-drinks' | 'desserts' | 'hot-drinks' | 'shisha' | 'shisha-list'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function ImagePlaceholder() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p style={{ margin: 0, fontSize: 8, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', fontWeight: 600 }}>Image Soon</p>
    </div>
  )
}

function ShishaCard({ item, index, currency }: { item: typeof shishaItems[number]; index: number; currency: Currency }) {
  const displayedPrice = currency === 'USD' ? item.price : item.lbpPrice
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.985, transition: { duration: 0.12 } }}
      style={{
        display: 'flex', alignItems: 'center',
        gap: 'clamp(12px,2vw,20px)',
        background: '#f8f8f8',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 20,
        padding: 'clamp(14px,2vh,22px) clamp(14px,2vw,22px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
    >
      {/* Image — smaller, solid dark-green bg, modern dark-green border */}
      <div style={{
        width: 'clamp(56px,7vw,70px)', height: 'clamp(56px,7vw,70px)', flexShrink: 0,
        borderRadius: 13,
        background: '#1a3a2a',
        border: '2px solid #1a3a2a',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.image
          ? <img src={item.image} alt={item.name} draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <ImagePlaceholder />}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ margin: 0, fontSize: 'clamp(14px,1.6vw,19px)', fontWeight: 700, color: '#111', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{item.name}</p>
        <p style={{ margin: 0, fontSize: 'clamp(11px,1vw,13px)', color: 'rgba(0,0,0,0.5)', lineHeight: 1.45 }}>{item.description}</p>
      </div>
      <motion.p
        key={currency}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: EASE }}
        style={{ margin: 0, flexShrink: 0, fontSize: currency === 'LBP' ? 'clamp(13px,1.6vw,18px)' : 'clamp(20px,2.4vw,30px)', fontWeight: 900, color: item.priceColor, letterSpacing: '-0.02em', lineHeight: 1, textShadow: `0 0 20px ${item.priceColor}55`, whiteSpace: 'nowrap' }}
      >
        {displayedPrice}
      </motion.p>
    </motion.div>
  )
}

export default function ShishaPage({ navigate, onBack }: { navigate: (to: NavRoute) => void; onBack?: () => void }) {
  const { currency, toggle } = useCurrency('USD')

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#ffffff' }} />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        style={{ position: 'relative', zIndex: 10, flexShrink: 0, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,4vw,40px)' }}
      >
        {onBack ? (
          <motion.button
            onClick={onBack}
            whileHover={{ x: -2, background: 'rgba(255,255,255,0.22)' }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', color: '#111', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            BACK TO 2ARAGILE
          </motion.button>
        ) : (
          <motion.button
            onClick={() => navigate('menu')}
            whileHover={{ x: -2, background: 'rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', color: '#111', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            MENU
          </motion.button>
        )}
        <button onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <OlivaLogo size={34} showText={false} />
          <span style={{ color: '#111', fontWeight: 800, fontSize: 15, letterSpacing: '0.06em' }}>OLIVA</span>
        </button>
      </motion.nav>

      {/* Main layout */}
      <div className="sp-main" style={{ flex: 1, position: 'relative', zIndex: 2, display: 'flex', overflow: 'hidden', padding: 'clamp(12px,2.2vh,28px) clamp(16px,4vw,52px) clamp(14px,2.2vh,24px)', gap: 'clamp(20px,4vw,60px)', minHeight: 0 }}>

        {/* Hero column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
          className="sp-hero"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}
        >
          <div style={{ marginBottom: 'clamp(4px,1vh,12px)', opacity: 0.18 }}>
            <img src="/shisha.png" alt="" aria-hidden draggable={false} style={{ width: 'clamp(44px,5.5vw,68px)', height: 'auto', filter: 'invert(1)' }} />
          </div>
          <p style={{ margin: '0 0 clamp(6px,1vh,12px)', fontSize: 'clamp(9px,1vw,11px)', fontWeight: 700, letterSpacing: '0.38em', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
            Café &amp; Lounge
          </p>
          <h1 style={{ margin: '0 0 clamp(8px,1.2vh,14px)', fontSize: 'clamp(44px,7vw,96px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.93, color: '#111' }}>
            SHISHA
          </h1>
          <div style={{ width: 'clamp(36px,4vw,54px)', height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#D4A017,#f5c540)', marginBottom: 'clamp(10px,1.6vh,20px)' }} />
          <p style={{ margin: '0 0 clamp(16px,2.6vh,32px)', fontSize: 'clamp(13px,1.3vw,17px)', color: 'rgba(0,0,0,0.55)', lineHeight: 1.6, maxWidth: 270 }}>
            Relax and enjoy your favorite flavor.
          </p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}>
            <p style={{ margin: '0 0 4px', fontSize: 'clamp(9px,0.9vw,10px)', fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(212,160,23,0.65)', textTransform: 'uppercase' }}>Starting from</p>
            <p style={{ margin: 0, fontSize: 'clamp(30px,5vw,64px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: '#D4A017', textShadow: '0 0 40px rgba(212,160,23,0.5), 0 2px 14px rgba(0,0,0,0.35)' }}>
              $2.99
            </p>
          </motion.div>
        </motion.div>

        {/* Products column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(0,0,0,0.38)', textTransform: 'uppercase' }}
            >
              Our Flavors
            </motion.p>
            <CurrencyToggle currency={currency} onToggle={toggle} />
          </div>
          <div className="sp-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 'clamp(10px,1.8vh,16px)', paddingRight: 2 }}>
            {shishaItems.map((item, i) => (
              <ShishaCard key={item.id} item={item} index={i} currency={currency} />
            ))}
            <div style={{ height: 8, flexShrink: 0 }} />
          </div>
        </div>
      </div>

      <style>{`
        .sp-main { flex-direction: row; align-items: center; }
        .sp-hero { width: clamp(240px, 38vw, 400px); }
        @media (max-width: 640px) {
          .sp-main { flex-direction: column; align-items: stretch; }
          .sp-hero { width: 100% !important; justify-content: flex-start; flex-shrink: 0; }
        }
        .sp-scroll::-webkit-scrollbar { display: none; }
        .sp-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  )
}
