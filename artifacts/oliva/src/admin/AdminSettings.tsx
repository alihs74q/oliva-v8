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
      setMsg('Settings saved.');
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Save failed. Please try again.');
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

      {msg && <div style={{ margin: '16px 0', padding: '10px 14px', background: msg === 'Settings saved.' ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', border: `1px solid ${msg === 'Settings saved.' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 8, fontSize: 13, color: msg === 'Settings saved.' ? '#86efac' : '#fca5a5' }}>{msg}</div>}

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
      textVisible: true,
      titleVisible: true,
      descriptionVisible: true,
      titleColor: '#24351e',
      descriptionColor: '#52604a',
      titleFontFamily: 'Alex Brush, cursive',
      descriptionFontFamily: 'DM Sans, sans-serif',
      introVisible: true,
      introKicker: 'The Oliva edit',
      introKickerVisible: true,
      introTitle: 'A little extra\nbefore the menu.',
      introTitleVisible: true,
      introMeta: 'Fresh from the grove',
      introMetaVisible: true,
      slideCounterVisible: true,
      copyStamp: 'OLIVA / EDIT',
      copyStampVisible: true,
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
          <div style={{ marginTop: 4, padding: 12, border: '1px solid rgba(212,168,67,0.2)', borderRadius: 9, background: 'rgba(212,168,67,0.05)' }}>
            <div style={{ marginBottom: 10, color: '#D4A843', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Gallery text</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <Toggle label="Show gallery intro" checked={slide.introVisible !== false} onChange={(introVisible) => update(slide.id, { introVisible })} />
              <Toggle label="Show intro label" checked={slide.introKickerVisible !== false} onChange={(introKickerVisible) => update(slide.id, { introKickerVisible })} />
              <Toggle label="Show intro headline" checked={slide.introTitleVisible !== false} onChange={(introTitleVisible) => update(slide.id, { introTitleVisible })} />
              <Toggle label="Show meta text" checked={slide.introMetaVisible !== false} onChange={(introMetaVisible) => update(slide.id, { introMetaVisible })} />
              <Toggle label="Show slide counter" checked={slide.slideCounterVisible !== false} onChange={(slideCounterVisible) => update(slide.id, { slideCounterVisible })} />
              <Toggle label="Show edit stamp" checked={slide.copyStampVisible !== false} onChange={(copyStampVisible) => update(slide.id, { copyStampVisible })} />
            </div>
            <Field label="Intro label">
              <input value={slide.introKicker ?? 'The Oliva edit'} onChange={(e) => update(slide.id, { introKicker: e.target.value })} style={inputStyle} placeholder="The Oliva edit" />
            </Field>
            <Field label="Intro headline">
              <textarea value={slide.introTitle ?? 'A little extra\nbefore the menu.'} onChange={(e) => update(slide.id, { introTitle: e.target.value })} style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} placeholder={'A little extra\nbefore the menu.'} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Intro meta">
                <input value={slide.introMeta ?? 'Fresh from the grove'} onChange={(e) => update(slide.id, { introMeta: e.target.value })} style={inputStyle} placeholder="Fresh from the grove" />
              </Field>
              <Field label="Edit stamp">
                <input value={slide.copyStamp ?? 'OLIVA / EDIT'} onChange={(e) => update(slide.id, { copyStamp: e.target.value })} style={inputStyle} placeholder="OLIVA / EDIT" />
              </Field>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Toggle label="Show text" checked={slide.textVisible !== false} onChange={(textVisible) => update(slide.id, { textVisible })} />
            <Toggle label="Show title" checked={slide.titleVisible !== false} onChange={(titleVisible) => update(slide.id, { titleVisible })} />
            <Toggle label="Show description" checked={slide.descriptionVisible !== false} onChange={(descriptionVisible) => update(slide.id, { descriptionVisible })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Title color">
              <ColorInput value={slide.titleColor || '#24351e'} onChange={(titleColor) => update(slide.id, { titleColor })} />
            </Field>
            <Field label="Description color">
              <ColorInput value={slide.descriptionColor || '#52604a'} onChange={(descriptionColor) => update(slide.id, { descriptionColor })} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FontPicker label="Title font" value={!slide.titleFontFamily || slide.titleFontFamily === 'Bricolage Grotesque, sans-serif' || slide.titleFontFamily === 'DM Sans, sans-serif' ? 'Alex Brush, cursive' : slide.titleFontFamily} onChange={(titleFontFamily) => update(slide.id, { titleFontFamily })} />
            <FontPicker label="Description font" value={slide.descriptionFontFamily || 'DM Sans, sans-serif'} onChange={(descriptionFontFamily) => update(slide.id, { descriptionFontFamily })} />
          </div>
          <p style={{ margin: '-2px 0 0', color: 'rgba(245,242,232,0.4)', fontSize: 11, lineHeight: 1.5 }}>
            Type any Google Font name, including Italian-style, handwritten, serif, or Canva-inspired fonts. It loads automatically on the public site.
          </p>
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 9px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: checked ? '#f5f2e8' : 'rgba(245,242,232,0.45)', fontSize: 11, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#24351e'} onChange={(e) => onChange(e.target.value)} style={{ width: 38, height: 34, padding: 2, border: 0, background: 'transparent' }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} placeholder="#24351e" />
    </div>
  );
}

const FONT_PRESETS = [
  'Alex Brush, cursive', 'Italianno, cursive', 'Allura, cursive', 'Great Vibes, cursive', 'Dancing Script, cursive', 'DM Sans, sans-serif', 'Manrope, sans-serif', 'Poppins, sans-serif', 'Montserrat, sans-serif',
  'Playfair Display, serif', 'Cormorant Garamond, serif', 'Libre Baskerville, serif', 'Lora, serif', 'Merriweather, serif',
  'Bodoni Moda, serif', 'Abril Fatface, serif', 'Bebas Neue, sans-serif', 'Oswald, sans-serif', 'Roboto, sans-serif',
  'Open Sans, sans-serif', 'Raleway, sans-serif', 'Nunito, sans-serif', 'Quicksand, sans-serif', 'Comfortaa, sans-serif',
  'Dancing Script, cursive', 'Pacifico, cursive', 'Great Vibes, cursive', 'Satisfy, cursive', 'Lobster, cursive',
  'Caveat, cursive', 'Amatic SC, cursive', 'Sacramento, cursive', 'Italianno, cursive', 'Marck Script, cursive',
];

function FontPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const listId = `font-options-${label.replace(/\W/g, '-')}`;
  return (
    <Field label={label}>
      <input list={listId} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} placeholder="Type any font name…" />
      <datalist id={listId}>{FONT_PRESETS.map((font) => <option key={font} value={font} />)}</datalist>
    </Field>
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
