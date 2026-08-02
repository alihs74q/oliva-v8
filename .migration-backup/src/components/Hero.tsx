import GlassyMenuButton from './GlassyMenuButton';
import WhatsAppBookButton from './WhatsAppBookButton';

export default function Hero({ onViewMenu }: { onViewMenu: () => void }) {
  const scrollToIntro = () => {
    const el = document.getElementById('hero-intro');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-16">
      {/* Top block — first thing the customer sees */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full text-center py-20">
        <div className="space-y-8 animate-fade-up flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-olive-600/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-olive-600 animate-pulse" />
            <span className="text-sm font-medium text-olive-600 tracking-wide">Now Open · Padel + Café</span>
          </div>

          <div className="flex flex-col items-center" style={{ gap: '16px' }}>
            <GlassyMenuButton onClick={onViewMenu} />
            <WhatsAppBookButton />
          </div>

          <button
            onClick={scrollToIntro}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-olive-600 bg-olive-600/15 backdrop-blur-md text-olive-700 font-semibold tracking-wide transition-all duration-300 hover:bg-olive-600/25 hover:border-olive-700 hover:scale-105 active:scale-95"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            <span className="text-sm uppercase">scroll to view more</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll target — revealed below */}
      <div id="hero-intro" className="w-full flex flex-col items-center justify-center text-center py-24 scroll-mt-24">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-800 leading-tight">
          From <span className="text-olive-600">Court</span><br />to <span className="text-olive-600">Cup</span>
        </h1>
        <p className="text-lg text-stone-500 leading-relaxed max-w-md mt-6">
          Two premium padel courts, a cozy café, a kids zone, and a giant screen. Everything you need for the perfect day out.
        </p>
      </div>
    </section>
  );
}
