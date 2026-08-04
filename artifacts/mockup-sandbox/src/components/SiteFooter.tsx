import OlivaLogo from './OlivaLogo'

// ── Footer contact info — edit these values ────────────────────────────────
const FOOTER_INFO = {
  description: 'From court to cup — your one-stop destination for padel, great coffee, and good times.',
  hours: 'Open daily · 9am – 11pm',
  instagram: 'https://instagram.com/oliva.padel',
  whatsappNumber: '961XXXXXXXX',
  whatsappMessage: 'Hello, I would like to ask about the café and padel court.',
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
  const waHref = `https://wa.me/${FOOTER_INFO.whatsappNumber}?text=${encodeURIComponent(FOOTER_INFO.whatsappMessage)}`

  const linkBase =
    'text-stone-400 hover:text-white transition-colors duration-200 text-left'

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
              {FOOTER_INFO.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => navigate('home')} className={linkBase}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('menu')} className={linkBase}>
                  Menu
                </button>
              </li>
              <li>
                <button onClick={onBook} className={linkBase}>
                  Book a Court
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className={linkBase}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li>Beirut, Lebanon</li>
              <li>+961 71 234 567</li>
              <li>hello@oliva.com</li>
              <li>{FOOTER_INFO.hours}</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              <a
                href={FOOTER_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-800 hover:bg-olive-600 transition-colors duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-800 hover:bg-[#25D366] transition-colors duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.89-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-stone-400 mt-4">{FOOTER_INFO.hours}</p>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
          {FOOTER_INFO.copyright}
        </div>
      </div>
    </footer>
  )
}
