import { useState } from 'react';
import { imageAssets } from '../utils/imageAssets';
import { apiLogin } from './useAdminApi';

interface Props {
  onLogin: () => void;
}

const GOLD = '#D4A843';
const DARK_BG = '#0d1509';

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await apiLogin(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      onLogin();
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div style={{
      minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: DARK_BG, padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#596B3D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px rgba(212,168,67,0.2)` }}>
            <img src={imageAssets.logo} alt="Oliva" style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase' }}>Admin</p>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#f5f2e8', letterSpacing: '-0.02em' }}>Oliva CMS</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} style={formStyle}>
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#f5f2e8' }}>Sign In</p>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'rgba(245,242,232,0.4)' }}>Use your authorized email and password.</p>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={inputStyle} placeholder="your@email.com" />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={inputStyle} placeholder="••••••••" />
            </Field>
            {error && <ErrorBanner>{error}</ErrorBanner>}
            <button type="submit" disabled={loading} style={submitBtn(loading)}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
        </form>
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

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, fontSize: 13, color: '#fca5a5' }}>
      {children}
    </div>
  );
}

const formStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,67,0.2)',
  borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#f5f2e8',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};
const submitBtn = (disabled: boolean): React.CSSProperties => ({
  marginTop: 4, padding: '14px', background: disabled ? 'rgba(212,168,67,0.4)' : '#D4A843',
  color: '#1a1a0a', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800,
  letterSpacing: '0.06em', cursor: disabled ? 'default' : 'pointer', transition: 'background 0.2s',
});
