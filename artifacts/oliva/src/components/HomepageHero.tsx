import { useState } from 'react'
import type { CSSProperties } from 'react'
import heroCafeUrl from '../assets/homepage-hero/cafe-background.jpeg'
import heroCafeLowUrl from '../assets/homepage-hero/lqip/cafe-background.jpeg'
import heroCourtUrl from '../assets/homepage-hero/padel-court-new.png'
import heroCourtLowUrl from '../assets/homepage-hero/lqip/padel-court-new.jpeg'
import olivaLogoUrl from '../assets/homepage-hero/oliva-logo-transparent.png'
import { PADEL_WHATSAPP_CONTACT_URL } from '../data/padelBooking'
import OptimizedImage from './OptimizedImage'

type HomepageHeroProps = {
  onMenu: () => void
  onBook: () => void
}

export default function HomepageHero({ onMenu, onBook }: HomepageHeroProps) {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  return (
    <section
      className={`oliva-home-hero${backgroundLoaded ? ' oliva-home-hero--background-loaded' : ''}`}
      style={{
        '--oliva-hero-background': `url("${heroCafeUrl}")`,
        '--oliva-hero-background-low': `url("${heroCafeLowUrl}")`,
      } as CSSProperties}
      aria-label="Oliva Café and Padel"
    >
      <img
        className="oliva-home-hero__background-preload"
        src={heroCafeUrl}
        alt=""
        aria-hidden="true"
        onLoad={() => setBackgroundLoaded(true)}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <div className="oliva-home-hero__scrim" aria-hidden="true" />

      <nav className="oliva-home-hero__nav" aria-label="Homepage navigation">
        <button type="button" onClick={onMenu}>Menu</button>
        <button type="button" onClick={onBook}>Book Now</button>
        <a href={PADEL_WHATSAPP_CONTACT_URL} target="_blank" rel="noopener noreferrer">
          Contact
        </a>
      </nav>

      <div className="oliva-home-hero__circle" aria-label="Oliva padel court">
        <OptimizedImage
          className="oliva-home-hero__court"
          src={heroCourtUrl}
          lowSrc={heroCourtLowUrl}
          alt="Oliva padel court"
          priority
          style={{ borderRadius: '50%' }}
        />
        <img
          className="oliva-home-hero__logo"
          src={olivaLogoUrl}
          alt="Oliva"
          draggable={false}
        />
      </div>

      <div className="oliva-home-hero__actions" aria-label="Primary actions">
        <button type="button" onClick={onMenu}>MENU</button>
        <button type="button" onClick={onBook}>BOOK NOW</button>
      </div>
    </section>
  )
}