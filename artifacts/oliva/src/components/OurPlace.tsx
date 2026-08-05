/**
 * OurPlace.tsx — Editorial scroll canvas
 *
 * • One continuous SVG winding path, stroke-dashoffset ← scroll progress
 * • Oversized cinematic images (55–75 vw) scrubbed from rotated/scaled/offset
 *   initial state into final resting position — driven purely by scroll position
 * • SVG handwritten titles using Caveat Brush; each character drawn left→right
 *   by sequential stroke-dashoffset animations tied to scroll
 * • Everything fully bidirectional: scrolling back reverses all animations
 * • Respects prefers-reduced-motion
 */

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type RefObject,
} from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';
import { imageAssets } from '../utils/imageAssets';

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD        = 'rgba(212,168,67,0.9)';
const GOLD_DIM    = 'rgba(212,168,67,0.55)';
const CREAM       = '#f5f2e8';
const CREAM_DIM   = 'rgba(245,242,232,0.5)';
const BG_DARK     = '#0d1509';

// ─── Section data ─────────────────────────────────────────────────────────────
interface SectionDef {
  id: string;
  title: string;
  subtitle: string;
  /** Fractional position (0–1) along the page height where image center sits */
  yFrac: number;
  /** Which side the PRIMARY (large) image lives on */
  side: 'left' | 'right';
  mainImg: string;
  mainAlt: string;
  secImg: string;
  secAlt: string;
}

const SECTIONS: SectionDef[] = [
  {
    id:       'cafe',
    title:    'THE CAFÉ',
    subtitle: 'Where the slowest afternoon\nstarts with one cup.',
    yFrac:    0.14,
    side:     'left',
    mainImg:  '/cappuccino.jpeg',
    mainAlt:  'Cappuccino at Oliva',
    secImg:   '/images/products/OlivaFrappe.jpg',
    secAlt:   'Oliva signature frappe',
  },
  {
    id:       'padel',
    title:    'PADEL',
    subtitle: 'Two courts. Full menu.\nZero rush.',
    yFrac:    0.37,
    side:     'right',
    mainImg:  '/caramel-frappuccino.jpg',
    mainAlt:  'Refreshment at Oliva padel',
    secImg:   '/images/products/LotusMilkshake.jpg',
    secAlt:   'Lotus milkshake',
  },
  {
    id:       'kids',
    title:    'KIDS AREA',
    subtitle: 'Sweet moments,\njust the right size.',
    yFrac:    0.62,
    side:     'left',
    mainImg:  '/choconut-milkshake.png',
    mainAlt:  'Kids corner at Oliva',
    secImg:   '/images/products/RaspberryCheesecake.jpg',
    secAlt:   'Raspberry cheesecake',
  },
  {
    id:       'moments',
    title:    'YOUR MOMENTS',
    subtitle: 'Book a court. Order something cold.\nStay longer than planned.',
    yFrac:    0.87,
    side:     'right',
    mainImg:  '/images/products/OreoCheesecake.jpg',
    mainAlt:  'Moments at Oliva',
    secImg:   '/floral-fusion.png',
    secAlt:   'Floral fusion at Oliva',
  },
];

const PAGE_VH = 550; // total scroll travel in vh units

// ─── Reduced-motion check ─────────────────────────────────────────────────────
function useReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setRm(mq.matches);
    const h = (e: MediaQueryListEvent) => setRm(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return rm;
}

// ─── Mobile check (<768 px) ───────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return isMobile;
}

// ─── Winding-path builder ─────────────────────────────────────────────────────
/** Generates the SVG d-string for the decorative winding line. */
function buildPath(W: number, H: number): string {
  const cx  = W * 0.5;
  const lx  = W * 0.24;
  const rx  = W * 0.76;

  const ys = SECTIONS.map(s => H * s.yFrac);
  // top → s0 → s1 → s2 → s3 → bottom
  // Alternate left / right matching section sides
  const anchors = [
    { x: cx,  y: 0           },
    { x: lx,  y: ys[0]       },
    { x: rx,  y: ys[1]       },
    { x: lx,  y: ys[2]       },
    { x: rx,  y: ys[3]       },
    { x: cx,  y: H           },
  ];

  let d = `M ${anchors[0].x} ${anchors[0].y}`;
  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1];
    const curr = anchors[i];
    const mid  = (prev.y + curr.y) / 2;
    // smooth cubic bezier: control points mid-way, biased toward center
    const cp1x = prev.x + (curr.x - prev.x) * 0.3;
    const cp1y = mid - (mid - prev.y) * 0.15;
    const cp2x = curr.x - (curr.x - prev.x) * 0.3;
    const cp2y = mid + (curr.y - mid) * 0.15;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

