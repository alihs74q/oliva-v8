import { useState, useEffect } from 'react';
import { apiListReleases, apiPublish, apiRollback } from './useAdminApi';
import { notifyPublishedContentChanged } from '../utils/contentRefresh';

const GOLD = '#D4A843';

interface Release {
  id: number;
  version: number;
  label: string;
  publishedBy: string;
  isCurrent: boolean;
  publishedAt: string;
}

interface Props {
  onBack: () => void;
}

export default function AdminReleases({ onBack }: Props) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState('');
  const [label, setLabel] = useState('');

  const reload = async () => {
    const data = await apiListReleases();
    setReleases(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handlePublish = async () => {
    setWorking(true);
    setMsg('');
    try {
      await apiPublish(label);
      notifyPublishedContentChanged();
      setMsg('✅ Published successfully!');
      setLabel('');
      await reload();
    } catch {
      setMsg('❌ Publish failed.');
    } finally {
      setWorking(false);
    }
  };

  const handleRollback = async (id: number) => {
    if (!confirm('Roll back to this version? The live site will revert to this release.')) return;
    setWorking(true);
    setMsg('');
    try {
      await apiRollback(id);
      notifyPublishedContentChanged();
      setMsg('✅ Rolled back successfully!');
      await reload();
    } catch {
      setMsg('❌ Rollback failed.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '0 clamp(16px,4vw,32px)', height: 56, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}>← Back</button>
        <span style={{ color: 'rgba(245,242,232,0.3)' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f5f2e8' }}>Publish History</h1>
      </header>
      <main style={{ flex: 1, padding: 'clamp(16px,3vw,32px) clamp(16px,4vw,40px)', maxWidth: 700, width: '100%', margin: '0 auto' }}>
        {/* Publish new */}
        <div style={{ marginBottom: 32, padding: 20, background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: GOLD }}>Publish Current Draft</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Optional label (e.g. 'Added summer menu')"
              style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#f5f2e8', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
            <button onClick={handlePublish} disabled={working} style={{ padding: '10px 20px', background: working ? 'rgba(212,168,67,0.4)' : GOLD, border: 'none', borderRadius: 8, color: '#1a1a0a', fontSize: 13, fontWeight: 800, cursor: working ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
              🚀 Publish
            </button>
          </div>
          {msg && <div style={{ marginTop: 10, fontSize: 13, color: msg.startsWith('✅') ? '#86efac' : '#fca5a5' }}>{msg}</div>}
        </div>

        {/* Release list */}
        <h3 style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(245,242,232,0.4)', textTransform: 'uppercase' }}>Release History</h3>
        {loading ? (
          <div style={{ color: 'rgba(245,242,232,0.4)', padding: 24 }}>Loading…</div>
        ) : releases.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'rgba(245,242,232,0.3)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>No releases yet. Publish your first version above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {releases.map((r) => (
              <div key={r.id} style={{
                padding: '14px 16px',
                background: r.isCurrent ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${r.isCurrent ? 'rgba(22,163,74,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f5f2e8' }}>v{r.version}</span>
                    {r.label && <span style={{ fontSize: 13, color: 'rgba(245,242,232,0.6)' }}>{r.label}</span>}
                    {r.isCurrent && <span style={{ padding: '2px 7px', background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#86efac', letterSpacing: '0.06em' }}>LIVE</span>}
                  </div>
                  <div style={{ marginTop: 3, fontSize: 12, color: 'rgba(245,242,232,0.35)' }}>
                    {new Date(r.publishedAt).toLocaleString()} · by {r.publishedBy}
                  </div>
                </div>
                {!r.isCurrent && (
                  <button onClick={() => handleRollback(r.id)} disabled={working} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, color: 'rgba(245,242,232,0.6)', fontSize: 12, fontWeight: 600, cursor: working ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
                    ↩ Rollback
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
