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

  if (activeSlides.length === 0) return null;

  const slide = activeSlides[activeIndex];
  const hasCopy = Boolean(slide.eyebrow || slide.title || slide.description);
  const content = (
    <>
      <img
        src={slide.imageUrl}
        alt={slide.alt || 'Oliva promotion'}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: hasCopy
          ? 'linear-gradient(90deg, rgba(15,29,14,0.84) 0%, rgba(15,29,14,0.26) 58%, rgba(15,29,14,0.05) 100%)'
          : 'linear-gradient(180deg, rgba(15,29,14,0.04), rgba(15,29,14,0.2))',
      }} />
      {hasCopy && (
        <div style={{
          position: 'absolute', left: 'clamp(20px,5vw,60px)', bottom: 'clamp(24px,5vw,54px)',
          maxWidth: 'min(70%, 520px)', color: '#fff',
          textAlign: 'left', textShadow: '0 2px 18px rgba(0,0,0,0.25)',
        }}>
          {slide.eyebrow && <div style={{ color: '#e2c477', fontSize: 'clamp(10px,1.4vw,13px)', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>{slide.eyebrow}</div>}
          {slide.title && <div style={{ fontSize: 'clamp(24px,5vw,54px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.04em' }}>{slide.title}</div>}
          {slide.description && <div style={{ marginTop: 10, fontSize: 'clamp(12px,1.7vw,16px)', fontWeight: 600, lineHeight: 1.4, color: 'rgba(255,255,255,0.86)' }}>{slide.description}</div>}
        </div>
      )}
      <div style={{ position: 'absolute', top: 16, right: 18, padding: '7px 11px', borderRadius: 999, background: 'rgba(15,29,14,0.48)', color: 'rgba(255,255,255,0.82)', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', backdropFilter: 'blur(8px)' }}>
        Oliva
      </div>
    </>
  );

  return (
    <div style={{ width: '100%', maxWidth: 960, margin: '0 auto clamp(28px,5vw,52px)', position: 'relative', zIndex: 10 }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 7', minHeight: 220, maxHeight: 500, overflow: 'hidden', borderRadius: 'clamp(18px,3vw,30px)', border: '1px solid rgba(74,103,65,0.28)', boxShadow: '0 18px 48px rgba(35,54,27,0.22)', background: '#253923' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {slide.link ? <a href={slide.link} target="_blank" rel="noreferrer" aria-label={slide.title || 'Open promotion'} style={{ display: 'block', width: '100%', height: '100%' }}>{content}</a> : content}
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

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', zIndex: 2, top: '50%', [side]: 12, transform: 'translateY(-50%)',
    width: 36, height: 36, border: '1px solid rgba(255,255,255,0.28)', borderRadius: '50%',
    background: 'rgba(15,29,14,0.48)', color: '#fff', fontSize: 28, lineHeight: '28px',
    cursor: 'pointer', backdropFilter: 'blur(8px)',
  };
}