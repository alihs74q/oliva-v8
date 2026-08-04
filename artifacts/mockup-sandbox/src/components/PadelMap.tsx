interface Court { id: number; name: string }
const COURTS: Court[] = [{ id: 1, name: 'Court 1' }, { id: 2, name: 'Court 2' }]

export default function PadelMap({ selected, onSelect }: { selected: number | null; onSelect: (id: number) => void }) {
  return (
    <div style={{ width: '100%' }}>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginBottom: 12, fontFamily: 'system-ui,sans-serif' }}>Select a court</p>
      <div style={{ background: '#1a472a', borderRadius: 12, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 4 }}>
          <LegendDot color="#22c55e" label="Available" /><LegendDot color="#2563eb" label="Selected" /><LegendDot color="#6b7280" label="Taken" />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {COURTS.map(court => {
            const isSel = selected === court.id
            return (
              <button key={court.id} onClick={() => onSelect(court.id)} style={{
                position: 'relative', width: 140, height: 200, borderRadius: 8,
                border: isSel ? '3px solid #60a5fa' : '3px solid rgba(255,255,255,0.15)',
                background: isSel ? '#1e40af' : '#166534', cursor: 'pointer', overflow: 'hidden',
                transition: 'all 0.2s ease', transform: isSel ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isSel ? '0 0 20px #2563eb88' : 'none', padding: 0, outline: 'none',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 140 200" style={{ position: 'absolute', inset: 0 }}>
                  <rect x="8" y="8" width="124" height="184" fill="none" stroke="white" strokeWidth="2" opacity="0.7"/>
                  <line x1="8" y1="100" x2="132" y2="100" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                  <line x1="70" y1="8" x2="70" y2="192" stroke="white" strokeWidth="1" opacity="0.4" strokeDasharray="4 3"/>
                  <line x1="8" y1="55" x2="132" y2="55" stroke="white" strokeWidth="1" opacity="0.5"/>
                  <line x1="8" y1="145" x2="132" y2="145" stroke="white" strokeWidth="1" opacity="0.5"/>
                  <line x1="8" y1="100" x2="132" y2="100" stroke="white" strokeWidth="3" opacity="0.9"/>
                  <rect x="8" y="98" width="124" height="4" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
                  <rect x="5" y="94" width="5" height="12" rx="1" fill="white" opacity="0.6"/>
                  <rect x="130" y="94" width="5" height="12" rx="1" fill="white" opacity="0.6"/>
                </svg>
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'system-ui,sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.5)', background: 'rgba(0,0,0,0.25)', padding: '3px 0' }}>{court.name}</div>
                {isSel && <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 900 }}>✓</div>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'white', fontFamily: 'system-ui,sans-serif' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />{label}</div>
}
