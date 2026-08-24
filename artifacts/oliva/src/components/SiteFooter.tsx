import OlivaLogo from './OlivaLogo'
import { useContent } from '../contexts/ContentContext'

// ── Footer contact info — edit these values ────────────────────────────────
const FOOTER_INFO = {
  description: 'From court to cup — your one-stop destination for padel, great coffee, and good times.',
  hours: 'Open daily · 9am – 11pm',
  instagram: 'https://instagram.com/olivapadel',
  copyright: `© ${new Date().getFullYear()} Oliva. From Court to Cup.`,
}

type Route = 'home' | 'menu'

export default function SiteFooter({
  navigate,
  onBook,
}: {
  navigate: (to: Route) => void
  onBook: () => void
}) {
  const { settings } = useContent()
  const info = {
    ...FOOTER_INFO,
    description: settings.footer_description || FOOTER_INFO.description,
    hours: settings.opening_hours || FOOTER_INFO.hours,
    instagram: FOOTER_INFO.instagram,
    address: settings.contact_address || 'Beirut, Lebanon',
    phone: settings.contact_phone || '+961 71 234 567',
    email: settings.contact_email || 'hello@oliva.com',
  }
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <OlivaLogo size={64} showText={false} />
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              {info.description}
            </p>
          </div>

          {/* Primary action rail */}
          <div className="md:col-span-2">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#bdac73]">
              Quick buttons
            </p>
            <nav
              aria-label="Footer navigation"
              className="relative overflow-hidden rounded-[24px] border border-[#e0d5a6]/25 bg-white/[0.07] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -left-[10%] top-[-70%] h-[200%] w-[55%] bg-[radial-gradient(ellipse,rgba(222,205,133,0.14),transparent_56%)]" />
              <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => navigate('home')}
                  className="group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-[17px] border border-transparent text-xs font-bold tracking-[0.04em] text-stone-200/80 transition duration-200 hover:-translate-y-0.5 hover:border-[#ebda90]/45 hover:bg-white/[0.08] hover:text-[#fffdf5] focus-visible:-translate-y-0.5 focus-visible:border-[#ebda90]/45 focus-visible:bg-white/[0.08] focus-visible:text-[#fffdf5] focus-visible:outline-none sm:min-h-[105px]"
                >
                  <FooterHomeIcon />
                  <span>Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('menu')}
                  className="group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-[17px] border border-transparent text-xs font-bold tracking-[0.04em] text-stone-200/80 transition duration-200 hover:-translate-y-0.5 hover:border-[#ebda90]/45 hover:bg-white/[0.08] hover:text-[#fffdf5] focus-visible:-translate-y-0.5 focus-visible:border-[#ebda90]/45 focus-visible:bg-white/[0.08] focus-visible:text-[#fffdf5] focus-visible:outline-none sm:min-h-[105px]"
                >
                  <FooterMenuIcon />
                  <span>Menu</span>
                </button>
                <button
                  type="button"
                  onClick={onBook}
                  className="group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-[17px] border border-[#f5e79e]/30 bg-gradient-to-br from-[#dccb7e] to-[#b9a655] text-xs font-bold tracking-[0.04em] text-[#10150c] shadow-[0_8px_24px_rgba(201,179,91,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[#f5e79e] hover:bg-gradient-to-br hover:from-[#f1df8c] hover:to-[#cbb55f] focus-visible:-translate-y-0.5 focus-visible:border-[#f5e79e] focus-visible:outline-none sm:min-h-[105px]"
                >
                  <FooterCourtIcon />
                  <span>Book a Court</span>
                </button>
                <a
                  href={info.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Oliva Padel on Instagram"
                  className="group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-[17px] border border-transparent text-xs font-bold tracking-[0.04em] text-stone-200/80 transition duration-200 hover:-translate-y-0.5 hover:border-[#ebda90]/45 hover:bg-white/[0.08] hover:text-[#fffdf5] focus-visible:-translate-y-0.5 focus-visible:border-[#ebda90]/45 focus-visible:bg-white/[0.08] focus-visible:text-[#fffdf5] focus-visible:outline-none sm:min-h-[105px]"
                >
                  <FooterInstagramIcon />
                  <span>Instagram</span>
                </a>
              </div>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
               <li>{info.address}</li>
               <li>{info.phone}</li>
               <li>{info.email}</li>
               <li>{info.hours}</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
          {FOOTER_INFO.copyright}
        </div>
      </div>
    </footer>
  )
}

function FooterHomeIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}

function FooterMenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M5 7h14M5 12h14M5 17h9" />
    </svg>
  )
}

function FooterCourtIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h10l3 4v10l-3 4H7l-3-4V7Z" />
      <path d="M8 8h8M8 16h8M12 5v14" />
    </svg>
  )
}

function FooterInstagramIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  )
}
