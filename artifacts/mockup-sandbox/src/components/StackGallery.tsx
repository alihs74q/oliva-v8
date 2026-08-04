import { useRef, useState, useCallback, useEffect } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type MotionValue,
} from 'framer-motion'

type GalleryCard = {
  title: string
  description: string
  image: string
  accent: string
}

const GALLERY_CARDS: GalleryCard[] = [
  {
    title: 'Padel Courts',
    description:
      'Two premium glass courts under floodlights. Morning drills, weekend showdowns, every rally a little sharper than the last.',
    image:
      'https://images.pexels.com/photos/6203796/pexels-photo-6203796.jpeg?auto=compress&cs=tinysrgb&w=1400',
    accent: '#6b8950',
  },
  {
    title: 'The Café',
    description:
      'Warm wood, linen light, a slow espresso machine. A room built for the pause between sets and the conversations that stretch.',
    image:
      'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=1400',
    accent: '#c9a96e',
  },
  {
    title: 'Our Story',
    description:
      'Born under a single olive tree in the family orchard. A love letter to slow mornings, sharp rallies, and honest food.',
    image:
      'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=1400',
    accent: '#8a9a6b',
  },
  {
    title: 'Night Vibe',
    description:
      'Amber lanterns, painted shadows across the court, low music. The air cools and the room turns cinematic.',
    image:
      'https://images.pexels.com/photos/2527415/pexels-photo-2527415.jpeg?auto=compress&cs=tinysrgb&w=1400',
    accent: '#d4a574',
  },
  {
    title: 'Community',
    description:
      'Coaches, players, neighbours, guests. This place runs on the people who keep showing up, rally after rally.',
    image:
      'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1400',
    accent: '#a8896b',
  },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function useMouseTilt(maxDeg: number, enabled: boolean) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 18, mass: 0.35, restDelta: 0.001 })
  const sry = useSpring(ry, { stiffness: 180, damping: 18, mass: 0.35, restDelta: 0.001 })

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled) return
      const r = e.currentTarget.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry.set(px * maxDeg * 2)
      rx.set(-py * maxDeg * 2)
    },
    [enabled, maxDeg, rx, ry],
  )

  const onLeave = useCallback(() => {
    rx.set(0)
    ry.set(0)
  }, [rx, ry])

  return { srx, sry, onMove, onLeave }
}

function GalleryCardView({
  card,
  index,
  total,
  isMobile,
}: {
  card: GalleryCard
  index: number
  total: number
  isMobile: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const tilt = useMouseTilt(isMobile ? 3 : 8, true)

  // Parallax depth for the inner image layer (3D pop)
  const imgTx = useMotionValue(0)
  const imgTy = useMotionValue(0)
  const imgTxSmooth = useSpring(imgTx, { stiffness: 150, damping: 20, mass: 0.4 })
  const imgTySmooth = useSpring(imgTy, { stiffness: 150, damping: 20, mass: 0.4 })

  const onCardMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      tilt.onMove(e)
      if (isMobile) return
      const r = e.currentTarget.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      imgTx.set(px * 14)
      imgTy.set(py * 14)
    },
    [isMobile, tilt, imgTx, imgTy],
  )

  const onCardLeave = useCallback(() => {
    tilt.onLeave()
    imgTx.set(0)
    imgTy.set(0)
  }, [tilt, imgTx, imgTy])

  return (
    <section
      ref={ref}
      className="relative w-full flex items-center justify-center snap-start"
      style={{ height: '100svh', zIndex: 1 }}
    >
      {/* Ambient glow tied to card accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at 50% 30%, ${card.accent}1a, transparent 70%)`,
        }}
        aria-hidden
      />

      <motion.div
        className="relative w-full mx-auto"
        style={{
          maxWidth: 'min(94vw, 680px)',
          rotateX: tilt.srx,
          rotateY: tilt.sry,
          transformStyle: 'preserve-3d',
          transformPerspective: 1200,
          willChange: 'transform',
        }}
        onMouseMove={onCardMove}
        onMouseLeave={onCardLeave}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Photo — full bleed, rounded corners */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: '3 / 4',
            borderRadius: '28px',
            boxShadow:
              '0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08) inset',
            transform: 'translateZ(0)',
          }}
        >
          {/* Image with 3D depth parallax */}
          <motion.img
            src={card.image}
            alt={card.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              x: imgTxSmooth,
              y: imgTySmooth,
              scale: 1.06,
              transformStyle: 'preserve-3d',
              translateZ: 40,
            }}
            draggable={false}
            loading={index < 1 ? 'eager' : 'lazy'}
          />
          {/* Gradient wash for text legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(10,15,6,0.82) 0%, rgba(10,15,6,0.2) 38%, transparent 62%)',
            }}
            aria-hidden
          />
          {/* Accent ring */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 2px ${card.accent}28`,
              borderRadius: '28px',
            }}
            aria-hidden
          />
          {/* Glare sweep on hover (desktop only) */}
          {!isMobile && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
                borderRadius: '28px',
                mixBlendMode: 'screen',
              }}
              aria-hidden
            />
          )}
        </div>

        {/* Glassmorphism description card — below photo, overlapping */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative mx-auto"
          style={{
            marginTop: '-48px',
            width: 'min(88%, 540px)',
            borderRadius: '22px',
            background: 'rgba(16,26,12,0.5)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            border: '1px solid rgba(220,207,182,0.18)',
            boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6)',
            padding: '24px 28px',
            zIndex: 2,
            translateZ: 60,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Accent dot + counter */}
          <div className="flex items-center gap-3 mb-3">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: card.accent,
                boxShadow: `0 0 12px ${card.accent}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(220,207,182,0.7)',
              }}
            >
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(22px, 5vw, 34px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#F5F1E6',
              margin: 0,
            }}
          >
            {card.title}
          </h2>

          <p
            className="mt-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(14px, 3.2vw, 17px)',
              lineHeight: 1.55,
              color: 'rgba(220,207,182,0.78)',
              fontStyle: 'italic',
            }}
          >
            {card.description}
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default function StackGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()
  const total = GALLERY_CARDS.length

  return (
    <section
      ref={sectionRef}
      className="relative w-full snap-y snap-mandatory"
      style={{ background: '#0A0F06', zIndex: 10 }}
    >
      {GALLERY_CARDS.map((card, i) => (
        <GalleryCardView
          key={i}
          card={card}
          index={i}
          total={total}
          isMobile={isMobile}
        />
      ))}
    </section>
  )
}
