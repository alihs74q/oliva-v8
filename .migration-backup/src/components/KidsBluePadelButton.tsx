import { useState, useRef } from 'react'

interface Spark { id: number; x: number; y: number; color: string }

const Ball = ({ s = 14, c = '#fff' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="10" cy="10" r="9" fill={c} />
    <path d="M3 7.5 Q10 4 17 7.5" stroke="rgba(0,0,0,0.15)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <path d="M3 12.5 Q10 16 17 12.5" stroke="rgba(0,0,0,0.15)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="7" cy="7" r="1.5" fill="rgba(0,0,0,0.08)" />
  </svg>
)

const Court = ({ s = 18, c = '#fff' }: { s?: number; c?: string }) => (
  <svg width={s} height={Math.round(s * 0.65)} viewBox="0 0 36 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="1" y="1" width="34" height="22" rx="1" stroke={c} strokeWidth="1.4" fill="none" />
    <line x1="18" y1="1" x2="18" y2="23" stroke={c} strokeWidth="1.2" />
    <line x1="1" y1="12" x2="35" y2="12" stroke={c} strokeWidth="1.2" />
    <line x1="6" y1="1" x2="6" y2="23" stroke={c} strokeWidth="0.9" strokeDasharray="2.5 2" opacity="0.6" />
    <line x1="30" y1="1" x2="30" y2="23" stroke={c} strokeWidth="0.9" strokeDasharray="2.5 2" opacity="0.6" />
  </svg>
)

export default function KidsBluePadelButton({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [sparks, setSparks] = useState<Spark[]>([])
  const ref = useRef<HTMLButtonElement>(null)
  const idRef = useRef(0)
  const sparkColors = ['#3a8af0', '#2a7ae0', '#bfdbfe', '#fff']

  function shoot(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top
    const batch: Spark[] = Array.from({ length: 12 }, () => ({
      id: idRef.current++, x: cx, y: cy,
      color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
    }))
    setSparks(s => [...s, ...batch])
    setTimeout(() => setSparks(s => s.filter(p => !batch.find(b => b.id === p.id))), 700)
  }

  return (
    <button ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={e => { shoot(e); onClick?.() }}
      style={{
        position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '20px 36px', background: hovered ? '#3a8af0' : '#2a7ae0', border: '4px solid #0a2060',
        borderRadius: '28px', cursor: 'pointer', outline: 'none', fontSize: '22px', fontWeight: 900, color: '#fff',
        boxShadow: hovered ? '0 0 0 4px #fff,0 0 0 8px #3a8af0' : '0 6px 0 #0a2060',
        transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'system-ui, sans-serif',
      } as React.CSSProperties}>
      <div style={{ position: 'absolute', top: '8px', right: '10px', background: '#fff', color: '#2a7ae0', fontSize: '12px', fontWeight: 900, padding: '3px 10px', borderRadius: '16px', border: '2px solid #0a2060', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', zIndex: 10, fontFamily: 'system-ui, sans-serif', lineHeight: 1.2 }}>$24<span style={{ fontSize: '8px', fontWeight: 700, opacity: 0.7 }}>/match</span></div>
      <Ball c="#fff" s={20} /> <Court c="#fff" s={26} /> Play!
      {sparks.map(p => {
        const angle = Math.random() * 360, dist = 40 + Math.random() * 55
        return <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, width: 5 + Math.random() * 5, height: 5 + Math.random() * 5, borderRadius: Math.random() > 0.5 ? '50%' : '2px', background: p.color, pointerEvents: 'none', animation: 'padelBurst 0.65s ease-out forwards', '--tx': `${Math.cos(angle * Math.PI / 180) * dist}px`, '--ty': `${Math.sin(angle * Math.PI / 180) * dist}px` } as React.CSSProperties} />
      })}
      <style>{`@keyframes padelBurst { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; } }`}</style>
    </button>
  )
}
