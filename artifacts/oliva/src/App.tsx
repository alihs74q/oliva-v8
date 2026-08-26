import { useState, useEffect, lazy, Suspense } from 'react';
import hotDrinksMenuBoard from './assets/hot-drinks/hot-drinks-menu-board.jpeg';
import greenTeaPromo from './assets/hot-drinks/green-tea-promo.jpeg';
import classicTeaPromo from './assets/hot-drinks/classic-tea-promo.jpeg';
import threeFlavorsCafe from './assets/hot-drinks/three-flavors-cafe.jpeg';
import icedLatteMenu from './assets/cold-drinks/iced-latte-menu.jpeg';
import coffeeFrappeMenu from './assets/cold-drinks/coffee-frappe-menu.jpeg';
import refreshersMenu from './assets/cold-drinks/refreshers-menu.jpeg';
import smoothiesMenu from './assets/cold-drinks/smoothies-menu.jpeg';
import milkshakesMenu from './assets/cold-drinks/milkshakes-menu.jpeg';
import coldDrinksUploadedImage from '@assets/image_1786233684800.png';
import dessertsCategoryImage from '@assets/image_1786233947691.png';
import Navbar from './components/Navbar';
import SiteFooter from './components/SiteFooter';
import HomepageHero from './components/HomepageHero';
import Menu, { type MenuCard } from './components/Menu';
import CategoryListPage, { type CategoryTheme } from './components/CategoryListPage';
import { useOfflineSupport } from './hooks/useOfflineSupport';
import { ContentProvider } from './contexts/ContentContext';
import { useContent } from './contexts/ContentContext';

// Keep the homepage in the first bundle. Menu and detail pages are loaded only
// when a visitor opens them, which keeps the first paint fast on mobile data.
const loadPromoGallery = () => import('./components/PromoGallery');
const loadGalleryPage = () => import('./components/GalleryPage');
const loadOurPlace = () => import('./components/OurPlace');
const loadColdDrinksPage = () => import('./components/ColdDrinksPage');
const loadDessertsPage = () => import('./components/DessertsPage');
const loadHotDrinksPage = () => import('./components/HotDrinksPage');
const loadShishaPage = () => import('./components/ShishaPage');
const loadPadelPage = () => import('./components/PadelPage');

