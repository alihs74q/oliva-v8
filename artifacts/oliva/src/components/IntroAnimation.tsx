import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import OlivaLogo from './OlivaLogo'

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 150)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => setPhase(3), 2600)
    const t4 = setTimeout(onComplete, 3300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete])

  const RADIUS = 80
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 3 ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF7F2',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="220" height="220" viewBox="0 0 220 220"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible' }}>
          <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="#d1dab4" strokeWidth="3" />
          <motion.circle
            cx="110" cy="110" r={RADIUS} fill="none" stroke="#4a6741" strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE, rotate: -90, transformOrigin: '110px 110px' }}
            animate={phase >= 1 ? {
              strokeDashoffset: phase >= 2 ? 0 : CIRCUMFERENCE * 0.15,
              rotate: phase >= 2 ? 270 : -90, transformOrigin: '110px 110px',
            } : { strokeDashoffset: CIRCUMFERENCE, rotate: -90, transformOrigin: '110px 110px' }}
            transition={{ strokeDashoffset: { duration: 1.4, ease: 'easeInOut' }, rotate: { duration: 1.4, ease: 'easeInOut' } }}
            style={{ transformOrigin: '110px 110px' }}
          />
          {phase >= 1 && (
            <motion.circle cx="110" cy="30" r="5" fill="#4a6741"
              initial={{ opacity: 0 }} animate={{ opacity: phase >= 2 ? 0 : 1 }}
              transition={{ duration: 0.3 }} style={{ filter: 'drop-shadow(0 0 6px #4a6741)' }}
            />
          )}
        </svg>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: phase >= 1 ? 1 : 0.6, opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <OlivaLogo size={140} showText={false} />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 12 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'absolute', bottom: '50%', marginBottom: '-160px', textAlign: 'center' }}
      >
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 600, color: '#4a6741', letterSpacing: '10px', margin: 0 }}>OLIVA</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
          <div style={{ width: 32, height: 1, background: '#4a6741' }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 9, color: '#4a6741', letterSpacing: '3px', margin: 0 }}>FROM COURT TO CUP</p>
          <div style={{ width: 32, height: 1, background: '#4a6741' }} />
        </div>
      </motion.div>
    </motion.div>
  )
}
