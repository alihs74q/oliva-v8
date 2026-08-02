import { motion } from 'framer-motion'

// ── Replace this URL to swap the menu section image ────────────────────────
const MENU_IMAGE =
  'https://images.pexels.com/photos/1813467/pexels-photo-1813467.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop'

export default function ViewMenuCTA({ onViewMenu }: { onViewMenu: () => void }) {
  return (
    <section id="view-menu-cta" className="py-20 sm:py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Image — left on desktop, full-width on mobile */}
          <motion.div
            className="w-full lg:w-[60%] shrink-0"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-[3/2] shadow-2xl"
              style={{ border: '2px solid rgba(74,103,65,0.15)' }}
            >
              <motion.img
                src={MENU_IMAGE}
                alt="Café food and drinks"
                className="w-full h-full object-cover"
                initial={{ scale: 1.15 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(74,103,65,0.06) 0%, transparent 50%, rgba(0,0,0,0.12) 100%)',
                }}
              />
            </div>
          </motion.div>

          {/* Text content */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center lg:py-8">
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-800 leading-tight mb-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              VIEW OUR MENU
            </motion.h2>

            <motion.p
              className="text-base sm:text-lg text-stone-500 leading-relaxed mb-8 max-w-md"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.12 }}
            >
              Whether you're looking to refuel between games or relax before or
              after your match, our menu has something for everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.24 }}
            >
              <button
                onClick={onViewMenu}
                className="inline-flex items-center gap-2 bg-olive-600 hover:bg-olive-700 text-white font-semibold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                VIEW MENU
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
