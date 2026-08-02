import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Currency } from '../hooks/useCurrency'

interface CurrencyToggleProps {
  currency: Currency
  onToggle: () => void
}

// Lebanon flag inline SVG colours
const LBFlag = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
    <rect width="20" height="14" rx="2" fill="#fff" />
    <rect y="0" width="20" height="3" rx="2" fill="#EE3340" />
    <rect y="11" width="20" height="3" rx="2" fill="#EE3340" />
    {/* Cedar tree */}
    <path d="M10 4.2 L12.4 8.6 H10.7 L12.8 10.8 H7.2 L9.3 8.6 H7.6 Z" fill="#00A550" />
  </svg>
)

const USFlag = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
    <rect width="20" height="14" rx="2" fill="#B22234" />
    {[1,3,5,7,9,11].map(y => (
      <rect key={y} y={y} width="20" height="1" fill="#fff" />
    ))}
    <rect width="9" height="7" rx="1" fill="#3C3B6E" />
    {/* Stars — simplified dots */}
    {[1,2,3,4,5,6].flatMap(row =>
      [1,2,3].map(col => (
        <circle
          key={`${row}-${col}`}
          cx={col * 2.5 - 0.8}
          cy={row * 1.05}
          r="0.45"
          fill="#fff"
        />
      ))
    )}
  </svg>
)

export default function CurrencyToggle({ currency, onToggle }: CurrencyToggleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isUSD = currency === 'USD'

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Switch to ${isUSD ? 'Lebanese Pounds' : 'US Dollars'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 999,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: isHovered
          ? '0 4px 16px rgba(0,0,0,0.22)'
          : '0 2px 8px rgba(0,0,0,0.14)',
        transition: 'box-shadow 0.2s ease',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* LBP side */}
      <motion.div
        animate={{
          background: !isUSD ? '#EE3340' : 'rgba(220,220,220,0.5)',
          scale: !isUSD ? 1 : 0.95,
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 9px 5px 7px',
          borderRadius: '999px 0 0 999px',
        }}
      >
        <LBFlag />
        <motion.span
          animate={{ color: !isUSD ? '#fff' : '#888', fontWeight: !isUSD ? 800 : 600 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 11, letterSpacing: '0.06em' }}
        >
          LBP
        </motion.span>
      </motion.div>

      {/* Divider */}
      <div style={{ width: 1, height: 26, background: 'rgba(0,0,0,0.12)', flexShrink: 0 }} />

      {/* USD side */}
      <motion.div
        animate={{
          background: isUSD ? '#3C3B6E' : 'rgba(220,220,220,0.5)',
          scale: isUSD ? 1 : 0.95,
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 7px 5px 9px',
          borderRadius: '0 999px 999px 0',
        }}
      >
        <motion.span
          animate={{ color: isUSD ? '#fff' : '#888', fontWeight: isUSD ? 800 : 600 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 11, letterSpacing: '0.06em' }}
        >
          USD
        </motion.span>
        <USFlag />
      </motion.div>

      {/* Animated sliding pill indicator */}
      <motion.div
        layoutId="currency-pill"
        animate={{ x: isUSD ? '50%' : '0%' }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '50%',
          background: isUSD
            ? 'rgba(60,59,110,0.18)'
            : 'rgba(238,51,64,0.18)',
          borderRadius: 999,
          pointerEvents: 'none',
        }}
      />
    </button>
  )
}
