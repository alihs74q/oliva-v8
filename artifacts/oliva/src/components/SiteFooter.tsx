import { PADEL_WHATSAPP_CONTACT_URL } from '../data/padelBooking'

type Route = 'home' | 'menu'

export default function SiteFooter({
  navigate,
  onBook,
  showMenu = true,
}: {
  navigate: (to: Route) => void
  onBook: () => void
  showMenu?: boolean
}) {
  const secondaryActionClass =
    'footer-action-button group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-[17px] border border-transparent text-xs font-bold tracking-[0.04em] text-stone-200/80 transition duration-200 hover:-translate-y-0.5 hover:border-[#ebda90]/45 hover:bg-white/[0.08] hover:text-[#fffdf5] focus-visible:-translate-y-0.5 focus-visible:border-[#ebda90]/45 focus-visible:bg-white/[0.08] focus-visible:text-[#fffdf5] focus-visible:outline-none sm:min-h-[105px]'

  return (
    <footer className="footer-action-section relative overflow-hidden bg-[linear-gradient(145deg,#101b0c,#1b2a14_58%,#111c0d)] px-4 py-14 sm:px-6 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -left-[10%] top-[-60%] h-[220%] w-[70%] bg-[radial-gradient(ellipse,rgba(121,146,73,0.18),transparent_58%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[15%] bottom-[-80%] h-[220%] w-[60%] bg-[radial-gradient(ellipse,rgba(212,168,67,0.1),transparent_58%)]" />

      <nav
        aria-label="Footer navigation"
        className="footer-action-rail relative mx-auto max-w-5xl overflow-hidden rounded-[24px] border border-[#e0d5a6]/25 bg-white/[0.07] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl"
      >
        <div className={`footer-action-grid relative grid grid-cols-2 gap-2 ${showMenu ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
          <button type="button" onClick={() => navigate('home')} className={secondaryActionClass}>
            <FooterHomeIcon />
            <span>Home</span>
          </button>
          {showMenu && (
            <button type="button" onClick={() => navigate('menu')} className={secondaryActionClass}>
              <FooterMenuIcon />
              <span>Menu</span>
            </button>
          )}
          <button
            type="button"
            onClick={onBook}
            className="footer-action-button footer-action-button--court group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-[17px] border border-[#f5e79e]/30 bg-gradient-to-br from-[#dccb7e] to-[#b9a655] text-xs font-bold tracking-[0.04em] text-[#10150c] shadow-[0_8px_24px_rgba(201,179,91,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[#f5e79e] hover:from-[#f1df8c] hover:to-[#cbb55f] focus-visible:-translate-y-0.5 focus-visible:border-[#f5e79e] focus-visible:outline-none sm:min-h-[105px]"
          >
            <FooterCourtIcon />
            <span>Book a Court</span>
          </button>
          <a
            href="https://instagram.com/olivapadel"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Oliva Padel on Instagram"
            className={secondaryActionClass}
          >
            <FooterInstagramIcon />
            <span>Instagram</span>
          </a>
        </div>

        <a
          href={PADEL_WHATSAPP_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Call Oliva on WhatsApp"
          className="footer-action-button--whatsapp relative mt-2 flex min-h-[58px] items-center justify-center gap-2 rounded-[17px] border border-[#65d882]/40 bg-[#1f7a43]/45 px-5 text-xs font-bold uppercase tracking-[0.08em] text-[#eaffee] shadow-[0_8px_24px_rgba(37,211,102,0.14),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-[#91f6aa] hover:bg-[#228a4c]/70 focus-visible:-translate-y-0.5 focus-visible:border-[#91f6aa] focus-visible:bg-[#228a4c]/70 focus-visible:outline-none"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#91f6aa]/45 bg-[#65d882]/15 text-[#91f6aa]">
            <FooterWhatsAppIcon />
          </span>
          <span>Call on WhatsApp</span>
        </a>
      </nav>
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
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M6.35 6.1c1.75 2.05 4.05 3.05 6.55 3.05s4.8-1 6.55-3.05" />
      <path d="M4.05 13.45c2.2-1.35 4.7-1.55 7.1-.62 2.4.93 4.9.73 7.1-.62" />
      <path d="M8.1 4.8c.85 1.35 1.25 2.8 1.25 4.35s-.4 3-1.25 4.35c-.85 1.35-1.25 2.8-1.25 4.35" opacity=".72" />
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

function FooterWhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.55 0 .24 5.31.24 11.84c0 2.08.54 4.11 1.57 5.91L.14 23.86l6.25-1.64a11.85 11.85 0 0 0 5.68 1.45h.01c6.53 0 11.84-5.31 11.84-11.84a11.8 11.8 0 0 0-3.4-8.35Zm-8.44 18.18h-.01a9.83 9.83 0 0 1-5.01-1.38l-.36-.21-3.71.97.99-3.62-.23-.37a9.84 9.84 0 0 1-1.5-5.24c0-5.45 4.43-9.88 9.89-9.88 2.64 0 5.12 1.03 6.98 2.89a9.8 9.8 0 0 1 2.9 6.99c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.48.71.31 1.26.49 1.69.63.72.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  )
}