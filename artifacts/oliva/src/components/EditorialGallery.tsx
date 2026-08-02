import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

// ── Gallery images — replace any URL here to swap a photo ──────────────────
// Each entry: { src, alt, span (grid placement), anim (animation style) }
// span classes use CSS grid column/row spans for the editorial layout.
const GALLERY_IMAGES = [
  {
    src: 'https://images.pexels.com/photos/6882376/pexels-photo-6882376.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    alt: 'Padel courts',
    span: 'col-span-2 row-span-2',
    anim: 'fade-up',
  },
  {
    src: 'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    alt: 'Café seating area',
    span: 'col-span-1 row-span-1',
    anim: 'fade-right',
  },
  {
    src: 'https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    alt: 'Iced coffee',
    span: 'col-span-1 row-span-2',
    anim: 'fade-up',
  },
  {
    src: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    alt: 'Hot coffee',
    span: 'col-span-1 row-span-1',
    anim: 'fade-left',
  },
  {
    src: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    alt: 'Gourmet burger',
    span: 'col-span-1 row-span-1',
    anim: 'fade-up',
    label: 'Padel',
  },
  {
    src: 'https://images.pexels.com/photos/708458/pexels-photo-708458.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    alt: 'Fresh pizza',
    span: 'col-span-2 row-span-1',
    anim: 'fade-left',
  },
  {
    src: 'https://images.pexels.com/photos/6882377/pexels-photo-6882377.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop',
    alt: 'Players on court',
    span: 'col-span-1 row-span-2',
    anim: 'fade-right',
  },
  {
    src: 'https://images.pexels.com/photos/331107/pexels-photo-331107.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    alt: 'Dessert plate',
    span: 'col-span-1 row-span-1',
    anim: 'fade-up',
  },
  {
    src: 'https://images.pexels.com/photos/261322/pexels-photo-261322.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
    alt: 'Relaxing after a match',
    span: 'col-span-1 row-span-1',
    anim: 'fade-left',
  },
  {
    src: 'https://images.pexels.com/photos/2527415/pexels-photo-2527415.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    alt: 'Evening padel atmosphere',
    span: 'col-span-2 row-span-1',
    anim: 'fade-up',
  },
] as const

function GalleryItem({ item, index }: { item: typeof GALLERY_IMAGES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Light parallax — only on desktop via the y transform
  const y = useTransform(scrollYProgress, [0, 1], [20, -20])

  let initial: { opacity: number; x?: number; y?: number } = { opacity: 0 }
  if (item.anim === 'fade-right') initial = { opacity: 0, x: -40 }
  else if (item.anim === 'fade-left') initial = { opacity: 0, x: 40 }
  else initial = { opacity: 0, y: 40 }

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl shadow-lg ${item.span}`}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: (index % 3) * 0.1 }}
    >
      <motion.img
        src={item.src}
        alt={item.alt}
        className="w-full h-full object-cover"
        style={{ y }}
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />
      {'label' in item && item.label && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)',
          padding: '18px 14px 10px',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <span style={{
            color: '#fff', fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {item.label as string}
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default function EditorialGallery() {
  return (
    <section id="gallery" className="py-20 sm:py-32 overflow-hidden" style={{ background: '#E8EFE0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Spacer for logo circle that sits at center-top after transition */}
        <div className="h-32 sm:h-40" aria-hidden />

        {/* Editorial grid — first block (café + food items, ends with burger) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[180px] sm:auto-rows-[220px] lg:auto-rows-[260px] gap-4">
          {GALLERY_IMAGES.slice(0, 5).map((item, i) => (
            <GalleryItem key={i} item={item} index={i} />
          ))}
        </div>

        {/* Editorial grid — second block (padel courts + atmosphere) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[180px] sm:auto-rows-[220px] lg:auto-rows-[260px] gap-4 mt-8">
          {GALLERY_IMAGES.slice(5).map((item, i) => (
            <GalleryItem key={i + 5} item={item} index={i + 5} />
          ))}
        </div>
      </div>
    </section>
  )
}
