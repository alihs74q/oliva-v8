import { useState, useEffect } from 'react';
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
import Menu from './components/Menu';
import GalleryPage from './components/GalleryPage';
import SiteFooter from './components/SiteFooter';
import WhatsAppButton from './components/WhatsAppButton';
import ColdDrinksPage from './components/ColdDrinksPage';
import DessertsPage from './components/DessertsPage';
import HotDrinksPage from './components/HotDrinksPage';
import ShishaPage from './components/ShishaPage';
import CategoryListPage, { type CategoryTheme } from './components/CategoryListPage';
import { subcategoryData } from './data/subcategories';
import PadelPage from './components/PadelPage';
import { useOfflineSupport } from './hooks/useOfflineSupport';
import { useImagePreloader, useCategoryPreload } from './hooks/useImagePreloader';


type Category = 'cold-drinks' | 'hot-drinks' | 'desserts' | 'shisha' | 'sandwiches' | 'yogurt' | 'padel';

type ParsedRoute =
  | { name: 'home' }
  | { name: 'menu' }
  | { name: 'gallery' }
  | { name: 'list'; category: Category }
  | { name: 'detail'; category: Category; slug: string };

function parseRoute(): ParsedRoute {
  if (typeof window === 'undefined') return { name: 'home' };
  const hash = window.location.hash.replace(/^#/, '');
  const listMatch = hash.match(/^\/menu\/(cold-drinks|hot-drinks|desserts|shisha|sandwiches|yogurt|padel)$/);
  if (listMatch) return { name: 'list', category: listMatch[1] as Category };
  const detailMatch = hash.match(/^\/menu\/(cold-drinks|hot-drinks|desserts|shisha|sandwiches|yogurt|padel)\/(.+)$/);
  if (detailMatch) return { name: 'detail', category: detailMatch[1] as Category, slug: detailMatch[2] };
  if (hash === '/menu') return { name: 'menu' };
  if (hash === '/gallery') return { name: 'gallery' };
  return { name: 'home' };
}



const COLD_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#0e3a5f,#1565a8 55%,#0a4a7a)',
  glowColor: '#D4A843',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  accent: '#D4A843', // Warm golden cream
};

const HOT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)',
  glowColor: '#E7A05A',
  text: '#fdf6e3',
  subtext: '#c9a57b',
  accent: '#E7A05A', // Light orange
};

const DESSERT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5a1a3a,#8b1a4a 55%,#6e1240)',
  glowColor: '#E5A4B7',
  text: '#fdf2f8',
  subtext: '#d4a5b8',
  accent: '#E5A4B7', // Soft pink
};

const SHISHA_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#3d2e0a,#6b5010 55%,#4a3808)',
  glowColor: '#C5A342',
  text: '#f5f5f4',
  subtext: '#a8a29e',
  accent: '#C5A342', // Elegant gold
};

const SANDWICHES_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)',
  glowColor: '#D8B84E',
  text: '#fdf6e3',
  subtext: '#c9a57b',
  accent: '#D8B84E', // Warm yellow
};

const YOGURT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#4a1a5a,#8b1a7a 55%,#6e1256)',
  glowColor: '#A78AC4',
  text: '#fdf2f8',
  subtext: '#d4a5d8',
  accent: '#A78AC4', // Soft purple
};

const PADEL_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#003a4d,#006b8f 55%,#004d6b)',
  glowColor: '#4F82C5',
  text: '#f0f9fa',
  subtext: '#7dd3fc',
  accent: '#4F82C5', // Clean blue
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
  const offlineStatus = useOfflineSupport();
  const imagePreloader = useImagePreloader();
  
  // Preload category images when navigating to list
  const { isReady: categoryReady } = useCategoryPreload(
    route.name === 'list' ? route.category : ''
  );

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
  const navigateList = (cat: Category) => { window.location.hash = CATEGORY_DATA[cat].listHash; };
  const navigateDetail = (cat: Category, slug: string) => { window.location.hash = `/menu/${cat}/${slug}`; };

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dedicated menu page
  if (route.name === 'menu') {
    return (
      <>
        <div className="relative min-h-screen">
          <Navbar navigate={(to) => { if (to === 'home') navigateHome(); else navigateMenu(); }} route={'menu'} />
          <main className="relative z-10">
            <Menu
              onBack={navigateHome}
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
          <WhatsAppButton />
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
          />
          <WhatsAppButton />
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
          subcategories={subcategoryData[route.category]}
          navigate={() => navigateHome()}
          onBack={navigateMenu}
          heroImages={HERO_IMAGES[route.category]}
        />
        <WhatsAppButton />
      </>
    );
  }

  // Product detail routes — render existing detail page with initialSlug + Back button
  if (route.name === 'detail') {
    const back = () => navigateList(route.category);
    if (route.category === 'cold-drinks') {
      return (<><ColdDrinksPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} /><WhatsAppButton /></>);
    }
    if (route.category === 'hot-drinks') {
      return (<><HotDrinksPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} /><WhatsAppButton /></>);
    }
    if (route.category === 'desserts') {
      return (<><DessertsPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} /><WhatsAppButton /></>);
    }
    if (route.category === 'shisha') {
      return (<><ShishaPage navigate={navigateMenu} onBack={back} /><WhatsAppButton /></>);
    }
  }

  // Dedicated gallery page
  if (route.name === 'gallery') {
    return (
      <>
        <div className="relative min-h-screen" style={{ background: '#0A0F06' }}>
          <Navbar navigate={(to) => { if (to === 'home') navigateHome(); else navigateMenu(); }} route={'home'} />
          <GalleryPage onViewMenu={navigateMenu} onBack={navigateHome} />
          <WhatsAppButton />
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
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%284%29-XnkqrdTFPK1XQiDPMZmAUqfH4w4IPy.png"
            alt="Oliva"
            style={{ width: '78%', height: '78%', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Eyebrow */}
        <p style={{
          margin: '0 0 14px', fontSize: 'clamp(11px,1.2vw,13px)', fontWeight: 800,
          letterSpacing: '0.32em', textTransform: 'uppercase', color: '#8aa86a',
        }}>Padel · Café · Shisha</p>

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
          From Court<br />to Cup
        </h1>

        {/* Subline */}
        <p style={{
          margin: '0 0 52px',
          fontSize: 'clamp(15px,1.5vw,18px)',
          color: 'rgba(245,242,232,0.6)',
          maxWidth: 460,
          lineHeight: 1.65,
        }}>
          A grove, two courts, and the slowest afternoon you've ever had.
        </p>

        {/* Scroll CTA */}
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
          View Menu
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </section>

      {/* ── Menu — zero changes inside ── */}
      <div id="menu-section">
        <Menu
          onHotDrinks={() => navigateList('hot-drinks')}
          onColdDrinks={() => navigateList('cold-drinks')}
          onDesserts={() => navigateList('desserts')}
          onShisha={() => navigateList('shisha')}
          onSandwiches={() => navigateList('sandwiches')}
          onYogurt={() => navigateList('yogurt')}
          onPadel={() => navigateList('padel')}
        />
      </div>

      <WhatsAppButton />
    </div>
  );
}

