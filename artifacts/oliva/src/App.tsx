import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { imageAssets } from './utils/imageAssets';
import OurPlace from './components/OurPlace';
import hotDrinksMenuBoard from './assets/hot-drinks/hot-drinks-menu-board.jpeg';
import greenTeaPromo from './assets/hot-drinks/green-tea-promo.jpeg';
import classicTeaPromo from './assets/hot-drinks/classic-tea-promo.jpeg';
import threeFlavorsCafe from './assets/hot-drinks/three-flavors-cafe.jpeg';
import icedLatteMenu from './assets/cold-drinks/iced-latte-menu.jpeg';
import coffeeFrappeMenu from './assets/cold-drinks/coffee-frappe-menu.jpeg';
import refreshersMenu from './assets/cold-drinks/refreshers-menu.jpeg';
import smoothiesMenu from './assets/cold-drinks/smoothies-menu.jpeg';
import milkshakesMenu from './assets/cold-drinks/milkshakes-menu.jpeg';
import Navbar from './components/Navbar';
import Menu, { type MenuCard } from './components/Menu';
import PromoGallery from './components/PromoGallery';
import GalleryPage from './components/GalleryPage';
import SiteFooter from './components/SiteFooter';
import ColdDrinksPage from './components/ColdDrinksPage';
import DessertsPage from './components/DessertsPage';
import HotDrinksPage from './components/HotDrinksPage';
import ShishaPage from './components/ShishaPage';
import CategoryListPage, { type CategoryTheme } from './components/CategoryListPage';
import PadelPage from './components/PadelPage';
import { useOfflineSupport } from './hooks/useOfflineSupport';
import { usePublishedContent } from './hooks/usePublishedContent';
import { ContentProvider } from './contexts/ContentContext';
import { useContent } from './contexts/ContentContext';

const AdminApp = lazy(() => import('./admin/AdminApp'));


type Category = 'cold-drinks' | 'hot-drinks' | 'desserts' | 'shisha' | 'sandwiches' | 'yogurt' | 'padel';

type ParsedRoute =
  | { name: 'home' }
  | { name: 'menu' }
  | { name: 'gallery' }
  | { name: 'our-place' }
  | { name: 'admin' }
  | { name: 'list'; category: Category }
  | { name: 'detail'; category: Category; slug: string };

function parseRoute(): ParsedRoute {
  if (typeof window === 'undefined') return { name: 'home' };
  const hash = window.location.hash.replace(/^#/, '');
  // Admin routes take precedence
  if (hash === '/admin' || hash.startsWith('/admin/')) return { name: 'admin' };
  const listMatch = hash.match(/^\/menu\/(cold-drinks|hot-drinks|desserts|shisha|sandwiches|yogurt|padel)$/);
  if (listMatch) return { name: 'list', category: listMatch[1] as Category };
  const detailMatch = hash.match(/^\/menu\/(cold-drinks|hot-drinks|desserts|shisha|sandwiches|yogurt|padel)\/(.+)$/);
  if (detailMatch) return { name: 'detail', category: detailMatch[1] as Category, slug: detailMatch[2] };
  if (hash === '/menu') return { name: 'menu' };
  if (hash === '/gallery') return { name: 'gallery' };
  if (hash === '/our-place') return { name: 'our-place' };
  return { name: 'home' };
}



const COLD_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#0e3a5f,#1565a8 55%,#0a4a7a)',
  glowColor: '#D4A843',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  accent: '#D4A843',
};

const HOT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)',
  glowColor: '#E7A05A',
  text: '#fdf6e3',
  subtext: '#c9a57b',
  accent: '#E7A05A',
};

const DESSERT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5a1a3a,#8b1a4a 55%,#6e1240)',
  glowColor: '#E5A4B7',
  text: '#fdf2f8',
  subtext: '#d4a5b8',
  accent: '#E5A4B7',
};

const SHISHA_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#3d2e0a,#6b5010 55%,#4a3808)',
  glowColor: '#C5A342',
  text: '#f5f5f4',
  subtext: '#a8a29e',
  accent: '#C5A342',
};

const SANDWICHES_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)',
  glowColor: '#D8B84E',
  text: '#fdf6e3',
  subtext: '#c9a57b',
  accent: '#D8B84E',
};

const YOGURT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#4a1a5a,#8b1a7a 55%,#6e1256)',
  glowColor: '#A78AC4',
  text: '#fdf2f8',
  subtext: '#d4a5d8',
  accent: '#A78AC4',
};

