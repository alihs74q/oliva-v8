import { useEffect, useState } from 'react';
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
  const activeSlides = slides.filter((slide) => slide.visible && slide.imageUrl);
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
    const families = activeSlides.flatMap((slide) => [slide.titleFontFamily, slide.descriptionFontFamily]).filter(Boolean);
    families.forEach((family) => loadGoogleFont(family as string));
  }, [activeSlides]);

  if (activeSlides.length === 0) return null;

  const slide = activeSlides[activeIndex];
  const showText = slide.textVisible !== false;
  const showTitle = showText && slide.titleVisible !== false;
  const showDescription = showText && slide.descriptionVisible !== false;
  const hasCopy = showText && Boolean(slide.eyebrow || (showTitle && slide.title) || (showDescription && slide.description));
  const content = (
    <>
      <img
        src={slide.imageUrl}
        alt={slide.alt || 'Oliva promotion'}
        style={{
          display: 'block', width: '100%', height: '100%',
          objectFit: 'cover',
        }}
      />
    </>
  );

  return (
    <div style={{ width: '100%', maxWidth: 960, margin: '0 auto clamp(28px,5vw,52px)', position: 'relative', zIndex: 10 }}>
      <div style={{ overflow: 'hidden', borderRadius: 'clamp(18px,3vw,30px)', border: '1px solid rgba(74,103,65,0.28)', boxShadow: '0 18px 48px rgba(35,54,27,0.22)', background: '#253923' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'relative' }}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#253923' }}>
              {slide.link ? <a href={slide.link} target="_blank" rel="noreferrer" aria-label={slide.title || 'Open promotion'} style={{ display: 'block', width: '100%', height: '100%' }}>{content}</a> : content}
            </div>
            {hasCopy && (
              <div style={{
                padding: 'clamp(18px,3vw,30px) clamp(20px,5vw,58px) clamp(20px,3vw,32px)',
                background: 'linear-gradient(135deg, #f8f5eb 0%, #eee9d9 100%)',
                textAlign: 'left',
              }}>
                {showText && slide.eyebrow && <div style={{ color: '#71864d', fontSize: 'clamp(10px,1.4vw,13px)', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>{slide.eyebrow}</div>}
                {showTitle && slide.title && <div style={{ color: slide.titleColor || '#24351e', fontFamily: slide.titleFontFamily || 'inherit', fontSize: 'clamp(24px,4vw,48px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>{slide.title}</div>}
                {showDescription && slide.description && <div style={{ marginTop: 10, color: slide.descriptionColor || '#52604a', fontFamily: slide.descriptionFontFamily || 'inherit', fontSize: 'clamp(13px,1.7vw,17px)', fontWeight: 600, lineHeight: 1.5, maxWidth: 700 }}>{slide.description}</div>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {activeSlides.length > 1 && (
          <>
            <button type="button" aria-label="Previous promotion" onClick={() => setActiveIndex((activeIndex - 1 + activeSlides.length) % activeSlides.length)} style={arrowStyle('left')}>‹</button>
            <button type="button" aria-label="Next promotion" onClick={() => setActiveIndex((activeIndex + 1) % activeSlides.length)} style={arrowStyle('right')}>›</button>
            <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {activeSlides.map((item, index) => (
                <button key={item.id} type="button" aria-label={`Show promotion ${index + 1}`} onClick={() => setActiveIndex(index)} style={{ width: index === activeIndex ? 22 : 7, height: 7, border: 0, borderRadius: 999, padding: 0, cursor: 'pointer', background: index === activeIndex ? '#e2c477' : 'rgba(255,255,255,0.58)', transition: 'width 0.2s ease' }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
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

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', zIndex: 2, top: '50%', [side]: 12, transform: 'translateY(-50%)',
    width: 36, height: 36, border: '1px solid rgba(255,255,255,0.28)', borderRadius: '50%',
    background: 'rgba(15,29,14,0.48)', color: '#fff', fontSize: 28, lineHeight: '28px',
    cursor: 'pointer', backdropFilter: 'blur(8px)',
  };
}