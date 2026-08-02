import { useState } from 'react'
import { motion } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

interface CatCard {
  id: string
  label: string
  desc: string
  gradient: string
  accent: string
  image: string | null
}

// Per-category text accent colors — soft, premium, readable
const TEXT_ACCENT: Record<string, string> = {
  hot:         '#d4844a',  // light orange
  cold:        '#6aaec9',  // ice blue
  dessert:     '#cc7a9a',  // soft pink
  shisha:      '#b89640',  // elegant gold
  sandwiches:  '#c4a840',  // warm yellow
  yogurt:      '#9a78c4',  // soft purple
  padel:       '#6a94c4',  // clean blue
}

// imgBg: solid background color shown behind the image in the card
const CARDS: CatCard[] = [
  { id: 'hot', label: 'Hot Drinks', desc: 'Warm & aromatic classics — espresso, cappuccino, Turkish coffee & more', gradient: 'linear-gradient(135deg,#f97316,#dc2626)', accent: '#fed7aa', image: 'https://images.pexels.com/photos/15851583/pexels-photo-15851583/free-photo-of-cappuccino-in-cup-on-table.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'cold', label: 'Cold Drinks', desc: 'Chilled & refreshing — iced lattes, fresh juices, smoothies & shakes', gradient: 'linear-gradient(135deg,#0ea5e9,#2563eb)', accent: '#bae6fd', image: 'https://images.pexels.com/photos/22873679/pexels-photo-22873679.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'dessert', label: 'Desserts', desc: 'Sweet indulgence — cakes, cheesecakes & freshly baked pastries', gradient: 'linear-gradient(135deg,#ec4899,#be185d)', accent: '#fbcfe8', image: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'shisha', label: 'Shisha', desc: 'Premium flavors — fresh mint, double apple & classic blends', gradient: 'linear-gradient(135deg,#eab308,#a16207)', accent: '#fef08a', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-awRUXZgCUaSRd5LnoYKBVKhnE9Z36Z.png' },
  { id: 'sandwiches', label: 'Sandwiches', desc: 'Fresh & delicious — tuna, turkey, halloumi & more', gradient: 'linear-gradient(135deg,#f97316,#dc2626)', accent: '#fed7aa', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sandwich%20PNG-ALWYL1Ttrugnx7fPbCpNyn3mu4AcTN.jpg' },
  { id: 'yogurt', label: 'Yogurt', desc: 'Creamy & refreshing — Greek yogurt with fresh toppings', gradient: 'linear-gradient(135deg,#d946ef,#be185d)', accent: '#f9a8d4', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14988611256100392-VcfSLudrmQ98JzCToSTWUmeOANUBaV.jpg' },
  { id: 'padel', label: 'Padel', desc: 'Rackets, coaching & gear for your game', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)', accent: '#06f6d4', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0a6RZwqQSo38UmBftouiTQtlg9C8Rc.png' },
]

// Solid background per category type
const IMG_BG: Record<string, string> = {
  hot:         '#f97316',   // solid orange  — hot drinks
  cold:        '#e8f4fc',   // ice white     — cold drinks
  dessert:     '#1a3a2a',   // dark green    — desserts
  shisha:      '#1a3a2a',   // dark green    — shisha
  sandwiches:  '#1a3a2a',   // dark green    — sandwiches
  yogurt:      '#1a3a2a',   // dark green    — yogurt
  padel:       '#1a3a2a',   // dark green    — padel
}

export default function Menu({ onBack, onHotDrinks, onColdDrinks, onDesserts, onShisha, onSandwiches, onYogurt, onPadel }: {
  onBack?: () => void
  onHotDrinks?: () => void
  onColdDrinks?: () => void
  onDesserts?: () => void
  onShisha?: () => void
  onSandwiches?: () => void
  onYogurt?: () => void
  onPadel?: () => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handlers: Record<string, (() => void) | undefined> = {
    hot: onHotDrinks, cold: onColdDrinks, dessert: onDesserts, shisha: onShisha, sandwiches: onSandwiches, yogurt: onYogurt, padel: onPadel,
  }

  return (
    <section style={{
      minHeight: '100svh', padding: 'clamp(80px,12vh,120px) clamp(16px,4vw,40px) clamp(40px,6vh,80px)',
      background: '#faf9f4',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Olive branch decoration — right side, subtle & non-intrusive */}
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%285%29-I4zRXdmd0oQXqKRice8ElgxI5yEMtN.png"
        alt="Olive branch decoration"
        style={{
          position: 'absolute',
          right: 'clamp(-20px, -5vw, 60px)',
          top: 'clamp(80px, 8vh, 180px)',
          width: 'clamp(280px, 35vw, 500px)',
          height: 'auto',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 1,

          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
        }}
      />
      {/* Back */}
      {onBack && (
        <button onClick={onBack} style={{
          alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(74,103,65,0.08)', border: '1px solid rgba(74,103,65,0.2)',
          borderRadius: 999, padding: '10px 20px', cursor: 'pointer',
          color: '#4a6741', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
          marginBottom: 'clamp(24px,4vh,40px)',
          position: 'relative', zIndex: 20,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          BACK
        </button>
      )}

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vh,56px)' }}>
        <p style={{
          margin: 0, fontSize: 'clamp(11px,1.4vw,14px)', fontWeight: 800, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: '#7a9055',
        }}>Café & Kitchen</p>
        <h2 style={{
          margin: '8px 0 0', fontSize: 'clamp(36px,7vw,72px)', fontWeight: 900,
          color: '#2c3a24', letterSpacing: '-0.03em', lineHeight: 1,
        }}>Our Menu</h2>
      </div>

      {/* Big category cards */}
      <div style={{
        width: '100%', maxWidth: 960,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'clamp(16px,2.5vw,24px)',
        position: 'relative', zIndex: 10,
      }}>
        {CARDS.map((card, i) => {
          const isHovered = hoveredId === card.id
          const accentColor = TEXT_ACCENT[card.id] ?? '#6b7c4a'
          return (
            <motion.button
              key={card.id}
              onClick={() => handlers[card.id]?.()}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}
              whileTap={{ scale: 0.96, transition: { duration: 0.12 } }}
              style={{
                position: 'relative', overflow: 'hidden', cursor: 'pointer',
                background: isHovered ? '#4a6741' : '#f5f3e8',
                borderRadius: 28,
                border: '1.5px solid #7a9055',
                padding: 'clamp(24px,3vw,36px)', textAlign: 'left',
                minHeight: 260, display: 'flex', flexDirection: 'column', gap: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                willChange: 'transform',
                transition: 'background 0.3s ease',
              }}
            >
              {/* Image — unchanged: size, cropping, quality, position, border */}
              <div style={{
                width: 'clamp(58px,8vw,72px)', height: 'clamp(58px,8vw,72px)',
                borderRadius: 14, flexShrink: 0,
                background: IMG_BG[card.id] ?? '#1a3a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid #1a3a2a',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                {card.image ? (
                  <img src={card.image} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                )}
              </div>

              <h3 style={{
                margin: 0, fontSize: 'clamp(27px,3.2vw,37px)', fontWeight: 900,
                color: isHovered ? '#faf9f4' : accentColor,
                letterSpacing: '-0.02em', lineHeight: 1.1,
                transition: 'color 0.3s ease',
              }}>{card.label}</h3>

              <p style={{
                margin: 0, fontSize: 'clamp(14px,1.4vw,17px)', fontWeight: 600,
                color: isHovered ? 'rgba(250,249,244,0.85)' : '#5c6b4a',
                lineHeight: 1.5,
                transition: 'color 0.3s ease',
              }}>{card.desc}</p>

              <div style={{
                marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8,
                paddingTop: 8,
                color: isHovered ? '#faf9f4' : '#4a6741',
                fontSize: 14, fontWeight: 800,
                transition: 'color 0.3s ease',
              }}>
                Explore
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