// ─── Winding Line ─────────────────────────────────────────────────────────────
function WindingLine({
  containerRef,
  scrollYProgress,
  rm,
  isMobile,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  scrollYProgress: MotionValue<number>;
  rm: boolean;
  isMobile: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef  = useRef<SVGSVGElement>(null);
  const [pathD,  setPathD]  = useState('');
  const [len,    setLen]    = useState(0);
  const [vb,     setVb]     = useState('0 0 1 1');

  const recalc = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const W = el.offsetWidth;
    const H = el.scrollHeight;
    const d = buildPath(W, H);
    setPathD(d);
    setVb(`0 0 ${W} ${H}`);
  }, [containerRef]);

  // Measure length after path renders
  useEffect(() => {
    if (pathRef.current && pathD) {
      setLen(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  // Recalculate on mount and resize
  useEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalc, containerRef]);

  const dashOffset = useTransform(scrollYProgress, [0, 1], rm ? [0, 0] : [len, 0]);

  if (!pathD) return null;

  return (
    <svg
      ref={svgRef}
      viewBox={vb}
      preserveAspectRatio="none"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible',
      }}
    >
      {/* Soft glow duplicate — blur disabled on mobile for perf */}
      <path
        d={pathD}
        fill="none"
        stroke={GOLD_DIM}
        strokeWidth={isMobile ? 3 : 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={isMobile ? undefined : 'url(#lineBlur)'}
        strokeDasharray={len}
        style={{ opacity: isMobile ? 0.2 : 0.4 }}
      />
      {/* Main line */}
      <motion.path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={GOLD}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        style={{ strokeDashoffset: dashOffset }}
      />
      <defs>
        <filter id="lineBlur" x="-50%" y="-5%" width="200%" height="110%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── Per-character SVG title reveal ───────────────────────────────────────────
/**
 * Renders a word in Caveat Brush as individual SVG <text> elements,
 * each revealed by stroke-dashoffset sequentially as scroll progresses.
 */
function HandwrittenTitle({
  text,
  scrollYProgress,
  revealStart,
  revealEnd,
  rm,
  fontSize = 88,
}: {
  text: string;
  scrollYProgress: MotionValue<number>;
  revealStart: number;
  revealEnd: number;
  rm: boolean;
  fontSize?: number;
}) {
  const containerRef  = useRef<SVGSVGElement>(null);
  const charRefs      = useRef<(SVGTextElement | null)[]>([]);
  const [charLens,    setCharLens]   = useState<number[]>([]);
  const [charXs,      setCharXs]     = useState<number[]>([]);
  const [totalW,      setTotalW]     = useState(600);
  const [measured,    setMeasured]   = useState(false);

  const chars = text.split('');

  // Measure after render
  useEffect(() => {
    if (!charRefs.current.length) return;
    const lens: number[] = [];
    const xs:   number[] = [];
    let cursor = 0;
    charRefs.current.forEach((el) => {
      if (!el) { lens.push(20); xs.push(cursor); cursor += 20; return; }
      const w = el.getComputedTextLength();
      xs.push(cursor);
      lens.push(w);
      cursor += w;
    });
    setCharLens(lens);
    setCharXs(xs);
    setTotalW(Math.max(cursor, 10));
    setMeasured(true);
  }, [text, fontSize]);

  // Each character occupies an equal slice of the reveal window,
  // with slight overlap for a flowing feel.
  const stagger = (revealEnd - revealStart) / Math.max(chars.length, 1);

  return (
    <svg
      ref={containerRef}
      viewBox={`0 -${fontSize * 0.15} ${totalW} ${fontSize * 1.3}`}
      style={{
        width: '100%',
        maxWidth: Math.min(totalW * (fontSize / 88) * 1.1, 900),
        height: 'auto',
        overflow: 'visible',
        display: 'block',
        margin: '0 auto',
        opacity: measured ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      {chars.map((char, i) => {
        const charStart = revealStart + i * stagger;
        const charEnd   = charStart + stagger * 1.4; // slight overlap
        return (
          <CharacterStroke
            key={`${char}-${i}`}
            char={char}
            x={charXs[i] ?? i * 20}
            fontSize={fontSize}
            len={charLens[i] ?? 30}
            scrollYProgress={scrollYProgress}
            strokeStart={charStart}
            strokeEnd={Math.min(charEnd, revealEnd + stagger * 0.5)}
            rm={rm}
            elRef={(el) => { charRefs.current[i] = el; }}
          />
        );
      })}
    </svg>
  );
}

function CharacterStroke({
  char,
  x,
  fontSize,
  len,
  scrollYProgress,
  strokeStart,
  strokeEnd,
  rm,
  elRef,
}: {
  char: string;
  x: number;
  fontSize: number;
  len: number;
  scrollYProgress: MotionValue<number>;
  strokeStart: number;
  strokeEnd: number;
  rm: boolean;
  elRef: (el: SVGTextElement | null) => void;
}) {
  const safe     = Math.max(len, 1);
  const progress = useTransform(scrollYProgress, [strokeStart, strokeEnd], rm ? [1, 1] : [0, 1]);
  const dashOff  = useTransform(progress, [0, 1], [safe, 0]);
  const fillOp   = useTransform(progress, [0.6, 1], [0, 1]);
  const strokeOp = useTransform(progress, [0, 0.85, 1], [1, 1, 0]);

  return (
    <g>
      {/* Stroke layer — draws letter outlines */}
      <motion.text
        ref={elRef}
        x={x}
        y={0}
        dominantBaseline="auto"
        fontFamily='"Cormorant Garamond", "Playfair Display", serif'
        fontWeight={600}
        letterSpacing="0.04em"
        fontSize={fontSize}
        fill="none"
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: safe,
          strokeDashoffset: dashOff,
          opacity: strokeOp,
          paintOrder: 'stroke fill',
          textTransform: 'uppercase',
        }}
      >
        {char}
      </motion.text>
      {/* Fill layer — fades in as stroke completes */}
      <motion.text
        x={x}
        y={0}
        dominantBaseline="auto"
        fontFamily='"Cormorant Garamond", "Playfair Display", serif'
        fontWeight={600}
        letterSpacing="0.04em"
        fontSize={fontSize}
        fill={CREAM}
        stroke="none"
        style={{ opacity: fillOp, textTransform: 'uppercase' }}
      >
        {char}
      </motion.text>
    </g>
  );
}

// ─── Cinematic image ──────────────────────────────────────────────────────────
function CinematicImage({
  src,
  alt,
  scrollYProgress,
  entryStart,
  entryEnd,
  initRotate,
  initScale,
  initX,
  initY,
  rm,
  isMobile = false,
  loading = 'eager',
  objectFit = 'cover',
  objectPosition = 'center',
  style: extraStyle = {},
}: {
  src: string;
  alt: string;
  scrollYProgress: MotionValue<number>;
  entryStart: number;
  entryEnd: number;
  initRotate: number;
  initScale: number;
  initX: number;  // px
  initY: number;  // px
  rm: boolean;
  isMobile?: boolean;
  loading?: 'eager' | 'lazy';
  objectFit?: React.CSSProperties['objectFit'];
  objectPosition?: string;
  style?: React.CSSProperties;
}) {
  const rotate = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, Math.min(entryEnd + 0.12, 1)],
    rm ? [0, 0, 0] : [initRotate, 0, 0],
  );
  const scale  = useTransform(
    scrollYProgress,
    [entryStart, entryEnd],
    rm ? [1, 1] : [initScale, 1],
  );
  const tx     = useTransform(
    scrollYProgress,
    [entryStart, entryEnd],
    rm ? [0, 0] : [initX, 0],
  );
  const ty     = useTransform(
    scrollYProgress,
    [entryStart, entryEnd],
    rm ? [0, 0] : [initY, 0],
  );
  const opacity = useTransform(
    scrollYProgress,
    [entryStart, entryStart + (entryEnd - entryStart) * 0.3],
    rm ? [1, 1] : [0, 1],
  );

  return (
    <motion.div
      style={{
        position: 'absolute',
        rotate,
        scale,
        x: tx,
        y: ty,
        opacity,
        borderRadius: 12,
        overflow: 'hidden',
        // Reduce heavy shadow blur on mobile to avoid paint cost
        boxShadow: isMobile
          ? '0 8px 24px rgba(0,0,0,0.55)'
          : '0 24px 80px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)',
        willChange: 'transform, opacity',
        ...extraStyle,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={loading === 'lazy' ? 'async' : 'auto'}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          objectPosition,
          display: 'block',
        }}
      />
    </motion.div>
  );
}