const PADEL_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#003a4d,#006b8f 55%,#004d6b)',
  glowColor: '#4F82C5',
  text: '#f0f9fa',
  subtext: '#7dd3fc',
  accent: '#4F82C5',
};

const CATEGORY_DATA: Record<Category, { title: string; subtitle: string; theme: CategoryTheme; listHash: string }> = {
  'cold-drinks': { title: 'Cold Drinks', subtitle: 'Chilled & Refreshing', theme: COLD_THEME, listHash: '/menu/cold-drinks' },
  'hot-drinks': { title: 'Hot Drinks', subtitle: 'Warm & Aromatic', theme: HOT_THEME, listHash: '/menu/hot-drinks' },
  'desserts': { title: 'Desserts', subtitle: 'Sweet Indulgence', theme: DESSERT_THEME, listHash: '/menu/desserts' },
  'shisha': { title: 'Shisha', subtitle: 'Premium Flavors', theme: SHISHA_THEME, listHash: '/menu/shisha' },
  'sandwiches': { title: 'Sandwiches', subtitle: 'Fresh & Delicious', theme: SANDWICHES_THEME, listHash: '/menu/sandwiches' },
  'yogurt': { title: 'Yogurt', subtitle: 'Creamy & Refreshing', theme: YOGURT_THEME, listHash: '/menu/yogurt' },
  'padel': { title: 'Padel', subtitle: 'Court & Coaching', theme: PADEL_THEME, listHash: '/menu/padel' },
};

