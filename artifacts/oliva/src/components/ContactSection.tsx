import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const CONTACT = {
  whatsappNumber: '961XXXXXXXX',
  whatsappDisplay: '+961 XX XXX XXX',
  whatsappMessage: 'Hello, I would like to ask about the café and padel court.',
  phone: '+961 71 234 567',
  email: 'hello@oliva.com',
  address: 'Beirut, Lebanon',
  hours: 'Open daily · 9am – 11pm',
  instagram: 'https://instagram.com/oliva.padel',
  instagramDisplay: '@oliva.padel',
}

type CardData = {
  label: string
  value: string
  href?: string
  delay: number
  accent: string
  glow: string
  icon: React.ReactNode
}

function Card3D({ data }: { data: CardData }) {
  const ref = useRef<HTMLAnchorElement & HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 180, damping: 20 })
  const [hovered, setHovered] = useState(false)

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) - 0.5)
    my.set(((e.clientY - r.top) / r.height) - 0.5)
  }
  const handleLeave = () => { mx.set(0); my.set(0); setHovered(false) }

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: data.delay }}
      style={{
        rotateX: rx, rotateY: ry,
        transformStyle: 'preserve-3d',
        transformPerspective: 700,
        position: 'relative',
        borderRadius: '20px',
        padding: '28px 24px',
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${data.accent}33`,
        backdropFilter: 'blur(16px)',
        cursor: data.href ? 'pointer' : 'default',
        boxShadow: hovered
          ? `0 24px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px ${data.accent}44 inset, 0 0 40px -8px ${data.glow}`
          : '0 8px 32px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
        transition: 'box-shadow 0.4s ease',
        overflow: 'hidden',
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
    >
      {/* Shimmer layer */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[20px]" style={{
        background: useTransform([mx, my], ([x, y]) =>
          `radial-gradient(180px circle at ${(Number(x) + 0.5) * 100}% ${(Number(y) + 0.5) * 100}%, ${data.glow}, transparent 65%)`),
        opacity: hovered ? 0.35 : 0,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Corner accent */}
      <div aria-hidden className="absolute top-0 right-0 w-20 h-20 pointer-events-none" style={{
        background: `radial-gradient(circle at 100% 0%, ${data.glow} 0%, transparent 65%)`,
        opacity: 0.25, borderRadius: '0 20px 0 0',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* Icon */}
        <div style={{
          width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${data.accent}18`,
          border: `1px solid ${data.accent}33`,
          color: data.accent,
          boxShadow: `0 4px 16px -4px ${data.glow}`,
        }}>
          {data.icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: data.accent,
            marginBottom: '6px', opacity: 0.85,
          }}>
            {data.label}
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(17px, 2vw, 21px)', fontWeight: 500,
            color: '#F5EBD2', lineHeight: 1.2,
            letterSpacing: '0.01em',
          }}>
            {data.value}
          </p>
        </div>
      </div>

      {/* 3D depth face (bottom edge illusion) */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${data.accent}55, transparent)`,
        transform: 'translateZ(-1px)',
      }} />
    </motion.div>
  )

  if (data.href) {
    return (
      <a href={data.href} target="_blank" rel="noopener noreferrer" ref={ref as React.RefObject<HTMLAnchorElement>}
         style={{ display: 'block', textDecoration: 'none' }}>
        {inner}
      </a>
    )
  }
  return <div ref={ref as React.RefObject<HTMLDivElement>}>{inner}</div>
}

const WA_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.89-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)
const PHONE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
const MAIL_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
  </svg>
)
const PIN_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const CLOCK_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IG_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const waHref = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`

const CARDS: CardData[] = [
  { label: 'WhatsApp',      value: CONTACT.whatsappDisplay,   href: waHref,                                           delay: 0,    accent: '#25D366', glow: 'rgba(37,211,102,0.4)',   icon: WA_ICON    },
  { label: 'Phone',         value: CONTACT.phone,             href: `tel:${CONTACT.phone.replace(/\s/g, '')}`,        delay: 0.07, accent: '#7dd3fc', glow: 'rgba(125,211,252,0.35)', icon: PHONE_ICON },
  { label: 'Email',         value: CONTACT.email,             href: `mailto:${CONTACT.email}`,                        delay: 0.14, accent: '#CCA478', glow: 'rgba(204,164,120,0.4)',  icon: MAIL_ICON  },
  { label: 'Location',      value: CONTACT.address,                                                                   delay: 0.21, accent: '#f9a8d4', glow: 'rgba(249,168,212,0.35)', icon: PIN_ICON   },
  { label: 'Opening Hours', value: CONTACT.hours,                                                                     delay: 0.28, accent: '#DCCFB6', glow: 'rgba(220,207,182,0.35)', icon: CLOCK_ICON },
  { label: 'Instagram',     value: CONTACT.instagramDisplay,  href: CONTACT.instagram,                                delay: 0.35, accent: '#e879f9', glow: 'rgba(232,121,249,0.35)', icon: IG_ICON    },
]

export default function ContactSection() {
  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        padding: '100px 0 120px',
        background: 'radial-gradient(120% 80% at 50% 0%, #1a2614 0%, #0d1409 50%, #080a05 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background grain */}
      <div aria-hidden className="noh-grain absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }} />

      {/* Radial glow center */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(60% 40% at 50% 0%, rgba(107,137,80,0.18) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Heading */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '72px' }}
        >
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: '#CCA478', marginBottom: '16px', opacity: 0.9,
          }}>
            General Enquiries
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 600,
            letterSpacing: '-0.025em', lineHeight: 1.05,
            color: '#F5EBD2', margin: 0,
          }}>
            Get in Touch
          </h2>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(17px, 2vw, 22px)', fontStyle: 'italic',
            color: 'rgba(220,207,182,0.6)', marginTop: '12px',
          }}>
            We're always here — on court and off it.
          </p>
          {/* Decorative line */}
          <div style={{
            width: '60px', height: '1px', margin: '24px auto 0',
            background: 'linear-gradient(90deg, transparent, #CCA478, transparent)',
          }} />
        </motion.div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {CARDS.map((card) => (
            <Card3D key={card.label} data={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
