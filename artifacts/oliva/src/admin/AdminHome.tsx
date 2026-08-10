import { useState, useEffect } from 'react';
import { imageAssets } from '../utils/imageAssets';
import {
  apiLogout, apiPublish, apiGetSections, apiUpdateSection, apiCreateSection,
  apiDeleteSection, apiRestoreSection, apiReorderSections, type AdminSession,
} from './useAdminApi';
import type { ApiSection } from '../hooks/usePublishedContent';
import SectionModal from './SectionModal';
import { notifyPublishedContentChanged } from '../utils/contentRefresh';

interface Props {
  session: AdminSession;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const GOLD = '#D4A843';
const OLIVA_GREEN = '#596B3D';

// Fallback colors per slug if theme unavailable
const SLUG_COLORS: Record<string, string> = {
  'cold-drinks': '#0e3a5f', 'hot-drinks': '#5c2e0a', 'desserts': '#5a1a3a',
  'shisha': '#3d2e0a', 'sandwiches': '#4a2010', 'yogurt': '#4a1a5a', 'padel': '#003a4d',
};
const SLUG_ICONS: Record<string, string> = {
  'cold-drinks': '🧊', 'hot-drinks': '☕', 'desserts': '🍰',
  'shisha': '💨', 'sandwiches': '🥪', 'yogurt': '🫙', 'padel': '🏓',
};

export default function AdminHome({ session, onLogout, onNavigate }: Props) {
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');
  const [editingSection, setEditingSection] = useState<ApiSection | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    apiGetSections().then((data: ApiSection[]) => setSections(data)).catch(() => {});
  }, []);

  const handleLogout = async () => { await apiLogout(); onLogout(); };

  const handlePublish = async () => {
    setPublishing(true); setPublishMsg('');
    try {
      await apiPublish();
      notifyPublishedContentChanged();
      setPublishMsg('✅ Published! Live site updated.');
    } catch {
      setPublishMsg('❌ Publish failed. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const reload = async () => {
    const data = await apiGetSections() as ApiSection[];
    setSections(data);
  };

  const moveSection = async (index: number, direction: -1 | 1) => {
    const visible = sections.filter((s) => showDeleted || !s.deleted).sort((a, b) => a.sortOrder - b.sortOrder);
    const target = index + direction;
    if (target < 0 || target >= visible.length) return;
    const ids = visible.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await apiReorderSections(ids);
    await reload();
  };

  return (
    <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,168,67,0.15)',
        padding: '0 clamp(16px,4vw,40px)', height: 64, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: OLIVA_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imageAssets.logo} alt="" style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#f5f2e8', letterSpacing: '0.04em' }}>Oliva</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: GOLD, fontWeight: 600 }}>Admin</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(245,242,232,0.45)' }}>{session.email}</span>
          <button onClick={handleLogout} style={ghostBtn}>Sign out</button>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,40px)' }}>
        {/* Publish */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, color: '#f5f2e8', letterSpacing: '-0.02em' }}>Content Manager</h2>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(245,242,232,0.45)' }}>Edit menu sections, products, and site content below.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button onClick={handlePublish} disabled={publishing} style={{
              padding: '12px 24px', background: publishing ? 'rgba(212,168,67,0.4)' : GOLD, color: '#1a1a0a',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, letterSpacing: '0.06em',
              cursor: publishing ? 'default' : 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap',
            }}>
              {publishing ? 'Publishing…' : '🚀 Publish Live'}
            </button>
            {publishMsg && <span style={{ fontSize: 12, color: publishMsg.startsWith('✅') ? '#86efac' : '#fca5a5' }}>{publishMsg}</span>}
          </div>
        </div>

        {/* Menu sections — dynamic from API */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', color: GOLD, textTransform: 'uppercase' }}>
              Menu Sections {sections.length > 0 && <span style={{ color: 'rgba(245,242,232,0.3)', fontWeight: 400 }}>({sections.length})</span>}
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ color: 'rgba(245,242,232,0.45)', fontSize: 12 }}>
                <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} /> Show deleted
              </label>
              <button onClick={() => setAddingSection(true)} style={smallGoldBtn}>+ Add section</button>
            </div>
          </div>
          {sections.length === 0 ? (
            <div style={{ color: 'rgba(245,242,232,0.3)', fontSize: 13 }}>Loading sections…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {sections
                .filter((s) => showDeleted || !s.deleted)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((s, sectionIndex, visibleSections) => {
                const theme = (s.theme as Record<string, string>) ?? {};
                const bgColor = SLUG_COLORS[s.slug] ?? '#1a2a1a';
                return (
                  <div
                    key={s.slug}
                    style={{
                      background: `${bgColor}cc`,
                      border: `1px solid ${s.deleted ? 'rgba(220,38,38,0.35)' : s.hidden ? 'rgba(107,114,128,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 14, padding: '14px 10px', cursor: 'default',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'transform 0.15s, border-color 0.15s', color: '#f5f2e8', position: 'relative',
                    }}
                  >
                    {(s.hidden || s.deleted) && <span style={{ position: 'absolute', top: 5, right: 7, fontSize: 10, color: s.deleted ? '#fca5a5' : 'rgba(245,242,232,0.4)' }}>{s.deleted ? 'deleted' : 'hidden'}</span>}
                    <span style={{ fontSize: 28 }}>{SLUG_ICONS[s.slug] ?? '📋'}</span>
                    <button onClick={() => !s.deleted && onNavigate(`section:${s.slug}`)} disabled={s.deleted} style={{ background: 'none', border: 0, color: '#f5f2e8', fontSize: 12, fontWeight: 700, cursor: s.deleted ? 'default' : 'pointer' }}>{s.name}</button>
                    <span style={{ fontSize: 10, color: 'rgba(245,242,232,0.4)' }}>
                      {s.subcategories.filter((sc) => !sc.deleted).length} subcats
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {!s.deleted && <button onClick={() => setEditingSection(s)} style={miniBtn}>Edit</button>}
                      {!s.deleted && <button onClick={() => apiUpdateSection(s.slug, { hidden: !s.hidden, ...(s.updatedAt ? { expectedUpdatedAt: s.updatedAt } : {}) }).then(reload)} style={miniBtn}>{s.hidden ? 'Show' : 'Hide'}</button>}
                      {s.deleted
                        ? <button onClick={() => apiRestoreSection(s.slug).then(reload)} style={miniBtn}>Restore</button>
                        : <button onClick={() => apiDeleteSection(s.slug).then(reload)} style={dangerMiniBtn}>Delete</button>}
                      <button disabled={sectionIndex === 0} onClick={() => moveSection(sectionIndex, -1)} style={miniBtn}>↑</button>
                      <button disabled={sectionIndex === visibleSections.length - 1} onClick={() => moveSection(sectionIndex, 1)} style={miniBtn}>↓</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Site management */}
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', color: GOLD, textTransform: 'uppercase' }}>Site Management</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { page: 'promotions', label: 'Menu Promotions', icon: '🖼️', desc: 'Add/remove rotating menu ads' },
              { page: 'settings', label: 'Site Settings', icon: '⚙️', desc: 'Contact, hours, social' },
              { page: 'exchange',  label: 'Pricing',       icon: '💱', desc: 'LBP/USD exchange rate' },
              { page: 'nutrition', label: 'Nutrition',    icon: '◒',  desc: 'Calories & extras' },
              { page: 'releases', label: 'History',        icon: '📋', desc: 'Publish & rollback' },
              { page: 'security', label: 'Security',       icon: '🔐', desc: 'Change password' },
            ].map((item) => (
              <button key={item.page} onClick={() => onNavigate(item.page)} style={cardBtn}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, color: '#f5f2e8' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,242,232,0.4)' }}>{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </main>
      {editingSection && (
        <SectionModal
          section={editingSection}
          onSave={async (data) => { await apiUpdateSection(editingSection.slug, data); setEditingSection(null); await reload(); }}
          onClose={() => setEditingSection(null)}
        />
      )}
      {addingSection && (
        <SectionModal
          onSave={async (data) => { await apiCreateSection(data); setAddingSection(false); await reload(); }}
          onClose={() => setAddingSection(false)}
        />
      )}
    </div>
  );
}

const ghostBtn: React.CSSProperties = { padding: '7px 14px', background: 'transparent', border: '1px solid rgba(245,242,232,0.2)', borderRadius: 8, color: 'rgba(245,242,232,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const cardBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s, border-color 0.15s', color: '#f5f2e8' };
const smallGoldBtn: React.CSSProperties = { padding: '7px 10px', background: GOLD, border: 0, borderRadius: 7, color: '#1a1a0a', fontSize: 12, fontWeight: 800, cursor: 'pointer' };
const miniBtn: React.CSSProperties = { padding: '4px 6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 5, color: '#f5f2e8', fontSize: 10, cursor: 'pointer' };
const dangerMiniBtn: React.CSSProperties = { ...miniBtn, color: '#fca5a5', borderColor: 'rgba(220,38,38,0.35)' };
