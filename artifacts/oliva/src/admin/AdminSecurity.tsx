import { useState } from 'react';
import { apiChangePassword } from './useAdminApi';

const GOLD = '#D4A843';

interface Props {
  onBack: () => void;
}

export default function AdminSecurity({ onBack }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setMsg('');
    if (next.length < 8) { setMsg('New password must be at least 8 characters.'); return; }
    if (next !== confirm) { setMsg('Passwords do not match.'); return; }
    setSaving(true);
    const result = await apiChangePassword(current, next);
    setSaving(false);
    if (result.ok) {
      setMsg('✅ Password changed successfully.');
      setCurrent(''); setNext(''); setConfirm('');
    } else {
      setMsg(`❌ ${result.error ?? 'Failed to change password.'}`);
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '0 clamp(16px,4vw,32px)', height: 56, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}>← Back</button>
        <span style={{ color: 'rgba(245,242,232,0.3)' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f5f2e8' }}>Security</h1>
      </header>
      <main style={{ flex: 1, padding: 'clamp(16px,3vw,32px) clamp(16px,4vw,40px)', maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#f5f2e8' }}>Change Password</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(245,242,232,0.4)' }}>The admin password is managed securely by the server.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Current password">
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} style={inputStyle} autoComplete="current-password" />
          </Field>
          <Field label="New password (min 8 characters)">
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} style={inputStyle} autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} autoComplete="new-password" />
          </Field>

          {msg && (
            <div style={{ padding: '10px 14px', background: msg.startsWith('✅') ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 8, fontSize: 13, color: msg.startsWith('✅') ? '#86efac' : '#fca5a5' }}>
              {msg}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} style={{ marginTop: 6, padding: '13px', background: saving ? 'rgba(212,168,67,0.4)' : GOLD, border: 'none', borderRadius: 10, color: '#1a1a0a', fontSize: 14, fontWeight: 800, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </main>
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

const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#f5f2e8', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
