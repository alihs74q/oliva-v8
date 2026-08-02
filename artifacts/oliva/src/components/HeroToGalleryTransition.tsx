import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  hero: ReactNode
}

/**
 * Circular reveal transition from Hero → Gallery.
 *
 * The circle clip-path is centered on the logo at all times, so the logo
 * appears to "draw" the light-green gallery background into view. The logo
 * travels from top-left (hero) to center-top (gallery). When the scroll
 * ends, the logo sits at center-top and the real gallery section follows
 * below as a normal scrollable section.
 */
export default function HeroToGalleryTransition({ hero }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const galleryLayerRef = useRef<HTMLDivElement>(null)
  const heroLayerRef = useRef<HTMLDivElement>(null)
  const logoCircleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const galleryLayer = galleryLayerRef.current
    const heroLayer = heroLayerRef.current
    const logoCircle = logoCircleRef.current
    if (!section || !galleryLayer || !heroLayer || !logoCircle) return

    let raf = 0
    let heroContent: HTMLDivElement | null = null
    let inView = false

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting
        if (inView && !raf) {
          raf = requestAnimationFrame(update)
        }
      },
      { threshold: 0.01 },
    )
    io.observe(section)

    const update = () => {
      if (!inView) { raf = 0; return }
      raf = requestAnimationFrame(update)
      const rect = section.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const scrolled = -rect.top
      const total = rect.height - vh
      const progress = Math.min(Math.max(scrolled / total, 0), 1)

      section.style.setProperty('--p', progress.toFixed(4))

      // ── Logo position: top-left → center-top ──
      const startSize = vw < 768 ? 100 : 130
      const endSize = vw < 768 ? 140 : 180
      const logoSize = startSize + (endSize - startSize) * easeInOut(progress)

      const startX = vw < 768 ? 30 : 50
      const startY = 100
      const endX = (vw - logoSize) / 2
      const endY = 70

      const logoX = startX + (endX - startX) * easeInOut(progress)
      const logoY = startY + (endY - startY) * easeInOut(progress)

      logoCircle.style.width = `${logoSize}px`
      logoCircle.style.height = `${logoSize}px`
      logoCircle.style.left = `${logoX}px`
      logoCircle.style.top = `${logoY}px`

      // Circle center = center of logo
      const cx = logoX + logoSize / 2
      const cy = logoY + logoSize / 2

      // Circle radius: starts at ~60% of logo size, grows to cover screen
      const diag = Math.sqrt(vw * vw + vh * vh)
      const baseR = logoSize * 0.62
      const fullR = diag * 0.62
      const r = baseR + (fullR - baseR) * easeInOut(progress)

      const clip = `circle(${r}px at ${cx}px ${cy}px)`
      galleryLayer.style.clipPath = clip
      galleryLayer.style.setProperty('-webkit-clip-path', clip)

      // Hero content fade: fade out in first 30%
      if (!heroContent) {
        heroContent = heroLayer.querySelector('.noh-hero-content') as HTMLDivElement | null
      }
      const hc = heroContent
      if (hc) {
        hc.style.opacity = Math.max(0, 1 - progress / 0.3).toFixed(3)
        hc.style.transform = `translateY(${(progress * 25).toFixed(1)}px)`
      }

      // Hero layer fade: fade out from 65% to 100%
      const heroBgOpacity = progress < 0.65 ? 1 : Math.max(0, 1 - (progress - 0.65) / 0.35)
      heroLayer.style.opacity = heroBgOpacity.toFixed(3)

      // Circle border fade: fade out from 75% to 98%
      const borderOpacity = progress < 0.75 ? 1 : Math.max(0, 1 - (progress - 0.75) / 0.23)
      galleryLayer.style.setProperty('--border-opacity', borderOpacity.toFixed(3))
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    raf = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full noh-transition"
      style={{
        height: '160svh',
        // @ts-expect-error CSS custom property
        '--p': '0',
      }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: '100svh' }}
      >
        {/* ── Gallery preview layer (light green bg, revealed through circle) ── */}
        <div
          ref={galleryLayerRef}
          className="absolute inset-0 z-10 noh-gallery-reveal"
          style={{
            background: '#E8EFE0',
            // @ts-expect-error CSS custom property
            '--border-opacity': '1',
          }}
        />

        {/* ── Hero layer (dark green bg + video) ── */}
        <div
          ref={heroLayerRef}
          className="absolute inset-0 z-20"
          style={{ opacity: 1 }}
        >
          {hero}
        </div>

        {/* ── Logo circle — travels from top-left to center-top ── */}
        <div
          ref={logoCircleRef}
          className="absolute z-40 noh-logo-circle"
          style={{
            top: '100px',
            left: '50px',
            width: '130px',
            height: '130px',
            opacity: 1,
          }}
        >
          <img
            src="/oliva-logo.png"
            alt="Oliva logo"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </section>
  )
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
