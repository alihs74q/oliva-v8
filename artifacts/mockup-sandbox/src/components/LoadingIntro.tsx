import { useEffect, useRef, useState } from 'react';

// Only preload hero + menu category card images for faster loading
const IMAGES_TO_PRELOAD = [
  // Menu category cards (7 images)
  'https://images.pexels.com/photos/15851583/pexels-photo-15851583/free-photo-of-cappuccino-in-cup-on-table.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/22873679/pexels-photo-22873679.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/16544183/pexels-photo-16544183/free-photo-of-sweet-cakes-on-plate.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27303141487567135-FZOtUqnJn852MBeJeyIeP3bhfQy8iL.jpg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sandwich%20PNG-ALWYL1Ttrugnx7fPbCpNyn3mu4AcTN.jpg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14988611256100392-VcfSLudrmQ98JzCToSTWUmeOANUBaV.jpg',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0a6RZwqQSo38UmBftouiTQtlg9C8Rc.png',
];

const TOTAL = IMAGES_TO_PRELOAD.length;

interface LoadingIntroProps {
  onComplete: () => void;
}

export default function LoadingIntro({ onComplete }: LoadingIntroProps) {
  const [loaded, setLoaded] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done' | 'fadeout'>('loading');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Derived progress 0–100
  const progress = Math.round((loaded / TOTAL) * 100);

  useEffect(() => {
    let settled = 0;

    const finish = () => {
      settled += 1;
      setLoaded(settled);
      if (settled >= TOTAL) {
        // Small pause so the bar visually hits 100% before fading
        setTimeout(() => setPhase('done'), 320);
        setTimeout(() => setPhase('fadeout'), 820);
        setTimeout(() => onCompleteRef.current(), 1420);
      }
    };

    const imgs: HTMLImageElement[] = [];
    IMAGES_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = finish;
      img.onerror = finish; // count errors too so we never get stuck
      img.src = src;
      imgs.push(img);
    });

    return () => {
      imgs.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg,#1a2e1a,#0f1f0f 50%,#0a140a)',
        transition: phase === 'fadeout' ? 'opacity 600ms ease' : 'none',
        opacity: phase === 'fadeout' ? 0 : 1,
        pointerEvents: phase === 'fadeout' ? 'none' : 'all',
      }}
    >
      {/* Subtle grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: 0.03,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient glow behind logo */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(134,239,172,0.12) 0%, transparent 70%)',
          animation: 'ol-glow-breathe 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: 'relative',
          width: 128,
          height: 128,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2.5px solid rgba(134,239,172,0.35)',
          boxShadow: '0 0 40px rgba(134,239,172,0.18), 0 8px 32px rgba(0,0,0,0.5)',
          animation: 'ol-logo-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
          marginBottom: 40,
        }}
      >
        <img
          src="/oliva-logo.png"
          alt="Oliva"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Brand name */}
      <p
        style={{
          margin: '0 0 6px',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: '#86efac',
          animation: 'ol-fade-up 0.6s ease-out 0.3s both',
        }}
      >
        Padel · Café · Shisha
      </p>

      {/* Progress bar track */}
      <div
        style={{
          marginTop: 32,
          width: 'clamp(200px, 40vw, 280px)',
          height: 2,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          animation: 'ol-fade-up 0.6s ease-out 0.4s both',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #4ade80, #86efac)',
            width: `${progress}%`,
            transition: 'width 0.25s ease',
            boxShadow: '0 0 8px rgba(134,239,172,0.6)',
          }}
        />
      </div>

      {/* Percentage label */}
      <p
        style={{
          margin: '12px 0 0',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'rgba(134,239,172,0.55)',
          fontVariantNumeric: 'tabular-nums',
          animation: 'ol-fade-up 0.6s ease-out 0.5s both',
          minWidth: 44,
          textAlign: 'center',
        }}
      >
        {phase === 'done' ? '100' : progress}%
      </p>

      <style>{`
        @keyframes ol-logo-in {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ol-fade-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ol-glow-breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
