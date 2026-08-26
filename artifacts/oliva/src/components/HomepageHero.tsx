import type { CSSProperties } from 'react'
import heroCafeUrl from '../assets/homepage-hero/cafe-background.jpeg'
import heroCourtUrl from '../assets/homepage-hero/padel-court.jpeg'
import { PADEL_WHATSAPP_CONTACT_URL } from '../data/padelBooking'

type HomepageHeroProps = {
  onMenu: () => void
  onBook: () => void
}

export default function HomepageHero({ onMenu, onBook }: HomepageHeroProps) {
  return (
    <section
      className="oliva-home-hero"
      style={{ '--oliva-hero-background': `url("${heroCafeUrl}")` } as CSSProperties}
      aria-label="Oliva Café and Padel"
    >
      <div className="oliva-home-hero__scrim" aria-hidden="true" />

      <nav className="oliva-home-hero__nav" aria-label="Homepage navigation">
        <button type="button" onClick={onMenu}>Menu</button>
        <button type="button" onClick={onBook}>Book Now</button>
        <a href={PADEL_WHATSAPP_CONTACT_URL} target="_blank" rel="noopener noreferrer">
          Contact
        </a>
      </nav>

      <div className="oliva-home-hero__circle" aria-label="Oliva padel court">
        <img
          className="oliva-home-hero__court"
          src={heroCourtUrl}
          alt="Oliva padel court"
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