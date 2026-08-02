import { useState, useEffect } from 'react'
import PadelMap from './PadelMap'

const WA_NUMBER = '972500000000'
const PRICE_PER_PERSON = 6
const PRICE_PER_MATCH = 24

interface FormState {
  guests: 2 | 4 | null
  court: number | null
  name: string
  date: string
  time: string
  payment: 'cash' | 'card' | null
}

const TIME_SLOTS = [
  { start: '09:00', end: '10:30' },
  { start: '10:30', end: '12:00' },
  { start: '12:00', end: '13:30' },
  { start: '13:30', end: '15:00' },
  { start: '15:00', end: '16:30' },
  { start: '16:30', end: '18:00' },
  { start: '18:00', end: '19:30' },
  { start: '19:30', end: '21:00' },
]

export default function BookingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState<FormState>({
    guests: null, court: null, name: '', date: '', time: '', payment: null,
  })

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const totalSteps = 2

  function canProceed() {
    if (step === 1) return form.guests !== null
    if (step === 2) return (
      form.court !== null &&
      form.name.trim().length > 1 &&
      form.date !== '' &&
      form.time !== '' &&
      form.payment !== null
    )
    return false
  }

  function buildMessage() {
    const slot = TIME_SLOTS.find(s => s.start === form.time)
    const timeRange = slot ? `${slot.start} – ${slot.end}` : form.time
    const total = form.guests ? form.guests * PRICE_PER_PERSON : 0
    return encodeURIComponent(
      `🎾 *Padel Court Booking*\n\n` +
      `👤 Name: ${form.name}\n` +
      `📅 Date: ${form.date}\n` +
      `🕐 Time: ${timeRange} (90 min)\n` +
      `👥 Players: ${form.guests}\n` +
      `🎾 Court: Court ${form.court}\n` +
      `💳 Payment: ${form.payment === 'cash' ? 'Cash on arrival' : 'Card on arrival'}\n\n` +
      `💰 *Total: $${total}* ($${PRICE_PER_PERSON}/person)\n\n` +
      `Please confirm my booking. Thank you!`
    )
  }

  function handleBook() {
    window.open(`https://wa.me/${WA_NUMBER}?text=${buildMessage()}`, '_blank')
    handleClose()
  }
  function handleClose() { setVisible(false); setTimeout(onClose, 280) }

  const total = form.guests ? form.guests * PRICE_PER_PERSON : 0
  const perPerson = PRICE_PER_PERSON

  return (
    <div onClick={e => e.target === e.currentTarget && handleClose()} style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
      backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
      transition: 'background 0.28s ease, backdrop-filter 0.28s ease', padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(24px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: 2 }}>🎾 Padel Booking</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#111', fontFamily: 'system-ui,sans-serif' }}>
              {step === 1 && 'How many players?'}
              {step === 2 && 'Court & Details'}
            </div>
          </div>
          <button onClick={handleClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f3f4f6',
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280', flexShrink: 0,
          }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 4,
                background: i < step ? '#2563eb' : '#e5e7eb',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>Step {step} of {totalSteps}</div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px 20px', overflowY: 'auto' }}>
          {step === 1 && (
            <div key="s1" style={{ animation: 'slideIn 0.25s ease' }}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, fontFamily: 'system-ui,sans-serif' }}>
                Padel is played in doubles or singles.<br/>
                <strong style={{ color: '#374151' }}>Duration: 90 min (fixed)</strong>
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[2, 4].map(n => {
                  const sel = form.guests === (n as 2 | 4)
                  return (
                    <button key={n} onClick={() => setForm(f => ({ ...f, guests: n as 2 | 4, court: null }))}
                      style={{
                        flex: '1 1 80px', padding: '20px 0', borderRadius: 14,
                        border: sel ? '2px solid #2563eb' : '2px solid #e5e7eb',
                        background: sel ? '#eff6ff' : '#f9fafb', cursor: 'pointer', outline: 'none',
                        transition: 'all 0.18s ease', transform: sel ? 'scale(1.04)' : 'scale(1)',
                      }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>{n === 2 ? '👤👤' : '👥👥'}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#111', fontFamily: 'system-ui,sans-serif' }}>{n} people</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div key="s2" style={{ animation: 'slideIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Summary bar */}
              <div style={{
                background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
                padding: '10px 14px', display: 'flex', gap: 10, flexWrap: 'wrap',
                fontSize: 12, fontFamily: 'system-ui,sans-serif',
              }}>
                <span>👥 {form.guests} guests</span>
                <span>⏱ 90 min</span>
              </div>

              {/* Court selection */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: 'system-ui,sans-serif', letterSpacing: 0.3 }}>Pick a court <span style={{ color: '#ef4444' }}>*</span></label>
                <PadelMap selected={form.court} onSelect={id => setForm(f => ({ ...f, court: id }))} />
              </div>

              {/* Name */}
              <Field label="Your Name" required>
                <input type="text" placeholder="e.g. Ali Hassan" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle} />
              </Field>

              {/* Date */}
              <Field label="Date" required>
                <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={inputStyle} />
              </Field>

              {/* Time slots with ranges */}
              <Field label="Time Slot (90 min)" required>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TIME_SLOTS.map(slot => {
                    const sel = form.time === slot.start
                    return (
                      <button key={slot.start} onClick={() => setForm(f => ({ ...f, time: slot.start }))}
                        style={{
                          padding: '8px 10px', borderRadius: 10,
                          border: sel ? '2px solid #2563eb' : '2px solid #e5e7eb',
                          background: sel ? '#eff6ff' : '#f9fafb',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none',
                          color: sel ? '#1d4ed8' : '#374151',
                          fontFamily: 'system-ui,sans-serif',
                          transition: 'all 0.15s ease',
                          transform: sel ? 'scale(1.05)' : 'scale(1)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                        <span style={{ fontSize: 10 }}>{slot.start}</span>
                        <span style={{ fontSize: 9, opacity: 0.5 }}>→</span>
                        <span style={{ fontSize: 10 }}>{slot.end}</span>
                      </button>
                    )
                  })}
                </div>
              </Field>

              {/* Payment method */}
              <Field label="Payment Method" required>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setForm(f => ({ ...f, payment: 'cash' }))}
                    style={{
                      flex: 1, padding: '14px 0', borderRadius: 12,
                      border: form.payment === 'cash' ? '2px solid #22c55e' : '2px solid #e5e7eb',
                      background: form.payment === 'cash' ? '#f0fdf4' : '#f9fafb',
                      cursor: 'pointer', outline: 'none', transition: 'all 0.18s ease',
                      transform: form.payment === 'cash' ? 'scale(1.03)' : 'scale(1)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}>
                    <span style={{ fontSize: 22 }}>💵</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: 'system-ui,sans-serif' }}>Cash</span>
                  </button>
                  <button onClick={() => setForm(f => ({ ...f, payment: 'card' }))}
                    style={{
                      flex: 1, padding: '14px 0', borderRadius: 12,
                      border: form.payment === 'card' ? '2px solid #2563eb' : '2px solid #e5e7eb',
                      background: form.payment === 'card' ? '#eff6ff' : '#f9fafb',
                      cursor: 'pointer', outline: 'none', transition: 'all 0.18s ease',
                      transform: form.payment === 'card' ? 'scale(1.03)' : 'scale(1)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}>
                    <span style={{ fontSize: 22 }}>💳</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: 'system-ui,sans-serif' }}>Card</span>
                  </button>
                </div>
              </Field>

              {/* Calculator / Total — padel vibe styled */}
              <div style={{
                marginTop: 6,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
                border: '2px solid #0a2060',
                boxShadow: '0 6px 20px rgba(37,99,235,0.3)',
                padding: '16px 18px',
                fontFamily: 'system-ui, sans-serif',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>🎾</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#bfdbfe', letterSpacing: 1.5, textTransform: 'uppercase' }}>Booking Calculator</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#dbeafe' }}>Players</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{form.guests ?? '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#dbeafe' }}>Price per person</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fde047' }}>${perPerson}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#dbeafe' }}>Match base</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${PRICE_PER_MATCH}</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Total</span>
                  <span style={{
                    fontSize: 24, fontWeight: 900, color: '#fde047',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}>${total}</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: '#bfdbfe', fontStyle: 'italic' }}>
                  ${perPerson} per person · ${PRICE_PER_MATCH} per match
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              border: '2px solid #e5e7eb', background: '#f9fafb',
              cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#374151',
              fontFamily: 'system-ui,sans-serif', transition: 'all 0.15s ease',
            }}>← Back</button>
          )}
          {step < totalSteps ? (
            <button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()} style={{
              flex: 2, padding: '13px 0', borderRadius: 12, border: 'none',
              background: canProceed() ? '#2563eb' : '#d1d5db', color: '#fff',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 800, fontFamily: 'system-ui,sans-serif',
              transition: 'all 0.2s ease', transform: canProceed() ? 'scale(1)' : 'scale(0.98)',
            }}>Continue →</button>
          ) : (
            <button onClick={() => canProceed() && handleBook()} disabled={!canProceed()} style={{
              flex: 2, padding: '13px 0', borderRadius: 12, border: 'none',
              background: canProceed() ? '#22c55e' : '#d1d5db', color: '#fff',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 800, fontFamily: 'system-ui,sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s ease',
            }}>
              <span>Book via WhatsApp</span>
              <span style={{ fontSize: 18 }}>💬</span>
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '2px solid #e5e7eb', fontSize: 14, fontFamily: 'system-ui,sans-serif',
  color: '#111', background: '#f9fafb', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, fontFamily: 'system-ui,sans-serif', letterSpacing: 0.3 }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}
