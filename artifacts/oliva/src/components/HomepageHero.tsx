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
    menuTimer.current = window.setTimeout(onMenu, reduceMotion ? 220 : 1520)
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
          <img className="oliva-menu-portal__logo" src={olivaLogoUrl} alt="" draggable={false} />
          <div className="oliva-menu-portal__circle" />
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