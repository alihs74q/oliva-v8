import { useEffect, useRef, useState } from 'react'
import heroCafeUrl from '../assets/homepage-hero/cafe-background.webp'
import heroCafeLowUrl from '../assets/homepage-hero/lqip/cafe-background.webp'
import olivaLogoUrl from '../assets/homepage-hero/oliva-logo-transparent.png'

type HomepageHeroProps = {
  onMenu: () => void
  onBook: () => void
}

export default function HomepageHero({ onMenu, onBook }: HomepageHeroProps) {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [isMenuTransitioning, setIsMenuTransitioning] = useState(false)
  const bookingTimer = useRef<number | null>(null)
  const menuTimer = useRef<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      if (bookingTimer.current !== null) window.clearTimeout(bookingTimer.current)
      if (menuTimer.current !== null) window.clearTimeout(menuTimer.current)
    }
  }, [])

  const handleMenu = () => {
    if (isMenuTransitioning || isBooking) return
    setIsMenuTransitioning(true)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    menuTimer.current = window.setTimeout(onMenu, reduceMotion ? 260 : 2450)
  }

  const handleBook = () => {
    if (isBooking || isMenuTransitioning) return
    setIsBooking(true)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    bookingTimer.current = window.setTimeout(onBook, reduceMotion ? 180 : 820)
  }

  return (
    <section
      className={`oliva-luxury-hero${isMounted ? ' is-ready' : ''}${isMenuTransitioning ? ' is-menu-transitioning' : ''}`}
      aria-label="Oliva Café and Padel"
      aria-busy={isMenuTransitioning}
    >
      <div
        className="oliva-luxury-hero__background oliva-luxury-hero__background--preview"
        style={{ backgroundImage: `url("${heroCafeLowUrl}")` }}
        aria-hidden="true"
      />
      <div
        className={`oliva-luxury-hero__background oliva-luxury-hero__background--full${backgroundLoaded ? ' is-loaded' : ''}`}
        style={{ backgroundImage: `url("${heroCafeUrl}")` }}
        aria-hidden="true"
      />
      <img
        className="oliva-luxury-hero__preload"
        src={heroCafeUrl}
        alt=""
        aria-hidden="true"
        onLoad={() => setBackgroundLoaded(true)}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />

      <div className="oliva-luxury-hero__atmosphere" aria-hidden="true" />
      <div className="oliva-luxury-hero__grain" aria-hidden="true" />

      <div className="oliva-menu-portal" aria-hidden="true">
        <div className="oliva-menu-portal__scene">
          <div className="oliva-menu-portal__halo" />
          <div className="oliva-menu-portal__word">OLIVA</div>
          <svg className="oliva-menu-portal__cup" viewBox="0 0 360 280" role="presentation">
            <ellipse className="oliva-menu-portal__saucer" cx="180" cy="235" rx="123" ry="17" />
            <path className="oliva-menu-portal__handle" d="M278 130c58-6 67 69 13 86-15 5-29 2-39-6" />
            <path className="oliva-menu-portal__body" d="M74 112h211l-12 87c-4 28-29 45-58 45h-71c-29 0-54-17-58-45l-12-87Z" />
            <ellipse className="oliva-menu-portal__coffee" cx="180" cy="113" rx="106" ry="22" />
            <path className="oliva-menu-portal__milk-stream" d="M180 33c-4 22-8 40 0 67" />
            <path className="oliva-menu-portal__coffee-ripple" d="M133 116c18 11 77 13 96-1" />
          </svg>
          <div className="oliva-menu-portal__caption">Café & kitchen</div>
        </div>
      </div>

      <div className="oliva-luxury-hero__content">
        <div className="oliva-luxury-hero__visual" aria-label="Oliva">
          <div className="oliva-luxury-hero__glow" aria-hidden="true" />
          <div className="oliva-luxury-hero__logo-3d" aria-hidden="true">
            <span className="oliva-luxury-hero__logo-depth oliva-luxury-hero__logo-depth--one">
              <img src={olivaLogoUrl} alt="" draggable={false} />
            </span>
            <span className="oliva-luxury-hero__logo-depth oliva-luxury-hero__logo-depth--two">
              <img src={olivaLogoUrl} alt="" draggable={false} />
            </span>
            <img
              className="oliva-luxury-hero__logo"
              src={olivaLogoUrl}
              alt=""
              draggable={false}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <span className="oliva-luxury-hero__logo-shine" />
          </div>
        </div>

        <div className="oliva-luxury-hero__actions" aria-label="Primary actions">
          <button
            type="button"
            className="oliva-glass-action oliva-glass-action--menu"
            onClick={handleMenu}
            disabled={isMenuTransitioning || isBooking}
            aria-label={isMenuTransitioning ? 'Opening menu' : 'Open menu'}
          >
            <span>Menu</span>
          </button>
          <button
            type="button"
            className={`oliva-glass-action oliva-glass-action--book${isBooking ? ' is-booking' : ''}`}
            onClick={handleBook}
            disabled={isBooking || isMenuTransitioning}
            aria-label={isBooking ? 'Opening padel booking' : 'Book a padel court'}
          >
            <span className="oliva-glass-action__label">Book</span>
            <span className="oliva-padel-pop" aria-hidden="true">
              <i />
              <b />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}