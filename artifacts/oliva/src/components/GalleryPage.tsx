import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StackGallery from './StackGallery'

export default function GalleryPage({ onViewMenu, onBack }: { onViewMenu: () => void; onBack: () => void }) {
  const [intro, setIntro] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative" style={{ background: '#0A0F06' }}>
      {intro && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center" style={{
          background: '#0A0F06',
          animation: 'oliva-intro-fade 1100ms ease-out forwards',
        }}>
          <div style={{
            width: 0, height: 0, borderRadius: '50%',
            background: 'radial-gradient(circle, transparent 45%, #0A0F06 70%)',
            animation: 'oliva-intro-circle 1100ms cubic-bezier(0.7, 0, 0.2, 1) forwards',
            boxShadow: '0 0 120px rgba(143,166,114,0.5) inset, 0 0 80px rgba(220,207,182,0.35)',
          }} />
        </div>
      )}

      <StackGallery />

      {/* Ending CTA */}
      <section className="relative py-32 flex flex-col items-center justify-center text-center px-6" style={{
        background: 'radial-gradient(80% 60% at 50% 40%, #1f2b18 0%, #0A0F06 100%)',
      }}>
        <h2 className="text-white mb-12" style={{
          fontFamily: "'Permanent Marker', 'Caveat Brush', cursive",
          fontSize: 'clamp(80px, 16vw, 220px)',
          background: 'linear-gradient(180deg, #F5EBD2 0%, #CCA478 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          letterSpacing: '-0.02em', transform: 'rotate(-3deg)',
        }}>
          OLIVA
        </h2>

        {/* Big Return Home button */}
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.03, y: -3 }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            padding: '28px 64px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(220,207,182,0.12) 0%, rgba(74,103,65,0.25) 100%)',
            border: '1px solid rgba(220,207,182,0.4)',
            backdropFilter: 'blur(20px)',
            color: '#F5EBD2',
            cursor: 'pointer',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(220,207,182,0.1) inset, 0 0 60px -20px rgba(107,137,80,0.4)',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Shimmer line */}
          <span aria-hidden className="shine-bar" />

          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(204,164,120,0.8)',
          }}>
            Return to
          </span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 600,
            letterSpacing: '-0.02em', fontStyle: 'italic',
            background: 'linear-gradient(135deg, #F5EBD2, #CCA478)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            lineHeight: 1.1,
          }}>
            Main Page
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '16px', fontStyle: 'italic',
            color: 'rgba(220,207,182,0.55)', marginTop: '2px',
          }}>
            ← Back to the grove
          </span>
        </motion.button>

        {/* View Menu secondary */}
        <motion.button
          onClick={onViewMenu}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            padding: '16px 40px', borderRadius: '999px',
            background: 'linear-gradient(135deg, #DCCFB6 0%, #CCA478 100%)',
            color: '#2F2C28',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '13px', letterSpacing: '0.24em',
            textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontWeight: 700,
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
          }}
        >
          View the Menu →
        </motion.button>
      </section>

      <style>{`
        @keyframes oliva-intro-circle { 0% { width: 0; height: 0; } 100% { width: 260vmax; height: 260vmax; } }
        @keyframes oliva-intro-fade { 0%, 60% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  )
}
