import { useState } from 'react';
import type { ApiSubcategory } from '../hooks/usePublishedContent';
import ImagePickerInput from './ImagePickerInput';

const GOLD = '#D4A843';

interface Props {
  sub?: ApiSubcategory | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export default function SubcategoryModal({ sub, onSave, onClose }: Props) {
  const [name, setName] = useState(sub?.name ?? '');
  const [description, setDescription] = useState(sub?.description ?? '');
  const [themeColor, setThemeColor] = useState(sub?.themeColor ?? '#333333');
  const [accentColor, setAccentColor] = useState(sub?.accentColor ?? '#999999');
  const [imageUrl, setImageUrl] = useState(sub?.imageUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), description: description.trim(), themeColor, accentColor, imageUrl: imageUrl || null });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
        <div style={{ background: '#0d1509', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#f5f2e8' }}>{sub ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
            <button onClick={onClose} style={closeBtn}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Name *">
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="e.g. Smoothies" />
            </Field>
            <Field label="Description">
              <input value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} placeholder="Short tagline" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Theme color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 0 }} />
                  <input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </Field>
              <Field label="Accent color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 0 }} />
                  <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </Field>
            </div>
            <ImagePickerInput value={imageUrl} onChange={setImageUrl} label="Image" />
          </div>

          {error && <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 7, fontSize: 13, color: '#fca5a5' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={onClose} style={cancelBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...saveBtn, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
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

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#f5f2e8', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const closeBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(245,242,232,0.5)', fontSize: 14, cursor: 'pointer', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 };
const cancelBtn: React.CSSProperties = { flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'rgba(245,242,232,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const saveBtn: React.CSSProperties = { flex: 2, padding: '12px', background: GOLD, border: 'none', borderRadius: 9, color: '#1a1a0a', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
