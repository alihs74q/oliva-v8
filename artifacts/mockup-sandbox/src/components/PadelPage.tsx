import { motion } from 'framer-motion'
import type { CategoryTheme } from './CategoryListPage'
import CurrencyToggle from './CurrencyToggle'
import { useCurrency } from '../hooks/useCurrency'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

interface PadelItem {
  title: string
  description: string
  price: string
  lbpPrice: string
  image: string
}

const PADEL_ITEMS: PadelItem[] = [
  { title: '1H Court', description: 'Full hour of play', price: '$20', lbpPrice: '1,800,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9vR3KMaQrDDBQVuX3Ksa5fIbkllRIY.png' },
  { title: '1.5H Court', description: 'Extended playtime', price: '$30', lbpPrice: '2,700,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bnWlzxcRfj4wXowKGA3LnfM1trFRSt.png' },
  { title: '1H Coaching', description: 'Professional lessons', price: '$30', lbpPrice: '2,700,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EmI7Im7lNY0MMRPuj1rn3rtLqw3ZsD.png' },
  { title: 'Grip', description: 'Premium quality', price: '$5', lbpPrice: '450,000 LBP', image: 'https://images.pexels.com/photos/3808506/pexels-photo-3808506.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { title: 'Ball Set', description: '3 professional balls', price: '$9.99', lbpPrice: '900,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tASZy37aAXZT8QHk1CUzw40vUE2xQy.png' },
]

export default function PadelPage({
  theme, onBack,
}: {
  theme: CategoryTheme
  onBack: () => void
}) {
  const { currency, toggle } = useCurrency('USD')

  return (
    <div style={{
      position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: theme.bgGradient,
    }}>
      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 10, height: 68, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
        <CurrencyToggle currency={currency} onToggle={toggle} />
      </nav>

      {/* Scrollable content */}
      <div className="padel-scroll" style={{
        flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Header with Image */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{
            position: 'relative',
            height: 'clamp(240px, 35vh, 380px)',
            marginBottom: 'clamp(20px, 3vh, 40px)',
            borderRadius: 'clamp(12px, 2vw, 20px)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ICoaEDFS2acvkeYqAp1z1uT2HyEtlp.png"
            alt="Oliva Padel Court"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(6,182,212,0.3) 100%)',
          }} />
        </motion.div>

        {/* Header Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
          style={{
            textAlign: 'center',
            padding: '0 clamp(16px,4vw,40px) clamp(12px,2vh,24px)',
          }}
        >
          <p style={{
            margin: 0, fontSize: 'clamp(12px,1.5vw,14px)', fontWeight: 700, letterSpacing: '0.15em',
            color: theme.accent, textTransform: 'uppercase',
          }}>Court & Coaching</p>
          
          <h1 style={{
            margin: 'clamp(8px,1.5vh,12px) 0 0', fontSize: 'clamp(40px,6vw,60px)', fontWeight: 900,
            color: theme.text, letterSpacing: '-0.02em', lineHeight: 1, fontFamily: "'Segoe UI', system-ui, sans-serif",
          }}>Padel</h1>
        </motion.div>

        {/* Animated Logo */}
        <div style={{
          margin: 'clamp(16px,2vh,24px) 0',
          display: 'flex',
          justifyContent: 'center',
          perspective: '1200px',
        }}>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%284%29-XnkqrdTFPK1XQiDPMZmAUqfH4w4IPy.png"
            alt="Oliva"
            className="logo-3d"
            style={{
              height: 'clamp(120px,16vw,160px)',
              width: 'auto',
              objectFit: 'contain',
              filter: `drop-shadow(0 6px 16px ${theme.glowColor}40)`,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
          />
        </div>

        {/* Items Grid */}
        <div style={{
          padding: 'clamp(20px,3vh,40px) clamp(16px,4vw,40px)',
          maxWidth: 1000, margin: '0 auto', width: '100%',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(16px, 3vw, 24px)',
          }}>
            {PADEL_ITEMS.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: EASE }}
                style={{
                  background: `rgba(6, 182, 212, 0.08)`,
                  border: `2px solid ${theme.accent}60`,
                  borderRadius: '16px',
                  padding: 'clamp(24px, 4vw, 32px)',
                  cursor: 'pointer',
                  transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                  gap: 'clamp(16px, 3vw, 24px)',
                  minHeight: '140px',
                }}
                whileHover={{
                  background: `rgba(6, 182, 212, 0.15)`,
                  borderColor: theme.accent,
                  transform: 'translateY(-6px)',
                  boxShadow: `0 8px 24px ${theme.accent}30`,
                }}
              >
                {/* Left side: Text */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flex: 1,
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 8px',
                      fontSize: 'clamp(22px, 2.8vw, 28px)',
                      fontWeight: 800,
                      color: theme.accent,
                      lineHeight: 1.1,
                      fontFamily: "'Segoe UI', system-ui, sans-serif",
                      letterSpacing: '-0.01em',
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      margin: '0 0 16px',
                      fontSize: 'clamp(14px, 1.8vw, 16px)',
                      color: theme.subtext,
                      lineHeight: 1.4,
                      fontWeight: 500,
                      fontFamily: "'Segoe UI', system-ui, sans-serif",
                    }}>
                      {item.description}
                    </p>
                  </div>
                  <motion.p
                    key={currency}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      margin: 0,
                      fontSize: currency === 'LBP' ? 'clamp(14px, 2vw, 18px)' : 'clamp(28px, 5vw, 36px)',
                      fontWeight: 900,
                      color: theme.accent,
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currency === 'USD' ? item.price : item.lbpPrice}
                  </motion.p>
                </div>

                {/* Right side: Image */}
                <div style={{
                  width: 'clamp(100px, 20%, 140px)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer spacing */}
        <div style={{ height: 'clamp(40px, 5vh, 60px)' }} />
      </div>
    </div>
  )
}
