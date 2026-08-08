import { useState, useEffect } from 'react';
import { apiGetExchangeRate, apiUpdateExchangeRate, apiGetSections } from './useAdminApi';
import type { ApiSection } from '../hooks/usePublishedContent';

const GOLD = '#D4A843';

interface Props {
  onBack: () => void;
}

function computeUsd(lbp: number, rate: number): string {
  if (!lbp || !rate) return '';
  const raw = lbp / rate;
  const rounded = Math.round(raw * 2) / 2;
  if (rounded === Math.floor(rounded)) return `$${rounded}`;
  return `$${rounded.toFixed(2)}`;
}

export default function AdminExchange({ onBack }: Props) {
  const [ratePerUsd, setRatePerUsd] = useState('89500');
  const [roundingTo, setRoundingTo] = useState('50000');
  const [preview, setPreview] = useState<{ name: string; lbp: number; oldUsd: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([apiGetExchangeRate(), apiGetSections()]).then(([rate, sections]: [{ ratePerUsd: number; roundingTo: number }, ApiSection[]]) => {
      setRatePerUsd(String(rate.ratePerUsd));
      setRoundingTo(String(rate.roundingTo));
      // Build preview list
      const items: { name: string; lbp: number; oldUsd: string }[] = [];
      for (const section of sections) {
        for (const sub of section.subcategories) {
          for (const p of sub.products) {
            if (!p.deleted) items.push({ name: p.name, lbp: p.priceLbp, oldUsd: p.priceUsd });
          }
        }
      }
      setPreview(items.slice(0, 20));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await apiUpdateExchangeRate(parseInt(ratePerUsd, 10), parseInt(roundingTo, 10));
      setMsg('✅ Rate updated. All USD prices recalculated.');
    } catch {
      setMsg('❌ Failed to update rate.');
    } finally {
      setSaving(false);
    }
  };

  const newRate = parseInt(ratePerUsd, 10) || 89500;

  return (
    <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '0 clamp(16px,4vw,32px)', height: 56, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}>← Back</button>
        <span style={{ color: 'rgba(245,242,232,0.3)' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f5f2e8' }}>Pricing & Exchange Rate</h1>
      </header>
      <main style={{ flex: 1, padding: 'clamp(16px,3vw,32px) clamp(16px,4vw,40px)', maxWidth: 700, width: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: 28, padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: GOLD }}>LBP / USD Exchange Rate</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>LBP per 1 USD</label>
              <input type="number" value={ratePerUsd} onChange={(e) => setRatePerUsd(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Round USD to nearest (LBP)</label>
              <input type="number" value={roundingTo} onChange={(e) => setRoundingTo(e.target.value)} style={inputStyle} placeholder="50000" />
            </div>
          </div>
          {msg && <div style={{ marginBottom: 12, padding: '9px 12px', background: msg.startsWith('✅') ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', border: `1px solid ${msg.startsWith('✅') ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 8, fontSize: 13, color: msg.startsWith('✅') ? '#86efac' : '#fca5a5' }}>{msg}</div>}
          <button onClick={handleSave} disabled={saving} style={{ padding: '11px 22px', background: saving ? 'rgba(212,168,67,0.4)' : GOLD, border: 'none', borderRadius: 9, color: '#1a1a0a', fontSize: 14, fontWeight: 800, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'Updating…' : 'Update Rate & Recalculate All Prices'}
          </button>
        </div>

        {/* Price preview */}
        {preview.length > 0 && (
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(245,242,232,0.4)', textTransform: 'uppercase' }}>
              Price Preview (with new rate)
            </h3>
            <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>LBP</th>
                    <th style={thStyle}>Current USD</th>
                    <th style={thStyle}>New USD</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((item, i) => {
                    const newUsd = computeUsd(item.lbp, newRate);
                    const changed = newUsd !== item.oldUsd;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={tdStyle}>{item.lbp.toLocaleString()}</td>
                        <td style={tdStyle}>{item.oldUsd}</td>
                        <td style={{ ...tdStyle, color: changed ? '#fbbf24' : '#86efac', fontWeight: changed ? 700 : 400 }}>{newUsd}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,242,232,0.4)', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#f5f2e8', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(245,242,232,0.4)', textTransform: 'uppercase' };
const tdStyle: React.CSSProperties = { padding: '10px 14px', color: 'rgba(245,242,232,0.75)' };
