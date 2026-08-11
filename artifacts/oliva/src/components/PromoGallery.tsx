import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface PromoGallerySlide {
  id: string;
  imageUrl: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  link?: string;
  visible: boolean;
  textVisible?: boolean;
  titleVisible?: boolean;
  descriptionVisible?: boolean;
  titleColor?: string;
  descriptionColor?: string;
  titleFontFamily?: string;
  descriptionFontFamily?: string;
  introVisible?: boolean;
  introKicker?: string;
  introKickerVisible?: boolean;
  introTitle?: string;
  introTitleVisible?: boolean;
  introMeta?: string;
  introMetaVisible?: boolean;
  slideCounterVisible?: boolean;
  copyStamp?: string;
  copyStampVisible?: boolean;
}

interface Props {
  slides: PromoGallerySlide[];
}

const SCRIPT_TITLE_FONT = 'Alex Brush, cursive';

function resolveTitleFont(font?: string) {
  if (!font || font === 'Bricolage Grotesque, sans-serif' || font === 'DM Sans, sans-serif') return SCRIPT_TITLE_FONT;
  return font;
}

export default function PromoGallery({ slides }: Props) {
  const activeSlides = useMemo(() => slides
    .filter((slide) => slide?.visible && slide.imageUrl)
    .map((slide, index) => ({
      ...slide,
      id: slide.id || `promo-${index}`,
      alt: slide.alt || 'Oliva promotion',
    })), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (activeIndex >= activeSlides.length) setActiveIndex(0);
  }, [activeIndex, activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % activeSlides.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [activeSlides.length]);

  useEffect(() => {
    const families = [SCRIPT_TITLE_FONT, ...activeSlides.map((slide) => slide.titleFontFamily).filter(Boolean)];
    families.forEach((family) => loadGoogleFont(family as string));
  }, [activeSlides]);

  if (activeSlides.length === 0) return null;

  const slide = activeSlides[activeIndex];
  const showTitle = slide.titleVisible !== false && Boolean(slide.title);

  return (
    <section
      aria-label="Oliva promotions"
      style={{
        width: '100%',
        maxWidth: 1040,
        margin: '0 auto clamp(30px,5vw,64px)',
        position: 'relative',
        zIndex: 10,
        outline: 'none',
      }}
    >
      <div style={galleryFrame}>
        {showTitle && (
          <div style={copyPanel}>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`${slide.id}-copy`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  color: slide.titleColor || '#24351e',
                  fontFamily: resolveTitleFont(slide.titleFontFamily),
                  fontSize: 'clamp(50px,8vw,108px)',
                  fontWeight: 400,
                  lineHeight: 0.82,
                  letterSpacing: '-0.015em',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {slide.title}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div style={imageFrame}>
          <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <a
              href={slide.link || undefined}
              target={slide.link ? '_blank' : undefined}
              rel={slide.link ? 'noreferrer' : undefined}
              aria-label={slide.link ? (slide.title || 'Open promotion') : undefined}
              style={{ display: 'block', width: '100%', height: '100%', cursor: slide.link ? 'pointer' : 'default' }}
            >
              <motion.img
                src={slide.imageUrl}
                alt={slide.alt}
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </a>
          </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function loadGoogleFont(family: string) {
  const name = family.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  if (!name || /^(inherit|initial|unset|serif|sans-serif|monospace|system-ui)$/i.test(name)) return;
  const id = `oliva-font-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

const galleryFrame: CSSProperties = {
  overflow: 'hidden', border: '1px solid rgba(64,86,52,0.25)', borderRadius: 'clamp(22px,3vw,34px)',
  background: '#f5f0e5', boxShadow: '0 24px 66px rgba(40,57,29,0.17), 0 4px 12px rgba(40,57,29,0.08)',
};

const imageFrame: CSSProperties = {
  position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', background: '#253923',
};

const copyPanel: CSSProperties = {
  minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 'clamp(18px,3vw,30px) clamp(18px,5vw,56px)',
  background: '#f5f0e5',
};