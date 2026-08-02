import { motion } from 'framer-motion'

type GalleryId = 'padel' | 'kids' | 'place'

interface GallerySection {
  id: GalleryId
  label: string
  subtitle: string
  icon: string
  theme: 'olive' | 'playful' | 'warm'
}

const SECTIONS: GallerySection[] = [
  {
    id: 'padel',
    label: 'The Padel Field',
    subtitle: 'Two premium glass courts, professional grade',
    icon: '🎾',
    theme: 'olive',
  },
  {
    id: 'kids',
    label: 'Kids Zone',
    subtitle: 'A colorful playground for endless fun',
    icon: '🎨',
    theme: 'playful',
  },
  {
    id: 'place',
    label: 'The Place',
    subtitle: 'Where court meets cup — your home base',
    icon: '🏠',
    theme: 'warm',
  },
]

const THEME_STYLES = {
  olive: {
    bg: 'linear-gradient(135deg, #4a6741 0%, #2d3f26 100%)',
    accent: '#8fa672',
    text: '#e8ecd9',
    border: '#4a6741',
    glow: 'rgba(74,103,65,0.3)',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(143,166,114,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(143,166,114,0.15) 0%, transparent 50%)',
  },
  playful: {
    bg: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 50%, #f97316 100%)',
    accent: '#fde047',
    text: '#ffffff',
    border: '#3b82f6',
    glow: 'rgba(236,72,153,0.4)',
    pattern: 'radial-gradient(circle at 15% 25%, rgba(253,224,71,0.25) 0%, transparent 40%), radial-gradient(circle at 85% 75%, rgba(251,146,60,0.25) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(236,72,153,0.15) 0%, transparent 60%)',
  },
  warm: {
    bg: 'linear-gradient(135deg, #d4a574 0%, #a8896b 50%, #6b5237 100%)',
    accent: '#f0e6d0',
    text: '#fdfbf7',
    border: '#8b6f47',
    glow: 'rgba(212,165,116,0.4)',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(240,230,208,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(212,165,116,0.2) 0%, transparent 50%)',
  },
}

