import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  flavors: string[]
  accent: string
  label?: string
}

export default function FlavorPicker({ flavors, accent, label = 'Choose Flavor' }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    if (open) updateArrows()
  }, [open, updateArrows])

  const scrollBy = (dir: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 180, behavior: 'smooth' })
  }

  if (flavors.length === 0) return null

  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 18px',
          borderRadius: 14,
          background: open ? `${accent}22` : 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${accent}55`,
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selected ?? label}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} color={accent} />
        </motion.span>
      </button>

      {/* Flavor strip — appears below */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 10 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Left arrow (desktop) */}
              {canLeft && (
                <button
                  onClick={() => scrollBy(-1)}
                  style={{ ...arrowStyle, opacity: 1 }}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} color={accent} />
                </button>
              )}

              {/* Horizontal scroll strip */}
              <div
                ref={scrollRef}
                onScroll={updateArrows}
                style={{
                  flex: 1,
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  padding: '4px 2px',
                }}
                className="fp-strip"
              >
                {flavors.map(f => {
                  const isSel = f === selected
                  return (
                    <button
                      key={f}
                      onClick={() => setSelected(f)}
                      style={{
                        flexShrink: 0,
                        scrollSnapAlign: 'start',
                        padding: '8px 16px',
                        borderRadius: 10,
                        background: isSel ? accent : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isSel ? accent : 'rgba(255,255,255,0.14)'}`,
                        color: isSel ? '#fff' : 'rgba(255,255,255,0.7)',
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      {f}
                    </button>
                  )
                })}
              </div>

              {/* Right arrow (desktop) */}
              {canRight && (
                <button
                  onClick={() => scrollBy(1)}
                  style={{ ...arrowStyle, opacity: 1 }}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} color={accent} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .fp-strip::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

const arrowStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.14)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
}
