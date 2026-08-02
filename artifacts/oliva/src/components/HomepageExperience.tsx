import { motion } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

interface CatCard {
  id: string;
  label: string;
  desc: string;
  gradient: string;
  accent: string;
  image: string;
  onClick: () => void;
}

export default function HomepageExperience({
  onViewMenu,
  onHotDrinks,
  onColdDrinks,
  onDesserts,
  onShisha,
  onSandwiches,
  onYogurt,
}: {
  onViewMenu: () => void
  onHotDrinks: () => void
  onColdDrinks: () => void
  onDesserts: () => void
  onShisha: () => void
  onSandwiches: () => void
  onYogurt: () => void
}) {
  const cards: CatCard[] = [
    { id: 'hot', label: 'Hot Drinks', desc: 'Warm & aromatic classics', gradient: 'linear-gradient(135deg,#f97316,#dc2626)', accent: '#fed7aa', image: 'https://images.pexels.com/photos/15851583/pexels-photo-15851583/free-photo-of-cappuccino-in-cup-on-table.jpeg?auto=compress&cs=tinysrgb&w=400', onClick: onHotDrinks },
    { id: 'cold', label: 'Cold Drinks', desc: 'Chilled & refreshing', gradient: 'linear-gradient(135deg,#0ea5e9,#2563eb)', accent: '#bae6fd', image: 'https://images.pexels.com/photos/22873679/pexels-photo-22873679.jpeg?auto=compress&cs=tinysrgb&w=400', onClick: onColdDrinks },
    { id: 'dessert', label: 'Desserts', desc: 'Sweet indulgence', gradient: 'linear-gradient(135deg,#ec4899,#be185d)', accent: '#fbcfe8', image: 'https://images.pexels.com/photos/16544183/pexels-photo-16544183/free-photo-of-sweet-cakes-on-plate.jpeg?auto=compress&cs=tinysrgb&w=400', onClick: onDesserts },
    { id: 'shisha', label: 'Shisha', desc: 'Premium flavors', gradient: 'linear-gradient(135deg,#eab308,#a16207)', accent: '#fef08a', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27303141487567135-FZOtUqnJn852MBeJeyIeP3bhfQy8iL.jpg', onClick: onShisha },
    { id: 'sandwiches', label: 'Sandwiches', desc: 'Fresh & delicious', gradient: 'linear-gradient(135deg,#f97316,#dc2626)', accent: '#fed7aa', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sandwich%20PNG-ALWYL1Ttrugnx7fPbCpNyn3mu4AcTN.jpg', onClick: onSandwiches },
    { id: 'yogurt', label: 'Yogurt', desc: 'Creamy & refreshing', gradient: 'linear-gradient(135deg,#d946ef,#be185d)', accent: '#f9a8d4', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14988611256100392-VcfSLudrmQ98JzCToSTWUmeOANUBaV.jpg', onClick: onYogurt },
  ]

  return (
    <section style={{
      position: 'relative', width: '100%', minHeight: '100svh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      paddingTop: 'max(clamp(20px,5vw,40px), 80px)',
      paddingLeft: 'clamp(20px,5vw,40px)',
      paddingRight: 'clamp(20px,5vw,40px)',
      paddingBottom: 'clamp(20px,5vw,40px)',
      background: 'linear-gradient(160deg,#1a2e1a,#0f1f0f 50%,#0a140a)',
    }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ marginBottom: 'clamp(16px,3vh,28px)' }}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oliva-logo-7vdw2NsA2Wofs4TtAyO49iJkZo8nn1.jpg"
          alt="Oliva"
          style={{
            width: 'clamp(72px,12vw,100px)', height: 'clamp(72px,12vw,100px)',
            borderRadius: '50%', objectFit: 'cover',
            border: '3px solid rgba(134,239,172,0.4)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        />
      </motion.div>

      {/* Hero content */}
      <div style={{ textAlign: 'center', maxWidth: 800 }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{
            fontSize: 'clamp(11px,1.5vw,14px)', fontWeight: 800, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#86efac', marginBottom: 'clamp(12px,2vh,20px)',
          }}
        >
          Padel · Café · Shisha
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          style={{
            fontSize: 'clamp(44px,11vw,110px)', fontWeight: 900, lineHeight: 0.95,
            letterSpacing: '-0.03em', color: '#f8fafc', margin: 0,
          }}
        >
          From Court
          <br />
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(180deg,#86efac,#4ade80)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            to Cup
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.2 }}
          style={{
            fontSize: 'clamp(16px,2.4vw,22px)', fontWeight: 500, fontStyle: 'italic',
            color: 'rgba(248,250,252,0.7)', marginTop: 'clamp(12px,2vh,20px)',
            maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
          }}
        >
          A grove, two courts, and the slowest afternoon you've ever had.
        </motion.p>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.3 }}
          onClick={onViewMenu}
          whileHover={{ scale: 1.06, y: -4, transition: { type: 'spring', stiffness: 320, damping: 14 } }}
          whileTap={{ scale: 0.94, transition: { duration: 0.1 } }}
          style={{
            marginTop: 'clamp(24px,4vh,40px)',
            padding: 'clamp(18px,2.5vw,26px) clamp(44px,6vw,72px)',
            borderRadius: 999, border: '2.5px solid rgba(134,239,172,0.5)', cursor: 'pointer',
            background: 'linear-gradient(135deg,#22c55e,#16a34a,#15803d)',
            color: '#f0fdf4',
            fontSize: 'clamp(20px,2.8vw,32px)',
            fontWeight: 900,
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 12px 40px rgba(34,197,94,0.45), inset 0 1px 0 rgba(134,239,172,0.3)',
            textShadow: '0 1px 6px rgba(0,0,0,0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          View Menu
        </motion.button>
      </div>

      {/* Buttons row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.5 }}
        style={{
          marginTop: 'clamp(28px,4vh,44px)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 'clamp(14px,2vw,24px)',
        }}
      >
        {/* Book a Padel — WhatsApp + racket */}
        <a
          href="https://olivacourt.lovable.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.96, transition: { duration: 0.12 } }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              padding: 'clamp(14px,2vw,18px) clamp(24px,3vw,32px)',
              borderRadius: 999, border: 'none',
              background: 'linear-gradient(135deg,#25D366,#128C7E)',
              color: '#fff', fontSize: 'clamp(13px,1.4vw,15px)', fontWeight: 800,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
            }}
          >
            {/* Padel racket icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="10" cy="9" rx="5.5" ry="7" transform="rotate(-20 10 9)" />
              <line x1="14.5" y1="15.5" x2="19" y2="20" />
              <circle cx="10" cy="9" r="2" transform="rotate(-20 10 9)" fill="currentColor" stroke="none" opacity="0.4" />
            </svg>
            Book a Padel
            {/* WhatsApp logo */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.89-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </motion.div>
          <p style={{
            margin: 0, fontSize: 'clamp(11px,1.2vw,13px)', fontWeight: 600,
            color: 'rgba(248,250,252,0.5)', textAlign: 'center', maxWidth: 280,
            lineHeight: 1.4, fontStyle: 'italic',
          }}>
            Click to view the courts available now on Oliva Padel website
          </p>
        </a>
      </motion.div>
    </section>
  )
}
