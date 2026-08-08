import { useState } from 'react';

const GOLD = '#D4A843';

interface Props {
  section?: { slug: string; name: string; subtitle: string; theme: Record<string, string>; updatedAt?: string } | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export default function SectionModal({ section, onSave, onClose }: Props) {
  const [slug, setSlug] = useState(section?.slug ?? '');
  const [name, setName] = useState(section?.name ?? '');
  const [subtitle, setSubtitle] = useState(section?.subtitle ?? '');
  const [primary, setPrimary] = useState(section?.theme?.primary ?? '#1a2a1a');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim() || (!section && !slug.trim())) {
      setError('Name and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...(section ? {} : { slug: slug.trim().toLowerCase() }),
        name: name.trim(),
        subtitle: subtitle.trim(),
        theme: { ...(section?.theme ?? {}), primary },
        ...(section?.updatedAt ? { expectedUpdatedAt: section.updatedAt } : {}),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, background: '#0d1509', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#f5f2e8' }}>{section ? 'Edit Section' : 'Add Section'}</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!section && <Field label="Slug"><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="new-section" style={inputStyle} /></Field>}
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Field>
          <Field label="Subtitle"><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} /></Field>
          <Field label="Theme color"><div style={{ display: 'flex', gap: 8 }}><input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} style={{ width: 40, background: 'none', border: 0 }} /><input value={primary} onChange={(e) => setPrimary(e.target.value)} style={inputStyle} /></div></Field>
        </div>
        {error && <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={save} disabled={saving} style={saveBtn}>{saving ? 'Saving…' : 'Save Section'}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'rgba(245,242,232,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}{children}</label>;
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#f5f2e8', boxSizing: 'border-box' };
const closeBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(245,242,232,0.5)', cursor: 'pointer', width: 30, height: 30 };
const cancelBtn: React.CSSProperties = { flex: 1, padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: 'rgba(245,242,232,0.6)', cursor: 'pointer' };
const saveBtn: React.CSSProperties = { flex: 2, padding: 12, background: GOLD, border: 0, borderRadius: 9, color: '#1a1a0a', fontWeight: 800, cursor: 'pointer' };