import { useEffect, useMemo, useState } from 'react';
import { apiGetSections, apiUpdateProduct } from './useAdminApi';
import type { ApiProduct, ApiSection } from '../hooks/usePublishedContent';
import { DEFAULT_EXTRA_CALORIES, getStaticCalories } from '../data/nutrition';

const GOLD = '#D4A843';

interface Props { onBack: () => void }

export default function NutritionPage({ onBack }: Props) {
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const reload = async () => setSections(await apiGetSections() as ApiSection[]);
  useEffect(() => { reload().catch(() => setMessage('Could not load nutrition data.')); }, []);

  const products = useMemo(() => sections.flatMap((section) => section.subcategories.flatMap((sub) =>
    sub.products
      .filter((product) => !product.deleted && (product.name.toLowerCase().includes(query.toLowerCase()) || sub.name.toLowerCase().includes(query.toLowerCase())))
      .map((product) => ({ section, sub, product })),
  )), [sections, query]);

  const save = async (
    product: ApiProduct,
    calories: string,
    proteinGrams: string,
    carbsGrams: string,
    fatGrams: string,
    extraText: string,
  ) => {
    const extraCalories = Object.fromEntries(
      extraText.split('\n').map((line) => line.split(':')).map(([name, value]) => [name?.trim(), Number(value?.trim())])
        .filter(([name, value]) => Boolean(name) && Number.isFinite(value) && Number(value) >= 0),
    );
    setSavingId(product.id);
    setMessage('');
    try {
      await apiUpdateProduct(product.id, {
        calories: Math.max(0, parseInt(calories, 10) || 0),
        proteinGrams: parseMacro(proteinGrams),
        carbsGrams: parseMacro(carbsGrams),
        fatGrams: parseMacro(fatGrams),
        extraCalories,
      });
      setMessage(`${product.name} saved as a draft.`);
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminShell onBack={onBack} title="Nutrition & Calories">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <p style={{ margin: '0 0 6px', color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Menu intelligence</p>
          <h2 style={{ margin: 0, color: '#f5f2e8', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Nutrition, made editable.</h2>
          <p style={{ margin: '8px 0 0', maxWidth: 540, color: 'rgba(245,242,232,0.48)', fontSize: 13, lineHeight: 1.6 }}>
            Set calories, protein, carbs, fat, and optional extra calories for every menu item. Changes stay in draft until you publish.
          </p>
        </div>
        <div style={{ minWidth: 220 }}>
          <label style={labelStyle}>Find a product</label>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search menu…" style={inputStyle} />
        </div>
      </div>

      {message && <div style={{ marginBottom: 18, color: message.includes('saved') ? '#86efac' : '#fca5a5', fontSize: 13 }}>{message}</div>}

      <div style={{ display: 'grid', gap: 18 }}>
        {products.map(({ section, sub, product }) => (
          <NutritionCard key={product.id} sectionName={section.name} subcategoryName={sub.name} product={product} saving={savingId === product.id} onSave={save} />
        ))}
      </div>
      {products.length === 0 && <div style={emptyStyle}>No menu items match that search.</div>}
    </AdminShell>
  );
}

function NutritionCard({ sectionName, subcategoryName, product, saving, onSave }: {
  sectionName: string; subcategoryName: string; product: ApiProduct; saving: boolean;
  onSave: (product: ApiProduct, calories: string, proteinGrams: string, carbsGrams: string, fatGrams: string, extraText: string) => Promise<void>;
}) {
  const [calories, setCalories] = useState(String(product.calories ?? getStaticCalories(product.name)));
  const [proteinGrams, setProteinGrams] = useState(String(product.proteinGrams ?? ''));
  const [carbsGrams, setCarbsGrams] = useState(String(product.carbsGrams ?? ''));
  const [fatGrams, setFatGrams] = useState(String(product.fatGrams ?? ''));
  const initialExtras = Object.entries(product.extraCalories ?? {}).map(([name, value]) => `${name}: ${value}`).join('\n');
  const [extraText, setExtraText] = useState(initialExtras);
  useEffect(() => {
    setCalories(String(product.calories ?? getStaticCalories(product.name)));
    setProteinGrams(String(product.proteinGrams ?? ''));
    setCarbsGrams(String(product.carbsGrams ?? ''));
    setFatGrams(String(product.fatGrams ?? ''));
    setExtraText(Object.entries(product.extraCalories ?? {}).map(([name, value]) => `${name}: ${value}`).join('\n'));
  }, [product]);

  return (
    <section style={{ padding: 18, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, background: 'rgba(255,255,255,0.035)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {product.imageUrl ? <img src={product.imageUrl} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} /> : <div style={{ width: 48, height: 48, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(212,168,67,0.12)', color: GOLD }}>◒</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'rgba(245,242,232,0.42)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{sectionName} / {subcategoryName}</div>
          <h3 style={{ margin: '4px 0 0', color: '#f5f2e8', fontSize: 16, fontWeight: 800 }}>{product.name}</h3>
        </div>
        <div style={{ color: GOLD, fontSize: 12, fontWeight: 800 }}>CAL</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, alignItems: 'end' }}>
        <div><label style={labelStyle}>Base calories</label><input type="number" min="0" value={calories} onChange={(event) => setCalories(event.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Protein (g)</label><input type="number" min="0" step="0.1" value={proteinGrams} onChange={(event) => setProteinGrams(event.target.value)} style={inputStyle} placeholder="0" /></div>
        <div><label style={labelStyle}>Carbs (g)</label><input type="number" min="0" step="0.1" value={carbsGrams} onChange={(event) => setCarbsGrams(event.target.value)} style={inputStyle} placeholder="0" /></div>
        <div><label style={labelStyle}>Fat (g)</label><input type="number" min="0" step="0.1" value={fatGrams} onChange={(event) => setFatGrams(event.target.value)} style={inputStyle} placeholder="0" /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto', gap: 12, alignItems: 'end', marginTop: 12 }}>
        <div><label style={labelStyle}>Extra calories · one per line</label><textarea value={extraText} onChange={(event) => setExtraText(event.target.value)} placeholder={`Cream: ${DEFAULT_EXTRA_CALORIES.Cream}\nIce Cream: ${DEFAULT_EXTRA_CALORIES['Ice Cream']}`} style={{ ...inputStyle, minHeight: 42, resize: 'vertical', fontFamily: '"JetBrains Mono", monospace' }} /></div>
        <button disabled={saving} onClick={() => onSave(product, calories, proteinGrams, carbsGrams, fatGrams, extraText)} style={{ ...saveButton, opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save draft'}</button>
      </div>
    </section>
  );
}

function parseMacro(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 10) / 10;
}

function AdminShell({ children, onBack, title }: { children: React.ReactNode; onBack: () => void; title: string }) {
  return <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', flexDirection: 'column' }}>
    <header style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '0 clamp(16px,4vw,32px)', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, fontSize: 13, fontWeight: 700 }}>← Back</button>
      <span style={{ color: 'rgba(245,242,232,0.3)' }}>|</span><h1 style={{ margin: 0, color: '#f5f2e8', fontSize: 16 }}>{title}</h1>
    </header>
    <main style={{ flex: 1, padding: 'clamp(20px,4vw,42px)', maxWidth: 1100, width: '100%', margin: '0 auto' }}>{children}</main>
  </div>;
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, color: 'rgba(245,242,232,0.5)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.06)', color: '#f5f2e8', outline: 'none', fontSize: 13 };
const saveButton: React.CSSProperties = { padding: '10px 14px', border: 0, borderRadius: 8, background: GOLD, color: '#1a1a0a', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' };
const emptyStyle: React.CSSProperties = { padding: 30, color: 'rgba(245,242,232,0.4)', border: '1px dashed rgba(255,255,255,0.14)', borderRadius: 14 };