// ─── Section content ──────────────────────────────────────────────────────────
function SectionContent({
  section,
  sectionIndex,
  pageHeightPx,
  scrollYProgress,
  rm,
  isMobile,
}: {
  section: SectionDef;
  sectionIndex: number;
  pageHeightPx: number;
  scrollYProgress: MotionValue<number>;
  rm: boolean;
  isMobile: boolean;
}) {
  const yPx    = pageHeightPx * section.yFrac;
  const isLeft = section.side === 'left';

  // ── Synchronized scroll ranges ─────────────────────────────────────────────
  // Order enforced: images enter → images settle → title writes → description
  // visible → hold → next scene enters.
  //
  // With PAGE_VH = 550 and yFrac gaps ≈ 0.23–0.25:
  //   imgEntry  = yFrac - 0.09  → images start entering
  //   imgSettled= yFrac - 0.01  → main image settled BEFORE title starts
  //   titleStart= yFrac         → title begins writing after images settled
  //   titleEnd  = yFrac + 0.09  → title fully written
  //   next imgEntry = nextYFrac - 0.09 ≥ yFrac + 0.14 → ~27 vh hold after each title
  const imgEntry   = Math.max(0, section.yFrac - 0.09);
  const imgSettled = Math.min(1, section.yFrac - 0.01);
  const titleStart = section.yFrac;
  const titleEnd   = Math.min(1, section.yFrac + 0.07);

  // Description becomes fully visible immediately after ~70% of title is written
  const subFadeStart = titleStart + (titleEnd - titleStart) * 0.70;
  const subFadeEnd   = Math.min(1, titleStart + (titleEnd - titleStart) * 0.90);
  const subOp = useTransform(
    scrollYProgress,
    [subFadeStart, subFadeEnd],
    rm ? [1, 1] : [0, 1],
  );

  // Only the first scene loads eagerly; all others load lazily
  const imgLoading: 'eager' | 'lazy' = sectionIndex === 0 ? 'eager' : 'lazy';

  // PNG files are poster-style product renders — use contain so subject stays visible
  const mainFit: React.CSSProperties['objectFit'] =
    section.mainImg.endsWith('.png') ? 'contain' : 'cover';
  const secFit: React.CSSProperties['objectFit'] =
    section.secImg.endsWith('.png') ? 'contain' : 'cover';

  // Frame is 100vh tall, centred on yPx
  // Children use vh-relative positioning inside this frame
  return (
    <div
      style={{
        position:  'absolute',
        top:       yPx,
        left:      0,
        right:     0,
        height:    '100vh',
        transform: 'translateY(-50%)',
        zIndex:    10,
        pointerEvents: 'none',
      }}
    >
      {/* ── Main image (large, 55–72 vw, bleeds off-screen edge) ── */}
      <CinematicImage
        src={section.mainImg}
        alt={section.mainAlt}
        scrollYProgress={scrollYProgress}
        entryStart={imgEntry}
        entryEnd={imgSettled}
        initRotate={isLeft ? -7 : 7}
        initScale={0.82}
        initX={isLeft ? -100 : 100}
        initY={60}
        rm={rm}
        isMobile={isMobile}
        loading={imgLoading}
        objectFit={mainFit}
        objectPosition="center"
        style={{
          position: 'absolute',
          [isLeft ? 'left' : 'right']: 'clamp(-50px, -4vw, -20px)',
          top: '5%',
          width: 'clamp(320px, 63vw, 860px)',
          height: 'clamp(380px, 74vh, 920px)',
          zIndex: 3,
        }}
      />

      {/* ── Secondary image (smaller, opposite side) ── */}
      <CinematicImage
        src={section.secImg}
        alt={section.secAlt}
        scrollYProgress={scrollYProgress}
        entryStart={imgEntry + 0.03}
        entryEnd={imgSettled + 0.05}
        initRotate={isLeft ? 9 : -9}
        initScale={0.78}
        initX={isLeft ? 70 : -70}
        initY={-55}
        rm={rm}
        isMobile={isMobile}
        loading={imgLoading}
        objectFit={secFit}
        objectPosition="center"
        style={{
          position: 'absolute',
          [isLeft ? 'right' : 'left']: 'clamp(8px, 5vw, 64px)',
          top: '8%',
          width: 'clamp(190px, 27vw, 380px)',
          height: 'clamp(240px, 38vh, 490px)',
          zIndex: 2,
        }}
      />

      {/* ── Text: handwritten title + subtitle ── */}
      <div
        style={{
          position: 'absolute',
          [isLeft ? 'right' : 'left']: 'clamp(16px, 4vw, 72px)',
          bottom: '6%',
          width: 'clamp(220px, 38vw, 540px)',
          zIndex: 20,
        }}
      >
        <HandwrittenTitle
          text={section.title}
          scrollYProgress={scrollYProgress}
          revealStart={titleStart}
          revealEnd={titleEnd}
          rm={rm}
          fontSize={88}
        />

        <motion.p
          style={{
            opacity:    subOp,
            marginTop:  16,
            fontSize:   'clamp(16px, 1.5vw, 19px)',
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle:  'italic',
            fontWeight: 600,
            lineHeight: 1.55,
            color:      'rgba(245, 242, 232, 0.88)',
            whiteSpace: 'pre-line',
            textShadow: '0 1px 4px rgba(0,0,0,0.45)',
          }}
        >
          {section.subtitle}
        </motion.p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OurPlace({ onBack }: { onBack: () => void }) {
  const trackRef      = useRef<HTMLDivElement>(null);
  const rm            = useReducedMotion();
  const isMobile      = useIsMobile();
  const [pageH, setPageH] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  // Ref used to gate setState so we never trigger a re-render on every scroll frame
  const activeIdxRef  = useRef(0);

  const { scrollYProgress } = useScroll({
    target:  trackRef,
    offset:  ['start start', 'end end'],
  });

  // Scroll hint fades out after first 6% of scroll
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Update active section for nav dots — only fires setState when section changes
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const fracs = SECTIONS.map(s => s.yFrac);
    let best = 0;
    let bestDist = Infinity;
    fracs.forEach((f, i) => {
      const d = Math.abs(v - f);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best !== activeIdxRef.current) {
      activeIdxRef.current = best;
      setActiveIdx(best);
    }
  });

  // Measure actual page height after mount / resize
  useEffect(() => {
    const update = () => {
      if (trackRef.current) setPageH(trackRef.current.scrollHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  // Reset scroll on mount
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  // Scroll to a section on dot click
  const scrollToSection = useCallback((idx: number) => {
    if (!trackRef.current) return;
    const H   = trackRef.current.scrollHeight;
    const winH = window.innerHeight;
    const top  = trackRef.current.getBoundingClientRect().top + window.scrollY;
    const frac = SECTIONS[idx].yFrac;
    window.scrollTo({ top: top + frac * (H - winH), behavior: 'smooth' });
  }, []);

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        height:   `${PAGE_VH}vh`,
        background: BG_DARK,
        overflowX: 'clip',
      }}
    >
      {/* ── Subtle noise grain ── */}
      <div
        style={{
          position:   'absolute', inset: 0, zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Winding SVG line ── */}
      <WindingLine
        containerRef={trackRef}
        scrollYProgress={scrollYProgress}
        rm={rm}
        isMobile={isMobile}
      />

      {/* ── Section image + title blocks ── */}
      {pageH > 0 && SECTIONS.map((s, i) => (
        <SectionContent
          key={s.id}
          section={s}
          sectionIndex={i}
          pageHeightPx={pageH}
          scrollYProgress={scrollYProgress}
          rm={rm}
          isMobile={isMobile}
        />
      ))}

      {/* ── Sticky top bar ── */}
      <div
        style={{
          position:   'sticky',
          top:         0,
          zIndex:      50,
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding:    'clamp(14px,2.5vw,24px) clamp(16px,3vw,36px)',
          background: 'linear-gradient(to bottom, rgba(10,14,8,0.72) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:         8,
            background: 'rgba(20,30,14,0.6)',
            border:     '1px solid rgba(212,168,67,0.35)',
            borderRadius: 999,
            padding:    '10px 20px',
            color:      'rgba(245,242,232,0.88)',
            fontSize:    13,
            fontWeight:  700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor:     'pointer',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            pointerEvents: 'auto',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.7)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow   = '0 0 20px rgba(212,168,67,0.22)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.35)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow   = 'none';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </button>

        {/* Logo */}
        <div
          style={{
            width:        'clamp(44px,6vw,60px)',
            height:       'clamp(44px,6vw,60px)',
            borderRadius: '50%',
            background:   '#596B3D',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            boxShadow:    '0 4px 20px rgba(89,107,61,0.4)',
            pointerEvents: 'auto',
          }}
        >
          <img
            src={imageAssets.logo}
            alt="Oliva"
            style={{ width: '78%', height: '78%', objectFit: 'contain' }}
          />
        </div>

        {/* Spacer */}
        <div style={{ width: 'clamp(80px,10vw,120px)' }} />
      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        style={{
          position:   'fixed',
          bottom:      36,
          left:       '50%',
          x:          '-50%',
          zIndex:      40,
          display:    'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap:         6,
          pointerEvents: 'none',
          opacity:     scrollHintOpacity,
        }}
      >
        <span style={{
          fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: CREAM_DIM, fontFamily: '"Manrope", sans-serif',
        }}>
          Scroll
        </span>
        <motion.div
          animate={rm ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: GOLD_DIM }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>

      {/* ── Right-side nav dots ── */}
      <NavDots
        activeIdx={activeIdx}
        onDotClick={scrollToSection}
      />
    </div>
  );
}

// ─── Nav dots ─────────────────────────────────────────────────────────────────
function NavDots({
  activeIdx,
  onDotClick,
}: {
  activeIdx: number;
  onDotClick: (i: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <nav
      aria-label="Section navigation"
      style={{
        position:     'fixed',
        right:        'clamp(16px,3vw,32px)',
        top:          '50%',
        transform:    'translateY(-50%)',
        zIndex:        50,
        display:      'flex',
        flexDirection: 'column',
        gap:           14,
        alignItems:   'flex-end',
      }}
    >
      {SECTIONS.map((s, i) => {
        const isActive  = i === activeIdx;
        const isHovered = i === hovered;
        return (
          <button
            key={s.id}
            onClick={() => onDotClick(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`Go to: ${s.title}`}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:         10,
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              padding:     4,
            }}
          >
            <motion.span
              animate={{ opacity: isActive || isHovered ? 1 : 0, x: isActive || isHovered ? 0 : 8 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize:      10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         isActive ? GOLD : CREAM_DIM,
                fontFamily:    '"Manrope", sans-serif',
                whiteSpace:    'nowrap',
                fontWeight:    isActive ? 700 : 500,
              }}
            >
              {s.title}
            </motion.span>
            <motion.div
              animate={{
                width:           isActive ? 26 : 6,
                backgroundColor: isActive ? GOLD : isHovered ? 'rgba(245,242,232,0.5)' : 'rgba(245,242,232,0.22)',
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 6, borderRadius: 999, flexShrink: 0 }}
            />
          </button>
        );
      })}
    </nav>
  );
}
