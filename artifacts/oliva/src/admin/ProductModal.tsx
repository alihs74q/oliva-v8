import { useState, useEffect } from 'react';
import type { ApiProduct } from '../hooks/usePublishedContent';
import ImagePickerInput from './ImagePickerInput';
import { DEFAULT_EXTRA_CALORIES, getStaticCalories } from '../data/nutrition';
import { MENU_EXTRAS, getMenuExtra, type MenuExtraName } from '../data/menuExtras';

const GOLD = '#D4A843';
const RATE = 89500; // Approximate, actual is fetched from settings

function lbpToUsd(lbp: number): string {
  if (!lbp || lbp === 0) return '';
  const raw = lbp / RATE;
  const rounded = Math.round(raw * 2) / 2;
  if (rounded === Math.floor(rounded)) return `$${rounded}`;
  return `$${rounded.toFixed(2)}`;
}

interface Props {
  product?: ApiProduct | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export default function ProductModal({ product, onSave, onClose }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [shortName, setShortName] = useState(product?.shortName ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [priceLbp, setPriceLbp] = useState(String(product?.priceLbp ?? ''));
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [galleryUrlsText, setGalleryUrlsText] = useState((product?.galleryUrls ?? []).join(', '));
  const [imageAlt, setImageAlt] = useState(product?.imageAlt ?? '');
  const [imageFocalPoint, setImageFocalPoint] = useState(product?.imageFocalPoint ?? 'center');
  const [recipe, setRecipe] = useState(product?.recipe ?? '');
  const [flavorsText, setFlavorsText] = useState((product?.flavors ?? []).join(', '));
  const [selectedExtras, setSelectedExtras] = useState<MenuExtraName[]>(
    (product?.extras ?? []).filter((extra): extra is MenuExtraName => Boolean(getMenuExtra(extra))),
  );
  const [calories, setCalories] = useState(String(product?.calories ?? getStaticCalories(product?.name ?? '')));
  const [extraCaloriesText, setExtraCaloriesText] = useState(
    Object.entries(product?.extraCalories ?? {}).map(([name, value]) => `${name}: ${value}`).join('\n'),
  );
  const [tagsText, setTagsText] = useState((product?.tags ?? []).join(', '));
  const [allergensText, setAllergensText] = useState((product?.allergens ?? []).join(', '));
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [hidden, setHidden] = useState(product?.hidden ?? false);
  const [soldOut, setSoldOut] = useState(product?.soldOut ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const lbpNum = parseInt(priceLbp, 10) || 0;
  const usdDisplay = lbpToUsd(lbpNum);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!priceLbp || lbpNum <= 0) { setError('LBP price is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const extraCalories = Object.fromEntries(
        extraCaloriesText
          .split('\n')
          .map((line) => line.split(':'))
          .map(([key, value]) => [key?.trim(), Number(value?.trim())])
          .filter(([key, value]) => Boolean(key) && Number.isFinite(value) && Number(value) >= 0),
      );
      await onSave({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        shortName: shortName.trim() || name.trim().split(' ')[0].toUpperCase(),
        description: description.trim(),
        priceLbp: lbpNum,
        imageUrl: imageUrl || null,
        galleryUrls: galleryUrlsText.split(',').map((v) => v.trim()).filter(Boolean),
        imageAlt: imageAlt.trim(),
        imageFocalPoint,
        recipe: recipe.trim(),
        flavors: flavorsText.split(',').map((f) => f.trim()).filter(Boolean),
         extras: selectedExtras,
        calories: Math.max(0, parseInt(calories, 10) || 0),
        extraCalories,
        tags: tagsText.split(',').map((f) => f.trim()).filter(Boolean),
        allergens: allergensText.split(',').map((f) => f.trim()).filter(Boolean),
        featured, hidden, soldOut,
        ...(product?.updatedAt ? { expectedUpdatedAt: product.updatedAt } : {}),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f5f2e8' }}>
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', maxHeight: 'calc(80vh - 130px)' }}>
          <Field label="Name *">
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Product name" />
          </Field>
          <Field label="Slug">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} placeholder="product-slug" />
          </Field>
          <Field label="Short name (for hero text)">
            <input value={shortName} onChange={(e) => setShortName(e.target.value)} style={inputStyle} placeholder="e.g. LATTE" />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="One-line tagline" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="LBP Price *">
              <input type="number" value={priceLbp} onChange={(e) => setPriceLbp(e.target.value)} style={inputStyle} placeholder="e.g. 300000" />
            </Field>
            <Field label="USD Price (auto)">
              <div style={{ ...inputStyle, background: 'rgba(255,255,255,0.03)', color: GOLD, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                {usdDisplay || '—'}
              </div>
            </Field>
          </div>

          <ImagePickerInput value={imageUrl} onChange={setImageUrl} label="Image" />
          <Field label="Gallery image URLs (comma-separated)">
            <input value={galleryUrlsText} onChange={(e) => setGalleryUrlsText(e.target.value)} style={inputStyle} placeholder="https://..." />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Image alt text"><input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} style={inputStyle} /></Field>
            <Field label="Focal point"><input value={imageFocalPoint} onChange={(e) => setImageFocalPoint(e.target.value)} style={inputStyle} placeholder="center" /></Field>
          </div>

          <Field label="Recipe / Ingredients (separate with ·)">
            <textarea value={recipe} onChange={(e) => setRecipe(e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} placeholder="Milk · Ice · Vanilla · ..." />
          </Field>

          <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 9, background: 'rgba(212,168,67,0.16)', color: GOLD }}>◒</span>
              <div>
                <div style={{ color: '#f5f2e8', fontWeight: 800, fontSize: 13 }}>Nutrition</div>
                <div style={{ color: 'rgba(245,242,232,0.42)', fontSize: 11 }}>Shown in the public ingredients panel after publishing.</div>
              </div>
            </div>
            <Field label="Base calories">
              <input type="number" min="0" value={calories} onChange={(e) => setCalories(e.target.value)} style={inputStyle} placeholder="e.g. 280" />
            </Field>
            <div style={{ height: 10 }} />
            <Field label="Extra calories (one per line: Name: calories)">
              <textarea
                value={extraCaloriesText}
                onChange={(e) => setExtraCaloriesText(e.target.value)}
                style={{ ...inputStyle, minHeight: 82, resize: 'vertical', fontFamily: '"JetBrains Mono", monospace' }}
                placeholder={`Cream: ${DEFAULT_EXTRA_CALORIES.Cream}\nIce Cream: ${DEFAULT_EXTRA_CALORIES['Ice Cream']}\nFlavor: ${DEFAULT_EXTRA_CALORIES.Flavor}`}
              />
            </Field>
          </div>

          <Field label="Flavor options (comma-separated)">
            <input value={flavorsText} onChange={(e) => setFlavorsText(e.target.value)} style={inputStyle} placeholder="Classic, Vanilla, Hazelnut" />
          </Field>
          <div style={{ padding: 14, borderRadius: 12, background: 'rgba(89,107,61,0.1)', border: '1px solid rgba(89,107,61,0.28)' }}>
            <div style={{ color: '#f5f2e8', fontWeight: 800, fontSize: 13, marginBottom: 4 }}>Available extras</div>
            <div style={{ color: 'rgba(245,242,232,0.44)', fontSize: 11, marginBottom: 12 }}>
              Choose which extras customers can add to this product. Prices and calories are fixed in the menu.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
              {MENU_EXTRAS.map((extra) => {
                const checked = selectedExtras.includes(extra.name);
                return (
                  <label key={extra.name} style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '10px 11px',
                    borderRadius: 10, cursor: 'pointer',
                    background: checked ? 'rgba(212,168,67,0.16)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${checked ? 'rgba(212,168,67,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setSelectedExtras((current) => checked
                        ? current.filter((name) => name !== extra.name)
                        : [...current, extra.name])}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', color: checked ? '#f5f2e8' : 'rgba(245,242,232,0.7)', fontSize: 12, fontWeight: 800 }}>{extra.name}</span>
                      <span style={{ display: 'block', color: 'rgba(245,242,232,0.42)', fontSize: 10 }}>+{extra.priceLbp.toLocaleString()} LBP · +{extra.calories} cal</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <Field label="Tags (comma-separated)">
            <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} style={inputStyle} placeholder="popular, seasonal" />
          </Field>
          <Field label="Allergens (comma-separated)">
            <input value={allergensText} onChange={(e) => setAllergensText(e.target.value)} style={inputStyle} placeholder="milk, nuts" />
          </Field>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: 'rgba(245,242,232,0.7)', fontSize: 13 }}>
            <label><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured</label>
            <label><input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} /> Hidden</label>
            <label><input type="checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)} /> Sold out</label>
          </div>
        </div>

        {error && <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 7, fontSize: 13, color: '#fca5a5' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...saveBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(245,242,232,0.5)', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560 }}>{children}</div>
    </div>
  );
}

const modalStyle: React.CSSProperties = {
  background: '#0d1509',
  border: '1px solid rgba(212,168,67,0.2)',
  borderRadius: 16, padding: '24px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 7, color: '#f5f2e8', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};
const closeBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6, color: 'rgba(245,242,232,0.5)', fontSize: 14, cursor: 'pointer',
  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};
const cancelBtn: React.CSSProperties = {
  flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  color: 'rgba(245,242,232,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const saveBtn: React.CSSProperties = {
  flex: 2, padding: '12px', background: GOLD,
  border: 'none', borderRadius: 9,
  color: '#1a1a0a', fontSize: 14, fontWeight: 800, cursor: 'pointer',
};
