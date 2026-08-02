import { useState, useEffect } from 'react';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Menu from './components/Menu';
import HomepageExperience from './components/HomepageExperience';
import GalleryPage from './components/GalleryPage';
import ContactSection from './components/ContactSection';
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
  glowColor: '#38bdf8',
  text: '#f1f5f9',
  subtext: '#94a3b8',
  accent: '#7dd3fc',
};

const HOT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)',
  glowColor: '#f59e0b',
  text: '#fdf6e3',
  subtext: '#c9a57b',
  accent: '#fbbf24',
};

const DESSERT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5a1a3a,#8b1a4a 55%,#6e1240)',
  glowColor: '#ec4899',
  text: '#fdf2f8',
  subtext: '#d4a5b8',
  accent: '#f9a8d4',
};

const SHISHA_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#3d2e0a,#6b5010 55%,#4a3808)',
  glowColor: '#d4a017',
  text: '#f5f5f4',
  subtext: '#a8a29e',
  accent: '#d4a017',
};

const SANDWICHES_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)',
  glowColor: '#f59e0b',
  text: '#fdf6e3',
  subtext: '#c9a57b',
  accent: '#fbbf24',
};

const YOGURT_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#4a1a5a,#8b1a7a 55%,#6e1256)',
  glowColor: '#d946ef',
  text: '#fdf2f8',
  subtext: '#d4a5d8',
  accent: '#f472b6',
};

const PADEL_THEME: CategoryTheme = {
  bgGradient: 'linear-gradient(160deg,#003a4d,#006b8f 55%,#004d6b)',
  glowColor: '#06f6d4',
  text: '#f0f9fa',
  subtext: '#7dd3fc',
  accent: '#06f6d4',
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

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Show/hide the gallery logo based on scroll position
  useEffect(() => {
    const onScroll = () => {
      const transition = document.querySelector('.noh-transition') as HTMLElement | null;
      const galleryLogo = document.querySelector('.noh-gallery-logo') as HTMLElement | null;
      if (!transition || !galleryLogo) return;
      const rect = transition.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const progress = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;
      // Show when transition is ~90% complete, hide when gallery section is scrolled past
      const gallery = document.getElementById('gallery');
      const galleryRect = gallery?.getBoundingClientRect();
      const galleryVisible = galleryRect ? galleryRect.bottom > 100 : false;
      if (progress > 0.9 && galleryVisible) {
        galleryLogo.classList.add('visible');
      } else {
        galleryLogo.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigateHome = () => { window.location.hash = '/'; };
  const navigateMenu = () => { window.location.hash = '/menu'; };
  const navigateGallery = () => { window.location.hash = '/gallery'; };
  const navigateList = (cat: Category) => { window.location.hash = CATEGORY_DATA[cat].listHash; };
  const navigateDetail = (cat: Category, slug: string) => { window.location.hash = `/menu/${cat}/${slug}`; };


  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
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
          <SiteFooter navigate={navigateMenu} onBook={scrollToBooking} />
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
    
    return (
      <>
        <CategoryListPage
          title={data.title}
          subtitle={data.subtitle}
          theme={data.theme}
          subcategories={subcategoryData[route.category]}
          navigate={() => navigateHome()}
          onBack={navigateMenu}
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

  return (
    <>
      <div className="relative min-h-screen" style={{ background: '#1F2B18' }}>
        <Navbar navigate={(to) => { if (to === 'home') navigateHome(); else navigateMenu(); }} route={'home'} />
        <main className="relative z-10">
          <HomepageExperience
            onViewMenu={navigateMenu}
            onHotDrinks={() => navigateList('hot-drinks')}
            onColdDrinks={() => navigateList('cold-drinks')}
            onDesserts={() => navigateList('desserts')}
            onShisha={() => navigateList('shisha')}
            onSandwiches={() => navigateList('sandwiches')}
            onYogurt={() => navigateList('yogurt')}
          />
          <div style={{ position: 'relative', zIndex: 20 }}>
            <ContactSection />
          </div>
        </main>
        <SiteFooter navigate={navigateMenu} onBook={scrollToBooking} />
        <WhatsAppButton />
      </div>
    </>
  );
}

