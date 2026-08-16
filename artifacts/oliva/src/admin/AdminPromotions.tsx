import { useEffect, useState } from 'react';
import { apiGetSettings, apiUpdateSettings } from './useAdminApi';
import { PromoGalleryEditor } from './AdminSettings';
import type { PromoGallerySlide } from '../components/PromoGallery';

interface Props {
  onBack: () => void;
}

export default function AdminPromotions({ onBack }: Props) {
  const [gallery, setGallery] = useState<PromoGallerySlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiGetSettings().then((settings) => {
      try {
        const parsed = JSON.parse(settings.menu_promo_gallery ?? '[]');
        setGallery(Array.isArray(parsed) ? parsed : []);
      } catch {
        setGallery([]);
      }
    }).catch(() => setMessage('❌ Could not load promotions'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await apiUpdateSettings({ menu_promo_gallery: JSON.stringify(gallery) });
      setMessage('✅ Saved and published. The live site will update automatically.');
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Save failed'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: '#0d1509', color: '#f5f2e8' }}>
      <header style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '0 clamp(16px,4vw,32px)', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4A843', fontSize: 13, fontWeight: 700 }}>← Back</button>
        <span style={{ color: 'rgba(245,242,232,0.3)' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Menu Promotions</h1>
      </header>
      <main style={{ maxWidth: 800, width: '100%', margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,40px)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#D4A843', fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Menu gallery</div>
          <h2 style={{ margin: '8px 0 6px', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 900 }}>Add images above Our Menu</h2>
          <p style={{ margin: 0, color: 'rgba(245,242,232,0.55)', fontSize: 14, lineHeight: 1.6 }}>
            Upload your advertisements here. They rotate automatically every 3.5 seconds and work on phones, tablets, and desktop.
          </p>
        </div>
        {loading ? <div style={{ color: 'rgba(245,242,232,0.4)' }}>Loading promotions…</div> : (
          <>
            <PromoGalleryEditor gallery={gallery} setGallery={setGallery} />
            {message && <div style={{ margin: '16px 0', padding: 12, borderRadius: 9, background: message.startsWith('✅') ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', color: message.startsWith('✅') ? '#86efac' : '#fca5a5', fontSize: 13 }}>{message}</div>}
            <button onClick={save} disabled={saving} style={{ marginTop: 16, padding: '14px 24px', border: 0, borderRadius: 10, background: saving ? 'rgba(212,168,67,0.4)' : '#D4A843', color: '#1a1a0a', fontSize: 14, fontWeight: 800, cursor: saving ? 'default' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Promotion Gallery'}
            </button>
          </>
        )}
      </main>
    </div>
  );
}