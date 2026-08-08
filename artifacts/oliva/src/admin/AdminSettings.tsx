import { useState, useEffect } from 'react';
import { apiGetSettings, apiUpdateSettings, apiGetExchangeRate, apiUpdateExchangeRate } from './useAdminApi';
import ImagePickerInput from './ImagePickerInput';
import type { PromoGallerySlide } from '../components/PromoGallery';

const GOLD = '#D4A843';

interface Props {
  onBack: () => void;
}

export default function AdminSettings({ onBack }: Props) {
  return (
    <AdminShell onBack={onBack} title="Site Settings">
      <SiteSettingsForm />
    </AdminShell>
  );
}

function SiteSettingsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [ratePerUsd, setRatePerUsd] = useState('89500');
  const [roundingTo, setRoundingTo] = useState('50000');
  const [gallery, setGallery] = useState<PromoGallerySlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([apiGetSettings(), apiGetExchangeRate()]).then(([s, r]) => {
      setSettings(s);
      try {
        const parsed = JSON.parse(s.menu_promo_gallery ?? '[]');
        setGallery(Array.isArray(parsed) ? parsed : []);
      } catch {
        setGallery([]);
      }
      setRatePerUsd(String(r.ratePerUsd));
      setRoundingTo(String(r.roundingTo));
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await apiUpdateSettings({ ...settings, menu_promo_gallery: JSON.stringify(gallery) });
      await apiUpdateExchangeRate(parseInt(ratePerUsd, 10), parseInt(roundingTo, 10));
      setMsg('✅ Settings saved!');
    } catch {
      setMsg('❌ Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'rgba(245,242,232,0.4)', padding: 40 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <Section title="Exchange Rate">
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(245,242,232,0.5)', lineHeight: 1.6 }}>
          Changing the rate will automatically recalculate all USD prices. Current rate: 1 USD = {ratePerUsd} LBP.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="LBP per 1 USD">
            <input type="number" value={ratePerUsd} onChange={(e) => setRatePerUsd(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Round USD to nearest $">
            <input value={roundingTo} onChange={(e) => setRoundingTo(e.target.value)} style={inputStyle} placeholder="50000 LBP = $0.50" />
          </Field>
        </div>
      </Section>

      <Section title="Contact">
        {[
          { key: 'whatsapp_number',  label: 'WhatsApp Number' },
          { key: 'whatsapp_message', label: 'WhatsApp Default Message' },
        ].map(({ key, label }) => (
          <Field key={key} label={label}>
            <input value={settings[key] ?? ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} style={inputStyle} />
          </Field>
        ))}
      </Section>

      <Section title="Hero Text">
        {[
          { key: 'hero_eyebrow',        label: 'Eyebrow (above headline)' },
          { key: 'hero_headline_line1', label: 'Headline Line 1' },
          { key: 'hero_headline_line2', label: 'Headline Line 2' },
          { key: 'hero_subline',        label: 'Subline / Tagline' },
        ].map(({ key, label }) => (
          <Field key={key} label={label}>
            <input value={settings[key] ?? ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} style={inputStyle} />
          </Field>
        ))}
      </Section>

      <PromoGalleryEditor gallery={gallery} setGallery={setGallery} />

      {msg && <div style={{ margin: '16px 0', padding: '10px 14px', background: msg.startsWith('✅') ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 8, fontSize: 13, color: msg.startsWith('✅') ? '#86efac' : '#fca5a5' }}>{msg}</div>}

      <button onClick={handleSave} disabled={saving} style={{ padding: '14px 28px', background: saving ? 'rgba(212,168,67,0.4)' : GOLD, border: 'none', borderRadius: 10, color: '#1a1a0a', fontSize: 14, fontWeight: 800, cursor: saving ? 'default' : 'pointer' }}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}

export function PromoGalleryEditor({ gallery, setGallery }: { gallery: PromoGallerySlide[]; setGallery: (gallery: PromoGallerySlide[]) => void }) {
  const update = (id: string, changes: Partial<PromoGallerySlide>) => {
    setGallery(gallery.map((slide) => slide.id === id ? { ...slide, ...changes } : slide));
  };

  const add = () => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `promo-${Date.now()}`;
    setGallery([...gallery, {
      id,
      imageUrl: '',
      alt: 'Oliva promotion',
      eyebrow: 'At Oliva',
      title: '',
      description: '',
      link: '',
      visible: true,
    }]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= gallery.length) return;
    const next = [...gallery];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setGallery(next);
  };

  return (
    <Section title="Menu Promotions">
      <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,242,232,0.5)', lineHeight: 1.6 }}>
        Add wide promotional images above the public menu. Slides change automatically every 3.5 seconds on phones and desktop. Save this page, then click <strong style={{ color: '#D4A843' }}>Publish Live</strong> on the admin home.
      </p>
      {gallery.map((slide, index) => (
        <div key={slide.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14, border: `1px solid ${slide.visible ? 'rgba(212,168,67,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, background: 'rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ color: '#f5f2e8', fontSize: 13, fontWeight: 800 }}>Promotion {index + 1}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} style={smallButton}>↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === gallery.length - 1} style={smallButton}>↓</button>
              <button type="button" onClick={() => update(slide.id, { visible: !slide.visible })} style={{ ...smallButton, color: slide.visible ? '#86efac' : '#fca5a5' }}>{slide.visible ? 'Visible' : 'Hidden'}</button>
              <button type="button" onClick={() => setGallery(gallery.filter((item) => item.id !== slide.id))} style={{ ...smallButton, color: '#fca5a5' }}>Remove</button>
            </div>
          </div>
          <ImagePickerInput label="Promotion image" value={slide.imageUrl} onChange={(imageUrl) => update(slide.id, { imageUrl })} />
          <Field label="Image alt text">
            <input value={slide.alt} onChange={(e) => update(slide.id, { alt: e.target.value })} style={inputStyle} placeholder="Describe the promotion image" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Small label">
              <input value={slide.eyebrow ?? ''} onChange={(e) => update(slide.id, { eyebrow: e.target.value })} style={inputStyle} placeholder="New at Oliva" />
            </Field>
            <Field label="Headline">
              <input value={slide.title ?? ''} onChange={(e) => update(slide.id, { title: e.target.value })} style={inputStyle} placeholder="Summer drinks are here" />
            </Field>
          </div>
          <Field label="Description">
            <input value={slide.description ?? ''} onChange={(e) => update(slide.id, { description: e.target.value })} style={inputStyle} placeholder="Optional supporting text" />
          </Field>
          <Field label="Optional link">
            <input value={slide.link ?? ''} onChange={(e) => update(slide.id, { link: e.target.value })} style={inputStyle} placeholder="https://instagram.com/..." />
          </Field>
        </div>
      ))}
      <button type="button" onClick={add} style={{ padding: '11px 16px', border: '1px dashed rgba(212,168,67,0.55)', borderRadius: 9, background: 'rgba(212,168,67,0.08)', color: '#D4A843', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
        + Add promotion image
      </button>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,242,232,0.4)', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

function AdminShell({ children, onBack, title }: { children: React.ReactNode; onBack: () => void; title: string }) {
  return (
    <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '0 clamp(16px,4vw,32px)', height: 56, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}>← Back</button>
        <span style={{ color: 'rgba(245,242,232,0.3)' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f5f2e8' }}>{title}</h1>
      </header>
      <main style={{ flex: 1, padding: 'clamp(16px,3vw,32px) clamp(16px,4vw,40px)', maxWidth: 800, width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#f5f2e8', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const smallButton: React.CSSProperties = { padding: '5px 8px', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'rgba(245,242,232,0.72)', fontSize: 11, fontWeight: 700, cursor: 'pointer' };
