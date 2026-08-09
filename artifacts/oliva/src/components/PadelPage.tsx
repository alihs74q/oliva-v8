import { AnimatePresence, motion } from 'framer-motion'
import type { CategoryTheme } from './CategoryListPage'
import CurrencyToggle from './CurrencyToggle'
import { useCurrency } from '../hooks/useCurrency'
import { imageAssets } from '../utils/imageAssets'
import { useState } from 'react'

const EASE = [0.25, 0.46, 0.45, 0.94] as const
const PADEL_WHATSAPP_NUMBER = '96170647506'
const PADEL_WHATSAPP_MESSAGE = 'mar7aba shou hiye law2at lfine 2e7joz fiha lyom'

interface PadelItem {
  title: string
  description: string
  price: string
  lbpPrice: string
  image: string | null
}

function normalizePadelItem(item: PadelItem): PadelItem {
  const normalizedTitle = item.title.toLowerCase()
  if (normalizedTitle.includes('grip')) return { ...item, title: 'Grip', image: '/padel-grip.png' }
  if (normalizedTitle.includes('ball')) return { ...item, title: 'Ball Set' }
  return item
}

const PADEL_ITEMS: PadelItem[] = [
  { title: '1H Court', description: 'Full hour of play', price: '$20', lbpPrice: '1,800,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9vR3KMaQrDDBQVuX3Ksa5fIbkllRIY.png' },
  { title: '1.5H Court', description: 'Extended playtime', price: '$30', lbpPrice: '2,700,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bnWlzxcRfj4wXowKGA3LnfM1trFRSt.png' },
  { title: '1H Coaching', description: 'Professional lessons', price: '$30', lbpPrice: '2,700,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EmI7Im7lNY0MMRPuj1rn3rtLqw3ZsD.png' },
  { title: 'Grip', description: 'Premium quality', price: '$5', lbpPrice: '450,000 LBP', image: '/padel-grip.png' },
  { title: 'Ball Set', description: '3 professional balls', price: '$9.99', lbpPrice: '900,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tASZy37aAXZT8QHk1CUzw40vUE2xQy.png' },
]

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" />
    </svg>
  )
}

export default function PadelPage({
  theme: _theme, onBack, items = PADEL_ITEMS,
}: {
  theme: CategoryTheme
  onBack: () => void
  items?: PadelItem[]
}) {
  const { currency, toggle } = useCurrency('USD')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const displayItems = (items.length > 0 ? items : PADEL_ITEMS).map(normalizePadelItem)
  const selectedItem = selectedIndex === null ? null : displayItems[selectedIndex]
  const selectedItemCanBook = selectedItem !== null && selectedItem.title !== 'Grip' && selectedItem.title !== 'Ball Set'

  function openPadelWhatsApp() {
    if (!selectedItem) return
    window.open(
      `https://wa.me/${PADEL_WHATSAPP_NUMBER}?text=${encodeURIComponent(PADEL_WHATSAPP_MESSAGE)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="padel-page">
      <div className="padel-page__glow padel-page__glow--gold" />
      <div className="padel-page__glow padel-page__glow--olive" />

      <nav className="padel-nav">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="padel-back-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back to menu</span>
        </motion.button>
        <CurrencyToggle currency={currency} onToggle={toggle} />
      </nav>

      <div className="padel-scroll">
        <main className="padel-main">
          <section className="padel-hero">
            <motion.div
              className="padel-hero__copy"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <div className="padel-eyebrow"><TrophyIcon /> Court &amp; Coaching</div>
              <h1>Padel<span>.</span></h1>
              <p>Pick your pace, bring your people, and make an afternoon of it.</p>
              <div className="padel-pills" aria-label="Padel highlights">
                <span className="padel-pill padel-pill--active">Book a court</span>
                <span className="padel-pill">Find your flow</span>
                <span className="padel-pill">Play together</span>
              </div>
            </motion.div>

            <motion.div
              className="padel-hero__visual-wrap"
              initial={{ opacity: 0, y: 20, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            >
              <div className="padel-hero__visual-backdrop" />
              <div className="padel-hero__visual">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ICoaEDFS2acvkeYqAp1z1uT2HyEtlp.png"
                  alt="Oliva Padel Court"
                />
                <div className="padel-hero__visual-shade" />
                <div className="padel-hero__visual-caption">
                  <div>
                    <strong>Your next rally</strong>
                    <span>starts at Oliva</span>
                  </div>
                  <span className="padel-ball" aria-hidden />
                </div>
              </div>
            </motion.div>
          </section>

          <section className="padel-offers" aria-labelledby="padel-offers-title">
            <div className="padel-section-heading">
              <div>
                <p>Choose your play</p>
                <h2 id="padel-offers-title">Make it a good one.</h2>
              </div>
              <span>Tap a card to highlight</span>
            </div>

            <div className="padel-grid">
              {displayItems.map((item, index) => {
                const isBookable = item.title !== 'Grip' && item.title !== 'Ball Set'
                const isSelected = isBookable && selectedIndex === index
                return (
                  <motion.article
                    key={`${item.title}-${index}`}
                    className={`padel-card${isSelected ? ' is-selected' : ''}${isBookable ? '' : ' padel-card--static'}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: isSelected ? -5 : 0 }}
                    transition={{ duration: 0.45, delay: index * 0.07, ease: EASE }}
                    {...(isBookable ? {
                      whileTap: { scale: 0.975 },
                      onClick: () => setSelectedIndex(index),
                      tabIndex: 0,
                      role: 'button',
                      'aria-pressed': isSelected,
                      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedIndex(index)
                        }
                      },
                    } : {})}
                  >
                    <div className="padel-card__image">
                      <img src={item.image || PADEL_ITEMS[index % PADEL_ITEMS.length].image || undefined} alt={item.title} />
                      <span className="padel-card__tag">
                        {index === 0 ? 'Most popular' : index === 1 ? 'Go longer' : index === 2 ? 'Level up' : index === 3 ? 'Fresh gear' : 'Game on'}
                      </span>
                    </div>
                    <div className="padel-card__body">
                      <div className="padel-card__title-row">
                        <h3>{item.title}</h3>
                        <motion.strong key={`${currency}-${item.title}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                          {currency === 'USD' ? item.price : item.lbpPrice}
                        </motion.strong>
                      </div>
                      <div className="padel-card__action">
                        {isBookable
                          ? (isSelected ? <><CheckIcon /> Ready to play</> : <>Pick this one <ArrowRight /></>)
                          : <>Ask the coach 😄</>}
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </section>

          <div className="padel-footer-note">
            <span className="padel-footer-note__spark" aria-hidden>✦</span>
            Good games, good coffee, good company.
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedItemCanBook && selectedItem && (
          <motion.div
            className="padel-booking-sheet"
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 120 }}
            transition={{ duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
            role="dialog"
            aria-label={`Book ${selectedItem.title}`}
          >
            <div className="padel-booking-sheet__copy">
              <span className="padel-booking-sheet__status"><CheckIcon /> Ready to play</span>
              <strong>{selectedItem.title}</strong>
              <span>{currency === 'USD' ? selectedItem.price : selectedItem.lbpPrice}</span>
            </div>
            <div className="padel-booking-sheet__actions">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="padel-booking-sheet__accept"
                onClick={openPadelWhatsApp}
              >
                Accept &amp; Book Now
                <ArrowRight />
              </motion.button>
              <button
                className="padel-booking-sheet__close"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close booking action"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}