export default function App() {
  const [route, setRoute] = useState<ParsedRoute>(parseRoute);
  // Public content is rendered only after both API-backed content sources load.
  const { subcategories: publishedSubcategories, status: publishedStatus } = usePublishedContent();
  const { promoGallery, sections, settings, status: contentStatus } = useContent();
  const menuCards: MenuCard[] = sections
    .filter((section) => section.slug !== 'padel')
    .map((section) => {
      const key = section.slug.replace(/-drinks$/, '').replace('desserts', 'dessert')
      const fallback = ({
         hot: { gradient: 'linear-gradient(135deg,#7a4d2a,#3f2516)', accent: '#fed7aa' },
         cold: { gradient: 'linear-gradient(135deg,#2d617b,#163b4b)', accent: '#bae6fd' },
         dessert: { gradient: 'linear-gradient(135deg,#6f3650,#3e1e2d)', accent: '#fbcfe8' },
         shisha: { gradient: 'linear-gradient(135deg,#6e5718,#352b0b)', accent: '#fef08a' },
         sandwiches: { gradient: 'linear-gradient(135deg,#7a4d2a,#3f2516)', accent: '#fed7aa' },
         yogurt: { gradient: 'linear-gradient(135deg,#704284,#3e214a)', accent: '#f9a8d4' },
         padel: { gradient: 'linear-gradient(135deg,#17677a,#103b48)', accent: '#06f6d4' },
      } as Record<string, { gradient: string; accent: string }>)[key] ?? { gradient: 'linear-gradient(135deg,#596b3d,#2c3a24)', accent: '#d4a843' };
      const theme = (section.theme || {}) as Record<string, string>;
      return { id: section.slug, label: section.name, desc: section.subtitle, gradient: theme.gradient || fallback.gradient, accent: theme.accent || fallback.accent, image: theme.image || null };
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const offlineStatus = useOfflineSupport();
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateHome = () => { window.location.hash = '/'; };
  const navigateMenu = () => { window.location.hash = '/menu'; };
  const navigateOurPlace = () => { window.location.hash = '/our-place'; };
  const navigateList = (cat: Category) => { window.location.hash = CATEGORY_DATA[cat].listHash; };

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Admin area — lazy-loaded, isolated from public site
  if (route.name === 'admin') {
    return (
      <Suspense fallback={<div style={{ minHeight: '100svh', background: '#0d1509' }} />}>
        <AdminApp />
      </Suspense>
    );
  }

  if (publishedStatus !== 'api' || contentStatus !== 'api') {
    const error = publishedStatus === 'error' || contentStatus === 'error';
    return (
      <div style={{ minHeight: '100svh', background: '#0d1509', color: '#f5f2e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div>
          <div style={{ width: 42, height: 42, border: '3px solid rgba(212,168,67,0.22)', borderTopColor: '#D4A843', borderRadius: '50%', margin: '0 auto 18px', animation: 'oliva-content-spin 0.9s linear infinite' }} />
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{error ? 'Live menu is temporarily unavailable' : 'Loading the live menu…'}</p>
          <p style={{ margin: '8px 0 0', color: 'rgba(245,242,232,0.55)', fontSize: 13 }}>Only the latest published admin content is shown. Retrying automatically.</p>
        </div>
      </div>
    );
  }

  // Dedicated menu page
  if (route.name === 'menu') {
    return (
      <>
        <div style={{ background: '#faf9f4' }}>
          <main className="relative z-10">
            {promoGallery.some((slide) => slide.visible && slide.imageUrl) && (
              <div style={{ background: '#faf9f4', padding: 'clamp(80px,12vh,120px) clamp(16px,4vw,40px) 0' }}>
                <PromoGallery slides={promoGallery} />
              </div>
            )}
            <Menu
              onBack={navigateHome}
              cards={menuCards}
              onHotDrinks={() => navigateList('hot-drinks')}
              onColdDrinks={() => navigateList('cold-drinks')}
              onDesserts={() => navigateList('desserts')}
              onShisha={() => navigateList('shisha')}
              onSandwiches={() => navigateList('sandwiches')}
              onYogurt={() => navigateList('yogurt')}
              onPadel={() => navigateList('padel')}
            />
          </main>
          <SiteFooter navigate={navigateMenu} onBook={navigateMenu} />
        </div>
      </>
    );
  }

  // Category list page
  if (route.name === 'list') {
    const data = CATEGORY_DATA[route.category];

    // Padel gets its own custom page
    if (route.category === 'padel') {
      return (
        <>
          <PadelPage
            theme={data.theme}
            onBack={navigateMenu}
             items={publishedSubcategories.padel?.flatMap((sub) => sub.drinks).map((drink) => ({
               title: drink.name, description: drink.description, price: drink.price, lbpPrice: drink.lbpPrice, image: drink.image,
             }))}
          />
        </>
      );
    }

    const HERO_IMAGES: Partial<Record<Category, string[]>> = {
      'hot-drinks': [
        hotDrinksMenuBoard,
        greenTeaPromo,
        classicTeaPromo,
        threeFlavorsCafe,
      ],
      'cold-drinks': [
        icedLatteMenu,
        coffeeFrappeMenu,
        refreshersMenu,
        smoothiesMenu,
        milkshakesMenu,
      ],
    };

    return (
      <>
        <CategoryListPage
          title={data.title}
          subtitle={data.subtitle}
          theme={data.theme}
           subcategories={publishedSubcategories[route.category] ?? []}
          navigate={() => navigateHome()}
          onBack={navigateMenu}
          heroImages={HERO_IMAGES[route.category]}
        />
      </>
    );
  }

  // Product detail routes — render existing detail page with initialSlug + Back button
  if (route.name === 'detail') {
    const back = () => navigateList(route.category);
    if (route.category === 'cold-drinks') {
      return <ColdDrinksPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} />;
    }
    if (route.category === 'hot-drinks') {
      return <HotDrinksPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} />;
    }
    if (route.category === 'desserts') {
      return <DessertsPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} />;
    }
    if (route.category === 'shisha') {
      return <ShishaPage navigate={navigateMenu} onBack={back} />;
    }
  }

  // Our Place cinematic page
  if (route.name === 'our-place') {
    return <OurPlace onBack={navigateHome} />;
  }

  // Dedicated gallery page
  if (route.name === 'gallery') {
    return (
      <>
        <div className="relative min-h-screen" style={{ background: '#0A0F06' }}>
          <Navbar navigate={(to) => { if (to === 'home') navigateHome(); else navigateMenu(); }} route={'home'} />
          <GalleryPage onViewMenu={navigateMenu} onBack={navigateHome} />
        </div>
      </>
    );
  }

  // Home: compact hero that smooth-scrolls into the menu below
  return (
    <div style={{ background: '#faf9f4' }}>
      {/* ── Mini Hero ── */}
      <section style={{
        minHeight: '100svh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg,#1a2612,#2c3a24 60%,#1e2e16)',
        textAlign: 'center',
        padding: '60px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Olive branch — decorative */}
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%285%29-I4zRXdmd0oQXqKRice8ElgxI5yEMtN.png"
          alt=""
          style={{
            position: 'absolute', right: '-4%', top: '4%',
            width: 'clamp(180px,28vw,380px)', height: 'auto',
            opacity: 0.22, pointerEvents: 'none',
          }}
        />

        {/* Logo circle */}
        <div style={{
          width: 'clamp(130px,16vw,190px)',
          height: 'clamp(130px,16vw,190px)',
          borderRadius: '50%',
          background: '#596B3D',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 36, flexShrink: 0,
          boxShadow: '0 8px 40px rgba(89,107,61,0.45)',
        }}>
          <img
            src={imageAssets.logo}
            alt="Oliva"
            style={{ width: '78%', height: '78%', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Eyebrow */}
           <p style={{
          margin: '0 0 14px', fontSize: 'clamp(11px,1.2vw,13px)', fontWeight: 800,
          letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8aa86a',
        }}>{settings.hero_eyebrow ?? ''}</p>

        {/* Headline */}
        <h1 style={{
          margin: '0 0 14px',
          fontSize: 'clamp(44px,7vw,84px)',
          fontWeight: 900,
          color: '#f5f2e8',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          maxWidth: 680,
        }}>
          {(settings.hero_headline_line1 ?? '')}<br />{(settings.hero_headline_line2 ?? '')}
        </h1>

        {/* Subline */}
        <p style={{
          margin: '0 0 52px',
          fontSize: 'clamp(15px,1.5vw,18px)',
          color: 'rgba(245,242,232,0.6)',
          maxWidth: 460,
          lineHeight: 1.65,
        }}>
           {settings.hero_subline ?? ''}
        </p>

        {/* CTA group */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* View Menu */}
          <button
            onClick={scrollToMenu}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#596B3D', color: '#f5f2e8',
              border: 'none', borderRadius: 999,
              padding: '16px 38px',
              fontSize: 15, fontWeight: 800, letterSpacing: '0.06em',
              cursor: 'pointer',
              boxShadow: '0 4px 28px rgba(89,107,61,0.45)',
            }}
          >
             {settings.hero_menu_button ?? ''}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>

          {/* Our Place */}
          <OurPlaceButton onClick={navigateOurPlace} />
        </div>
        <button
          onClick={() => navigateList('padel')}
          style={{
             marginTop: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
             padding: '13px 25px 13px 22px',
            borderRadius: 999,
             border: '1px solid rgba(212,168,67,0.72)',
             background: 'linear-gradient(135deg, #596B3D, #71864d)',
             boxShadow: '0 8px 26px rgba(89,107,61,0.4), 0 0 0 4px rgba(212,168,67,0.08), inset 0 1px 0 rgba(255,255,255,0.2)',
             color: '#f5f2e8',
            fontSize: 13,
            fontWeight: 800,
             letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
        >
           <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 23, height: 23, borderRadius: '50%', background: 'rgba(245,242,232,0.16)', border: '1px solid rgba(245,242,232,0.28)' }}>
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f5f2e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="8" cy="16" r="4" />
               <path d="M11 13L18 6M15 4l5 5M18 6l2 2" />
             </svg>
           </span>
           Let's Play Padel
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </section>

      {/* ── Menu ── */}
      <div id="menu-section">
        {promoGallery.some((slide) => slide.visible && slide.imageUrl) && (
          <div style={{ background: '#faf9f4', padding: 'clamp(56px,8vh,88px) clamp(16px,4vw,40px) 0' }}>
            <PromoGallery slides={promoGallery} />
          </div>
        )}
         <Menu
           cards={menuCards}
          onHotDrinks={() => navigateList('hot-drinks')}
          onColdDrinks={() => navigateList('cold-drinks')}
          onDesserts={() => navigateList('desserts')}
          onShisha={() => navigateList('shisha')}
          onSandwiches={() => navigateList('sandwiches')}
          onYogurt={() => navigateList('yogurt')}
          onPadel={() => navigateList('padel')}
        />
      </div>

    </div>
  );
}

// ─── "Our Place" hero button ─────────────────────────────
function OurPlaceButton({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref.current) return;
        ref.current.style.borderColor = 'rgba(212,168,67,0.8)';
        ref.current.style.boxShadow = '0 0 22px rgba(212,168,67,0.28), 0 4px 20px rgba(0,0,0,0.35)';
        ref.current.style.transform = 'translateY(-2px)';
        const arrow = ref.current.querySelector('.op-arrow') as HTMLElement | null;
        if (arrow) arrow.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        ref.current.style.borderColor = 'rgba(212,168,67,0.35)';
        ref.current.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
        ref.current.style.transform = 'translateY(0)';
        const arrow = ref.current.querySelector('.op-arrow') as HTMLElement | null;
        if (arrow) arrow.style.transform = 'translateX(0)';
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        background: 'rgba(26,38,18,0.55)',
        border: '1px solid rgba(212,168,67,0.35)',
        borderRadius: 999,
        padding: '15px 36px',
        color: 'rgba(245,242,232,0.88)',
        fontSize: 15, fontWeight: 800, letterSpacing: '0.06em',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
      }}
    >
      Our Place
      <span
        className="op-arrow"
        style={{
          display: 'inline-flex',
          transition: 'transform 0.25s ease',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}
