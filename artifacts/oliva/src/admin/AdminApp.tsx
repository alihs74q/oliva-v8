/**
 * AdminApp.tsx
 * ────────────
 * Self-contained admin area, rendered when the URL hash starts with /admin.
 * Has its own mini router (page state) entirely separate from the public site.
 * Search engines are excluded via meta + header.
 */

import { useEffect } from 'react';
import { useAdminSession } from './useAdminApi';
import AdminLogin from './AdminLogin';
import AdminHome from './AdminHome';
import SectionPage from './SectionPage';
import AdminSettings from './AdminSettings';
import AdminSecurity from './AdminSecurity';
import AdminReleases from './AdminReleases';
import AdminExchange from './AdminExchange';
import AdminPromotions from './AdminPromotions';
import { useState } from 'react';

type AdminPage =
  | { kind: 'home' }
  | { kind: 'section'; slug: string }
  | { kind: 'settings' }
  | { kind: 'security' }
  | { kind: 'releases' }
  | { kind: 'exchange' }
  | { kind: 'promotions' };

function parsePage(): AdminPage {
  if (typeof window === 'undefined') return { kind: 'home' };
  const hash = window.location.hash.replace(/^#/, '');
  const m = hash.match(/^\/admin\/section\/([^/]+)$/);
  if (m) return { kind: 'section', slug: m[1] };
  if (hash === '/admin/settings') return { kind: 'settings' };
  if (hash === '/admin/security') return { kind: 'security' };
  if (hash === '/admin/releases') return { kind: 'releases' };
  if (hash === '/admin/exchange') return { kind: 'exchange' };
  if (hash === '/admin/promotions') return { kind: 'promotions' };
  return { kind: 'home' };
}

function navigate(dest: string) {
  window.location.hash = dest;
}

export default function AdminApp() {
  const { session, loading, refresh } = useAdminSession();
  const [page, setPage] = useState<AdminPage>(parsePage);

  // Sync admin hash router
  useEffect(() => {
    const handler = () => setPage(parsePage());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Exclude from search engines
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(245,242,232,0.3)', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={refresh} />;
  }

  const goHome = () => navigate('/admin');

  const handleNavigate = (dest: string) => {
    if (dest.startsWith('section:')) {
      navigate(`/admin/section/${dest.slice(8)}`);
    } else {
      navigate(`/admin/${dest}`);
    }
  };

  // Render current page
  switch (page.kind) {
    case 'section':
      return <SectionPage sectionSlug={page.slug} onBack={goHome} />;
    case 'settings':
      return <AdminSettings onBack={goHome} />;
    case 'security':
      return <AdminSecurity onBack={goHome} />;
    case 'releases':
      return <AdminReleases onBack={goHome} />;
    case 'exchange':
      return <AdminExchange onBack={goHome} />;
    case 'promotions':
      return <AdminPromotions onBack={goHome} />;
    default:
      return (
        <AdminHome
          session={session}
          onLogout={refresh}
          onNavigate={handleNavigate}
        />
      );
  }
}
