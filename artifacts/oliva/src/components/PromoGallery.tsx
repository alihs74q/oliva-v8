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
}

interface Props {
  slides: PromoGallerySlide[];
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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeIndex >= activeSlides.length) setActiveIndex(0);
  }, [activeIndex, activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length < 2 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % activeSlides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [activeSlides.length, isPaused]);

  useEffect(() => {
    const families = ['Bricolage Grotesque, sans-serif', 'Space Mono, monospace', ...activeSlides
      .flatMap((slide) => [slide.titleFontFamily, slide.descriptionFontFamily])
      .filter(Boolean)];
    families.forEach((family) => loadGoogleFont(family as string));
  }, [activeSlides]);

  if (activeSlides.length === 0) return null;

  const slide = activeSlides[activeIndex];
  const showText = slide.textVisible !== false;
  const showTitle = showText && slide.titleVisible !== false;
  const showDescription = showText && slide.descriptionVisible !== false;
  const hasCopy = showText && Boolean(slide.eyebrow || (showTitle && slide.title) || (showDescription && slide.description));
  const previous = () => setActiveIndex((activeIndex - 1 + activeSlides.length) % activeSlides.length);
  const next = () => setActiveIndex((activeIndex + 1) % activeSlides.length);

  return (
    <section
      aria-label="Oliva promotions"
      tabIndex={0}
      onKeyDown={(event) => {
        if (activeSlides.length < 2) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          previous();
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          next();
        }
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
      }}
      style={{
        width: '100%',
        maxWidth: 1040,
        margin: '0 auto clamp(30px,5vw,64px)',
        position: 'relative',
        zIndex: 10,
        outline: 'none',
      }}
    >
      <div style={galleryIntro}>
        <div>
          <div style={introKicker}><span style={introRule} /> The Oliva edit</div>
          <div style={introTitle}>A little extra<br />before the menu.</div>
        </div>
        <div style={introMeta}>
          <span>Fresh from the grove</span>
          <strong>{String(activeIndex + 1).padStart(2, '0')} <i>/</i> {String(activeSlides.length).padStart(2, '0')}</strong>
        </div>
      </div>

      <div style={galleryFrame}>
        <div style={imageFrame}>
          <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 30, scale: 0.975 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 1.01 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
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
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </a>
          </motion.div>
          </AnimatePresence>
          <div style={imageWash} aria-hidden="true" />
          {activeSlides.length > 1 && (
          <>
            <button type="button" aria-label="Previous promotion" onClick={previous} style={arrowStyle('left')}><Arrow direction="left" /></button>
            <button type="button" aria-label="Next promotion" onClick={next} style={arrowStyle('right')}><Arrow direction="right" /></button>
          </>
          )}
        </div>

        {hasCopy && (
          <div style={copyPanel}>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`${slide.id}-copy`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'grid', gap: 9 }}
              >
                {slide.eyebrow && <div style={eyebrowStyle}>{slide.eyebrow}</div>}
                {showTitle && slide.title && (
                  <div style={{
                    color: slide.titleColor || '#24351e',
                    fontFamily: slide.titleFontFamily || 'Bricolage Grotesque, sans-serif',
                    fontSize: 'clamp(29px,5vw,64px)',
                    fontWeight: 800,
                    lineHeight: 0.94,
                    letterSpacing: '-0.055em',
                    maxWidth: 760,
                  }}>{slide.title}</div>
                )}
                {showDescription && slide.description && (
                  <div style={{
                    color: slide.descriptionColor || '#52604a',
                    fontFamily: slide.descriptionFontFamily || 'DM Sans, sans-serif',
                    fontSize: 'clamp(13px,1.55vw,17px)',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    maxWidth: 680,
                  }}>{slide.description}</div>
                )}
              </motion.div>
            </AnimatePresence>
            <span style={copyStamp} aria-hidden="true">OLIVA / EDIT</span>
          </div>
        )}

        {activeSlides.length > 1 && (
          <nav aria-label="Promotion slides" style={dotsNav}>
            {activeSlides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show promotion ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
                style={{ ...dotStyle, width: index === activeIndex ? 34 : 8, background: index === activeIndex ? '#e3c66f' : 'rgba(40,56,29,0.26)' }}
              />
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left'
        ? <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>
        : <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>}
    </svg>
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

function arrowStyle(side: 'left' | 'right'): CSSProperties {
  return {
    position: 'absolute', zIndex: 3, top: '50%', [side]: 'clamp(10px,2vw,22px)', transform: 'translateY(-50%)',
    width: 44, height: 44, display: 'grid', placeItems: 'center',
    border: '1px solid rgba(255,255,255,0.42)', borderRadius: '50%',
    background: 'rgba(25,39,22,0.56)', color: '#f8f4e9',
    cursor: 'pointer', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    transition: 'background 0.22s ease, border-color 0.22s ease, transform 0.22s ease',
  };
}

const galleryIntro: CSSProperties = {
  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20,
  padding: '0 clamp(4px,1vw,14px) clamp(18px,2.5vw,26px)',
};

const introKicker: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9, color: '#71864d',
  fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
};

const introRule: CSSProperties = {
  display: 'inline-block', width: 28, height: 2, borderRadius: 99, background: '#d4a843',
};

const introTitle: CSSProperties = {
  marginTop: 10, color: '#27391f', fontFamily: 'Bricolage Grotesque, sans-serif',
  fontSize: 'clamp(27px,4vw,49px)', fontWeight: 800, lineHeight: 0.94,
  letterSpacing: '-0.06em',
};

const introMeta: CSSProperties = {
  display: 'grid', justifyItems: 'end', gap: 9, paddingBottom: 3,
  color: '#71806b', fontFamily: 'Space Mono, monospace', fontSize: 10,
  letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right',
};

const galleryFrame: CSSProperties = {
  overflow: 'hidden', border: '1px solid rgba(64,86,52,0.25)', borderRadius: 'clamp(22px,3vw,34px)',
  background: '#e8e3d4', boxShadow: '0 24px 66px rgba(40,57,29,0.17), 0 4px 12px rgba(40,57,29,0.08)',
};

const imageFrame: CSSProperties = {
  position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', background: '#253923',
};

const imageWash: CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  background: 'linear-gradient(115deg, rgba(13,30,16,0.18), transparent 38%, rgba(13,30,16,0.08) 100%)',
};

const copyPanel: CSSProperties = {
  position: 'relative', minHeight: 154, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: 24, padding: 'clamp(22px,3.2vw,36px) clamp(22px,5vw,64px) clamp(25px,3.5vw,40px)',
  background: 'linear-gradient(120deg, #f5f0e5 0%, #e7edcf 100%)',
};

const eyebrowStyle: CSSProperties = {
  color: '#71864d', fontFamily: 'Space Mono, monospace', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.16em', lineHeight: 1.3, textTransform: 'uppercase',
};

const copyStamp: CSSProperties = {
  position: 'absolute', right: 'clamp(20px,4vw,48px)', bottom: 17, color: 'rgba(39,57,31,0.34)',
  fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.14em',
};

const dotsNav: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  minHeight: 46, background: '#e8e3d4',
};

const dotStyle: CSSProperties = {
  height: 8, padding: 0, border: 0, borderRadius: 99, cursor: 'pointer',
  transition: 'width 0.28s ease, background 0.28s ease',
};