const PromoGallery = lazy(loadPromoGallery);
const GalleryPage = lazy(loadGalleryPage);
const OurPlace = lazy(loadOurPlace);
const ColdDrinksPage = lazy(loadColdDrinksPage);
const DessertsPage = lazy(loadDessertsPage);
const HotDrinksPage = lazy(loadHotDrinksPage);
const ShishaPage = lazy(loadShishaPage);
const PadelPage = lazy(loadPadelPage);
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
  const { promoGallery, sections, settings, subcategories: publishedSubcategories } = useContent();
  const menuCards = sections
    .filter((section) => section.slug !== 'padel')
    .map((section) => {
      const key = section.slug.replace(/-drinks$/, '').replace('desserts', 'dessert')
      const fallback = ({
        hot: { gradient: 'linear-gradient(135deg,#f97316,#dc2626)', accent: '#fed7aa', image: 'https://images.pexels.com/photos/15851583/pexels-photo-15851583/free-photo-of-cappuccino-in-cup-on-table.jpeg?auto=compress&cs=tinysrgb&w=400' },
        cold: { gradient: 'linear-gradient(135deg,#0ea5e9,#2563eb)', accent: '#bae6fd', image: 'https://images.pexels.com/photos/22873679/pexels-photo-22873679.jpeg?auto=compress&cs=tinysrgb&w=400' },
        dessert: { gradient: 'linear-gradient(135deg,#ec4899,#be185d)', accent: '#fbcfe8', image: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400' },
        shisha: { gradient: 'linear-gradient(135deg,#eab308,#a16207)', accent: '#fef08a', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-awRUXZgCUaSRd5LnoYKBVKhnE9Z36Z.png' },
        sandwiches: { gradient: 'linear-gradient(135deg,#f97316,#dc2626)', accent: '#fed7aa', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sandwich%20PNG-ALWYL1Ttrugnx7fPbCpNyn3mu4AcTN.jpg' },
        yogurt: { gradient: 'linear-gradient(135deg,#d946ef,#be185d)', accent: '#f9a8d4', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14988611256100392-VcfSLudrmQ98JzCToSTWUmeOANUBaV.jpg' },
        padel: { gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)', accent: '#06f6d4', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0a6RZwqQSo38UmBftouiTQtlg9C8Rc.png' },
      } as Record<string, { gradient: string; accent: string; image: string }>)[key] ?? { gradient: 'linear-gradient(135deg,#596b3d,#2c3a24)', accent: '#d4a843', image: null };
      const theme = (section.theme || {}) as Record<string, string>;
       return { id: section.slug, label: section.name, desc: section.subtitle, gradient: theme.gradient || fallback.gradient, accent: theme.accent || fallback.accent, image: section.slug === 'cold-drinks' ? coldDrinksUploadedImage : section.slug === 'desserts' ? dessertsCategoryImage : theme.image || fallback.image };
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

  // Warm the next screen immediately after the current one paints. Waiting
  // for browser idle time made a fast tap race the route download.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (route.name === 'home' || route.name === 'menu') {
        void loadPadelPage();
        [hotDrinksMenuBoard, icedLatteMenu].forEach((src) => {
          const image = new Image();
          image.decoding = 'async';
          image.src = src;
        });
      } else if (route.name === 'list') {
        if (route.category === 'padel') {
          void loadPadelPage();
        } else if (route.category === 'cold-drinks') {
          void loadColdDrinksPage();
        } else if (route.category === 'hot-drinks') {
          void loadHotDrinksPage();
        } else if (route.category === 'desserts') {
          void loadDessertsPage();
        } else if (route.category === 'shisha') {
          void loadShishaPage();
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [route.name, route.name === 'list' ? route.category : '']);

  const navigateHome = () => { window.location.hash = '/'; };
  const navigateMenu = () => { window.location.hash = '/menu'; };
  const navigateList = (cat: Category) => {
    if (cat === 'padel') void loadPadelPage();
    window.location.hash = CATEGORY_DATA[cat].listHash;
  };

  // Admin area — lazy-loaded, isolated from public site
  if (route.name === 'admin') {
    return (
      <Suspense fallback={<div style={{ minHeight: '100svh', background: '#0d1509' }} />}>
        <AdminApp />
      </Suspense>
    );
  }

  // Dedicated menu page
  if (route.name === 'menu') {
    return (
      <Suspense fallback={null}>
        <div style={{ background: '#faf9f4' }}>
          <main className="relative z-10">
            {promoGallery.some((slide) => slide.visible && slide.imageUrl) && (
              <div style={{ background: '#faf9f4', padding: 'clamp(80px,12vh,120px) clamp(16px,4vw,40px) 0' }}>
                <PromoGallery slides={promoGallery} />
              </div>
            )}
            <Menu
              onBack={navigateHome}
              cards={menuCards.length > 0 ? menuCards : undefined}
              onHotDrinks={() => navigateList('hot-drinks')}
              onColdDrinks={() => navigateList('cold-drinks')}
              onDesserts={() => navigateList('desserts')}
              onShisha={() => navigateList('shisha')}
              onSandwiches={() => navigateList('sandwiches')}
              onYogurt={() => navigateList('yogurt')}
              onPadel={() => navigateList('padel')}
            />
          </main>
          <SiteFooter
            navigate={(destination) => {
              if (destination === 'home') navigateHome();
              else navigateMenu();
            }}
            onBook={() => navigateList('padel')}
          />
        </div>
      </Suspense>
    );
  }

  // Category list page
  if (route.name === 'list') {
    const data = CATEGORY_DATA[route.category];

    // Padel gets its own custom page
    if (route.category === 'padel') {
      return (
        <Suspense fallback={null}>
          <PadelPage
            theme={data.theme}
            onBack={navigateMenu}
             items={publishedSubcategories.padel?.flatMap((sub) => sub.drinks).map((drink) => ({
               title: drink.name, description: drink.description, price: drink.price, lbpPrice: drink.lbpPrice, image: drink.image,
             }))}
          />
        </Suspense>
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
      <Suspense fallback={null}>
        <CategoryListPage
          title={data.title}
          subtitle={data.subtitle}
          theme={data.theme}
             subcategories={publishedSubcategories[route.category] ?? []}
          navigate={() => navigateHome()}
          onBack={navigateMenu}
          heroImages={HERO_IMAGES[route.category]}
        />
      </Suspense>
    );
  }

  // Product detail routes — render existing detail page with initialSlug + Back button
  if (route.name === 'detail') {
    const back = () => navigateList(route.category);
    if (route.category === 'cold-drinks') {
      return <Suspense fallback={null}><ColdDrinksPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} /></Suspense>;
    }
    if (route.category === 'hot-drinks') {
      return <Suspense fallback={null}><HotDrinksPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} /></Suspense>;
    }
    if (route.category === 'desserts') {
      return <Suspense fallback={null}><DessertsPage navigate={navigateMenu} onBack={back} initialSlug={route.slug} /></Suspense>;
    }
    if (route.category === 'shisha') {
      return <Suspense fallback={null}><ShishaPage navigate={navigateMenu} onBack={back} /></Suspense>;
    }
  }

  // Our Place cinematic page
  if (route.name === 'our-place') {
    return <Suspense fallback={null}><OurPlace onBack={navigateHome} /></Suspense>;
  }

  // Dedicated gallery page
  if (route.name === 'gallery') {
    return (
      <Suspense fallback={null}>
        <div className="relative min-h-screen" style={{ background: '#0A0F06' }}>
          <Navbar navigate={(to) => { if (to === 'home') navigateHome(); else navigateMenu(); }} route={'home'} />
          <GalleryPage onViewMenu={navigateMenu} onBack={navigateHome} />
        </div>
      </Suspense>
    );
  }

  // Home: reference-matched mobile-first hero followed by the existing homepage content
  return (
    <div style={{ background: '#faf9f4' }}>
      <HomepageHero
        onMenu={navigateMenu}
        onBook={() => navigateList('padel')}
      />

      {/* ── Menu ── */}
      <div id="menu-section">
        {promoGallery.some((slide) => slide.visible && slide.imageUrl) && (
          <div style={{ background: '#faf9f4', padding: 'clamp(56px,8vh,88px) clamp(16px,4vw,40px) 0' }}>
            <PromoGallery slides={promoGallery} />
          </div>
        )}
         <Menu
          cards={menuCards.length > 0 ? menuCards : undefined}
          onHotDrinks={() => navigateList('hot-drinks')}
          onColdDrinks={() => navigateList('cold-drinks')}
          onDesserts={() => navigateList('desserts')}
          onShisha={() => navigateList('shisha')}
          onSandwiches={() => navigateList('sandwiches')}
          onYogurt={() => navigateList('yogurt')}
          onPadel={() => navigateList('padel')}
        />
      </div>
      <SiteFooter
        navigate={(destination) => {
          if (destination === 'home') navigateHome();
          else navigateMenu();
        }}
        onBook={() => navigateList('padel')}
      />

    </div>
  );
}