// Creative floating shapes for the kids zone
function FloatingShape({ shape, color, size, x, y, delay, duration }: { shape: 'circle' | 'star' | 'triangle' | 'square'; color: string; size: number; x: string; y: string; delay: number; duration: number }) {
  const shapeStyle: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width: size,
    height: size,
    opacity: 0.5,
  }

  if (shape === 'circle') {
    return <motion.div style={{ ...shapeStyle, borderRadius: '50%', background: color }} animate={{ y: [0, -15, 0], rotate: [0, 360] }} transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }} />
  } else if (shape === 'star') {
    return (
      <motion.div style={shapeStyle} animate={{ y: [0, -12, 0], rotate: [0, -360] }} transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" /></svg>
      </motion.div>
    )
  } else if (shape === 'triangle') {
    return (
      <motion.div style={shapeStyle} animate={{ y: [0, -10, 0], rotate: [0, 360] }} transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2L2 22h20z" /></svg>
      </motion.div>
    )
  } else {
    return <motion.div style={{ ...shapeStyle, background: color, borderRadius: '6px' }} animate={{ y: [0, -14, 0], rotate: [0, 360] }} transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }} />
  }
}

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-olive-600 text-sm font-semibold tracking-[0.3em] uppercase mb-3">Our Spaces</p>
          <h2 className="text-4xl font-bold text-stone-800">Experience Oliva</h2>
          <div className="w-16 h-1 bg-olive-600 rounded-full mx-auto mt-4" />
        </div>

        <div className="space-y-24">
          {SECTIONS.map((sec, idx) => {
            const theme = THEME_STYLES[sec.theme]
            const isReversed = idx % 2 === 1

            return (
              <motion.div
                key={sec.id}
                id={`gallery-${sec.id}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 items-center`}
              >
                {/* Creative image placeholder */}
                <div className="flex-1 w-full">
                  <div
                    className="relative rounded-3xl overflow-hidden aspect-[4/3] group cursor-pointer"
                    style={{
                      background: theme.bg,
                      backgroundImage: `${theme.pattern}, ${theme.bg}`,
                      boxShadow: `0 12px 40px ${theme.glow}`,
                      border: `2px solid ${theme.border}30`,
                    }}
                  >
                    {/* Floating shapes for kids zone */}
                    {sec.theme === 'playful' && (
                      <>
                        <FloatingShape shape="circle" color="#fde047" size={28} x="10%" y="15%" delay={0} duration={5} />
                        <FloatingShape shape="star" color="#fff" size={24} x="80%" y="20%" delay={0.5} duration={6} />
                        <FloatingShape shape="triangle" color="#f97316" size={26} x="75%" y="70%" delay={1} duration={5.5} />
                        <FloatingShape shape="square" color="#fff" size={20} x="15%" y="75%" delay={1.5} duration={4.5} />
                        <FloatingShape shape="circle" color="#ec4899" size={22} x="50%" y="10%" delay={2} duration={5} />
                        <FloatingShape shape="star" color="#3b82f6" size={18} x="45%" y="85%" delay={2.5} duration={6.5} />
                      </>
                    )}

                    {/* Padel field lines for padel section */}
                    {sec.theme === 'olive' && (
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                        <rect x="40" y="30" width="320" height="240" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" rx="4" />
                        <line x1="200" y1="30" x2="200" y2="270" stroke="rgba(255,255,224,0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
                        <line x1="40" y1="150" x2="360" y2="150" stroke="rgba(255,255,224,0.25)" strokeWidth="2" />
                        <rect x="40" y="60" width="320" height="180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      </svg>
                    )}

                    {/* Warm pattern for the place section */}
                    {sec.theme === 'warm' && (
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                        <circle cx="60" cy="60" r="40" fill="rgba(255,255,255,0.06)" />
                        <circle cx="340" cy="240" r="60" fill="rgba(255,255,255,0.06)" />
                        <circle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.04)" />
                      </svg>
                    )}

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        className="flex items-center justify-center"
                        style={{
                          width: '72px', height: '72px', borderRadius: '20px',
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(8px)',
                          fontSize: '36px',
                          border: '2px solid rgba(255,255,255,0.2)',
                        }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {sec.icon}
                      </motion.div>
                      <p className="text-sm font-medium" style={{ color: theme.text, opacity: 0.8 }}>
                        Add {sec.label} image here
                      </p>
                      <p className="text-xs" style={{ color: theme.text, opacity: 0.5 }}>
                        Recommended: 800 × 600px
                      </p>
                    </div>

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.3)' }}
                    >
                      <div
                        style={{
                          padding: '10px 24px', borderRadius: '12px',
                          background: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 700,
                          color: '#333', fontFamily: 'system-ui, sans-serif',
                        }}
                      >
                        Click to upload
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1 w-full">
                  <motion.div
                    initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: '48px', height: '48px', borderRadius: '14px',
                          background: sec.theme === 'playful'
                            ? 'linear-gradient(135deg, #3b82f6, #ec4899, #f97316)'
                            : sec.theme === 'olive'
                            ? 'linear-gradient(135deg, #6b8950, #4a6741)'
                            : 'linear-gradient(135deg, #d4a574, #8b6f47)',
                          fontSize: '24px',
                          boxShadow: `0 4px 16px ${theme.glow}`,
                        }}
                      >
                        {sec.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{
                          color: sec.theme === 'playful' ? '#3b82f6' : sec.theme === 'olive' ? '#4a6741' : '#8b6f47',
                        }}>{sec.label}</h3>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '50px' }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="h-1 rounded-full mt-1"
                          style={{
                            background: sec.theme === 'playful'
                              ? 'linear-gradient(90deg, #3b82f6, #ec4899, #f97316)'
                              : sec.theme === 'olive'
                              ? 'linear-gradient(90deg, #6b8950, #4a6741)'
                              : 'linear-gradient(90deg, #d4a574, #8b6f47)',
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-base text-stone-500 leading-relaxed">{sec.subtitle}</p>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
