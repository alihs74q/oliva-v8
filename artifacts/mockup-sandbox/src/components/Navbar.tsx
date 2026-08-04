import { useState, useEffect } from 'react';

type Route = 'home' | 'menu';

const LOGO_IMAGE = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%284%29-GByP5sVS3LhSdjsjAr4JjpTKy3UrSX.png';

export default function Navbar({ navigate, route }: { navigate: (to: Route) => void; route: Route }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (to: Route) => { setMenuOpen(false); navigate(to); };

  const links: { to: Route; label: string }[] = [
    { to: 'home', label: 'Home' },
    { to: 'menu', label: 'Menu' },
  ];


  return (
    <nav
      className="fixed left-0 right-0 z-50 transition-all duration-500"
      style={{
        top: scrolled ? '12px' : '18px',
        paddingLeft: '12px',
        paddingRight: '12px',
      }}
    >
      <div
        className="max-w-6xl mx-auto flex items-center justify-between transition-all duration-500"
        style={{
          height: scrolled ? '58px' : '68px',
          paddingLeft: '20px',
          paddingRight: '14px',
          borderRadius: '999px',
          background: scrolled
            ? 'linear-gradient(180deg, rgba(31,43,24,0.72) 0%, rgba(15,22,10,0.72) 100%)'
            : 'linear-gradient(180deg, rgba(31,43,24,0.45) 0%, rgba(15,22,10,0.45) 100%)',
          backdropFilter: 'blur(18px) saturate(160%)',
          border: '1px solid rgba(220,207,182,0.18)',
          boxShadow: scrolled
            ? '0 20px 50px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset'
            : '0 10px 40px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}
      >
        <button
          onClick={() => go('home')}
          className="flex items-center"
          style={{
            height: scrolled ? '120px' : '140px',
            perspective: '1200px',
            transition: 'height 500ms ease',
            marginTop: scrolled ? '-31px' : '-36px',
            marginBottom: scrolled ? '-31px' : '-36px',
            position: 'relative',
            zIndex: 1,
          }}
          aria-label="Oliva — From Court to Cup"
          onMouseEnter={(e) => {
            const img = e.currentTarget.querySelector('img') as HTMLImageElement;
            if (img) {
              img.style.transform = 'rotateY(15deg) rotateX(5deg) scale(1.08)';
            }
          }}
          onMouseLeave={(e) => {
            const img = e.currentTarget.querySelector('img') as HTMLImageElement;
            if (img) {
              img.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
            }
          }}
        >
          <img
            src={LOGO_IMAGE}
            alt="Oliva — From Court to Cup"
            className="h-full w-auto object-contain logo-3d"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.55))',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
            draggable={false}
          />
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l, i) => {
            const active = route === l.to && l.label !== 'Contact';
            return (
              <button
                key={`${l.to}-${i}`}
                onClick={() => go(l.to)}
                className="relative px-4 py-2 text-[13px] font-medium transition-all duration-300 group"
                style={{
                  color: active ? '#F5EBD2' : 'rgba(245,241,230,0.72)',
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F5EBD2')}
                onMouseLeave={(e) => (e.currentTarget.style.color = active ? '#F5EBD2' : 'rgba(245,241,230,0.72)')}
              >
                {l.label}
                <span
                  className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[1.5px] transition-all duration-300 rounded-full"
                  style={{
                    width: active ? '18px' : '0px',
                    background: 'linear-gradient(90deg, #CCA478, #DCCFB6)',
                    boxShadow: '0 0 8px rgba(204,164,120,0.6)',
                  }}
                />
              </button>
            );
          })}

          {/* Reserve CTA */}
          <button
            onClick={() => go('menu')}
            className="ml-3 relative overflow-hidden group"
            style={{
              padding: '10px 22px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(143,166,114,0.35) 0%, rgba(74,103,65,0.55) 100%)',
              border: '1px solid rgba(220,207,182,0.35)',
              color: '#F5EBD2',
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              boxShadow: '0 8px 24px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14)',
              transition: 'transform 220ms ease, box-shadow 220ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 14px 34px -8px rgba(0,0,0,0.55), 0 0 24px rgba(204,164,120,0.35), inset 0 1px 0 rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14)';
            }}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              View Menu
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'radial-gradient(120px circle at 50% 50%, rgba(220,207,182,0.35), transparent 70%)' }}
            />
          </button>
        </div>

        {/* Mobile burger — glass pill with animated bars */}
        <button
          className="md:hidden relative inline-flex items-center justify-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            width: '48px',
            height: '48px',
            padding: 0,
            flexShrink: 0,
            borderRadius: '999px',
            background: menuOpen
              ? 'linear-gradient(135deg, rgba(143,166,114,0.5) 0%, rgba(74,103,65,0.6) 100%)'
              : 'linear-gradient(135deg, rgba(220,207,182,0.14) 0%, rgba(74,103,65,0.25) 100%)',
            border: '1px solid rgba(220,207,182,0.35)',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)',
            transition: 'background 260ms ease, transform 260ms ease',
            transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <span className="relative" style={{ width: '20px', height: '14px' }}>
            <span style={{
              position: 'absolute', left: 0, top: 0, width: '100%', height: '2px',
              background: '#F5EBD2', borderRadius: '2px',
              transition: 'transform 300ms cubic-bezier(0.68,-0.55,0.27,1.55), top 300ms ease',
              transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
              boxShadow: '0 0 6px rgba(220,207,182,0.35)',
            }} />
            <span style={{
              position: 'absolute', left: 0, top: '6px', width: '100%', height: '2px',
              background: '#F5EBD2', borderRadius: '2px',
              transition: 'opacity 200ms ease, transform 200ms ease',
              opacity: menuOpen ? 0 : 1,
              transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)',
            }} />
            <span style={{
              position: 'absolute', left: 0, top: '12px', width: '100%', height: '2px',
              background: '#F5EBD2', borderRadius: '2px',
              transition: 'transform 300ms cubic-bezier(0.68,-0.55,0.27,1.55), top 300ms ease',
              transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
              boxShadow: '0 0 6px rgba(220,207,182,0.35)',
            }} />
          </span>
        </button>
      </div>

      {/* Mobile drop — larger, prominent items */}
      <div
        className="md:hidden max-w-6xl mx-auto overflow-hidden transition-all duration-500"
        style={{
          marginTop: menuOpen ? '12px' : '0px',
          maxHeight: menuOpen ? '520px' : '0px',
          opacity: menuOpen ? 1 : 0,
          borderRadius: '28px',
          background: 'linear-gradient(180deg, rgba(31,43,24,0.92) 0%, rgba(11,17,10,0.92) 100%)',
          backdropFilter: 'blur(24px) saturate(160%)',
          border: menuOpen ? '1px solid rgba(220,207,182,0.22)' : '1px solid transparent',
          boxShadow: menuOpen ? '0 30px 70px -20px rgba(0,0,0,0.65)' : 'none',
        }}
      >
        <div className="px-6 py-6 space-y-2">
          {links.map((l, i) => (
            <button
              key={`m-${l.to}-${i}`}
              onClick={() => go(l.to)}
              className="flex items-center justify-between w-full py-4 group"
              style={{
                color: '#F5EBD2',
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                borderBottom: i < links.length - 1 ? '1px solid rgba(220,207,182,0.1)' : 'none',
              }}
            >
              <span className="flex items-center gap-3">
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #CCA478, #DCCFB6)',
                  boxShadow: '0 0 10px rgba(204,164,120,0.6)',
                }} />
                {l.label}
              </span>
              <span className="transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: 'rgba(220,207,182,0.6)', fontSize: '20px' }}>→</span>
            </button>
          ))}
          <button
            onClick={() => go('menu')}
            className="mt-4 w-full py-4 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(143,166,114,0.45) 0%, rgba(74,103,65,0.65) 100%)',
              border: '1px solid rgba(220,207,182,0.4)',
              color: '#F5EBD2',
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              boxShadow: '0 14px 34px -10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            View Menu →
          </button>
        </div>
      </div>
    </nav>
  );
}

