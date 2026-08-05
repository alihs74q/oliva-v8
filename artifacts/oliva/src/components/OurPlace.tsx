/**
 * OurPlace.tsx — Editorial scroll canvas (targeted corrections applied)
 *
 * Changes from previous version:
 *  1. PenRevealTitle — SVG <mask> with horizontal scan paths + getTotalLength()
 *     replaces the broken getComputedTextLength() SVG <text> stroke approach.
 *     A glowing gold cursor tracks the leading pen edge.
 *  2. Title font → Cormorant Garamond 600, uppercase, 0.05 em tracking.
 *  3. Timing tightened: titleStart = yFrac−0.055, titleEnd = yFrac+0.035.
 *  4. Images: objectFit/objectPosition per image; mobile 90 vw main / 40 vw sec.
 *  5. Mobile: no feGaussianBlur, reduced shadow, lazy-load non-first images.
 *  6. Line strokeWidth 3 px.
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
const GOLD       = 'rgba(212,168,67,0.95)';
const GOLD_DIM   = 'rgba(212,168,67,0.55)';
const CREAM      = '#f5f2e8';
const CREAM_DIM  = 'rgba(245,242,232,0.5)';
const BG_DARK    = '#0d1509';
const TITLE_FONT = '"Cormorant Garamond", "Playfair Display", serif';
const PAGE_VH    = 550;
const SCAN_ROWS  = 5; // horizontal pen-stroke rows per title

// ─── Section data ─────────────────────────────────────────────────────────────
interface SectionDef {
  id: string;
  title: string;
  subtitle: string;
  yFrac: number;
  side: 'left' | 'right';
  mainImg: string;
  mainAlt: string;
  mainObjectFit: 'cover' | 'contain';
  mainObjectPosition: string;
  secImg: string;
  secAlt: string;
  secObjectFit: 'cover' | 'contain';
  secObjectPosition: string;
}

const SECTIONS: SectionDef[] = [
  {
    id: 'cafe',
    title: 'THE CAFÉ',
    subtitle: 'Where the slowest afternoon\nstarts with one cup.',
    yFrac: 0.14,
    side: 'left',
    mainImg: '/cappuccino.jpeg',
    mainAlt: 'Cappuccino at Oliva',
    mainObjectFit: 'cover',
    mainObjectPosition: 'center 30%',
    secImg: '/images/products/OlivaFrappe.jpg',
    secAlt: 'Oliva signature frappe',
    secObjectFit: 'contain',
    secObjectPosition: 'center center',
  },
  {
    id: 'padel',
    title: 'PADEL',
    subtitle: 'Two courts. Full menu.\nZero rush.',
    yFrac: 0.37,
    side: 'right',
    mainImg: '/caramel-frappuccino.jpg',
    mainAlt: 'Refreshment at Oliva padel',
    mainObjectFit: 'cover',
    mainObjectPosition: 'center 20%',
    secImg: '/images/products/LotusMilkshake.jpg',
    secAlt: 'Lotus milkshake',
    secObjectFit: 'contain',
    secObjectPosition: 'center center',
  },
  {
    id: 'kids',
    title: 'KIDS AREA',
    subtitle: 'Sweet moments,\njust the right size.',
    yFrac: 0.62,
    side: 'left',
    mainImg: '/choconut-milkshake.png',
    mainAlt: 'Kids corner at Oliva',
    mainObjectFit: 'contain',
    mainObjectPosition: 'center center',
    secImg: '/images/products/RaspberryCheesecake.jpg',
    secAlt: 'Raspberry cheesecake',
    secObjectFit: 'cover',
    secObjectPosition: 'center 30%',
  },
  {
    id: 'moments',
    title: 'YOUR MOMENTS',
    subtitle: 'Book a court. Order something cold.\nStay longer than planned.',
    yFrac: 0.87,
    side: 'right',
    mainImg: '/images/products/OreoCheesecake.jpg',
    mainAlt: 'Moments at Oliva',
    mainObjectFit: 'cover',
    mainObjectPosition: 'center 25%',
    secImg: '/floral-fusion.png',
    secAlt: 'Floral fusion at Oliva',
    secObjectFit: 'contain',
    secObjectPosition: 'center center',
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
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

function useMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768,
  );
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

// ─── Winding path ─────────────────────────────────────────────────────────────
function buildPath(W: number, H: number): string {
  const cx = W * 0.5, lx = W * 0.24, rx = W * 0.76;
  const ys = SECTIONS.map(s => H * s.yFrac);
  const anchors = [
    { x: cx, y: 0 },
    { x: lx, y: ys[0] },
    { x: rx, y: ys[1] },
    { x: lx, y: ys[2] },
    { x: rx, y: ys[3] },
    { x: cx, y: H },
  ];
  let d = `M ${anchors[0].x} ${anchors[0].y}`;
  for (let i = 1; i < anchors.length; i++) {
    const p = anchors[i - 1], c = anchors[i];
    const mid = (p.y + c.y) / 2;
    const cp1x = p.x + (c.x - p.x) * 0.3;
    const cp1y = mid - (mid - p.y) * 0.15;
    const cp2x = c.x - (c.x - p.x) * 0.3;
    const cp2y = mid + (c.y - mid) * 0.15;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${c.x} ${c.y}`;
  }
  return d;
}

// ─── Winding line ─────────────────────────────────────────────────────────────
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
  const [pathD, setPathD] = useState('');
  const [len, setLen]     = useState(0);
  const [vb, setVb]       = useState('0 0 1 1');

  const recalc = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const W = el.offsetWidth, H = el.scrollHeight;
    setPathD(buildPath(W, H));
    setVb(`0 0 ${W} ${H}`);
  }, [containerRef]);

  useEffect(() => {
    if (pathRef.current && pathD)
      setLen(pathRef.current.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalc, containerRef]);

  const dashOffset = useTransform(
    scrollYProgress, [0, 1], rm ? [0, 0] : [len, 0],
  );

  if (!pathD) return null;

  return (
    <svg
      viewBox={vb}
      preserveAspectRatio="none"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 5, overflow: 'visible',
      }}
    >
      {/* Soft glow — desktop only for performance */}
      {!isMobile && (
        <path
          d={pathD}
          fill="none"
          stroke={GOLD_DIM}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineBlur)"
          strokeDasharray={len}
          style={{ opacity: 0.35 }}
        />
      )}
      {/* Main line */}
      <motion.path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        style={{ strokeDashoffset: dashOffset }}
      />
      <defs>
        {!isMobile && (
          <filter id="lineBlur" x="-50%" y="-5%" width="200%" height="110%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        )}
      </defs>
    </svg>
  );
}

// ─── Pen-reveal title ─────────────────────────────────────────────────────────
/**
 * Reveals the section title through an SVG mask made of horizontal scan strokes.
 * Each stroke is a genuine <path> whose length is measured with getTotalLength().
 * stroke-dashoffset is tied directly to scroll progress — fully bidirectional.
 * A gold cursor glow marks the leading edge of the current stroke.
 */

/** One horizontal scan row inside the mask */
function ScanRow({
  row,
  totalRows,
  bboxX,
  bboxY,
  bboxW,
  bboxH,
  scrollYProgress,
  revealStart,
  revealEnd,
  rm,
}: {
  row: number;
  totalRows: number;
  bboxX: number;
  bboxY: number;
  bboxW: number;
  bboxH: number;
  scrollYProgress: MotionValue<number>;
  revealStart: number;
  revealEnd: number;
  rm: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(bboxW + 4);

  const isRTL    = row % 2 === 1;
  const rowH     = bboxH / totalRows;
  const rowY     = bboxY + (row + 0.5) * rowH;
  const x0       = isRTL ? bboxX + bboxW : bboxX;
  const x1       = isRTL ? bboxX : bboxX + bboxW;
  const d        = `M ${x0} ${rowY} L ${x1} ${rowY}`;
  const rowStart = revealStart + (row / totalRows) * (revealEnd - revealStart);
  const rowEnd   = revealStart + ((row + 1) / totalRows) * (revealEnd - revealStart);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [d]);

  const dashOffset = useTransform(
    scrollYProgress,
    [rowStart, rowEnd],
    rm ? [0, 0] : [len, 0],
  );

  return (
    <motion.path
      ref={pathRef}
      d={d}
      stroke="white"
      strokeWidth={rowH + 3}   /* tiny overlap prevents hairline gaps */
      strokeLinecap="butt"
      fill="none"
      style={{ strokeDasharray: len, strokeDashoffset: dashOffset }}
    />
  );
}

function PenRevealTitle({
  sectionId,
  text,
  scrollYProgress,
  revealStart,
  revealEnd,
  rm,
  isMobile,
}: {
  sectionId: string;
  text: string;
  scrollYProgress: MotionValue<number>;
  revealStart: number;
  revealEnd: number;
  rm: boolean;
  isMobile: boolean;
}) {
  const maskId     = `pen-mask-${sectionId}`;
  const textRef    = useRef<SVGTextElement>(null);
  const fontSize   = isMobile ? 52 : 78;
  const viewH      = fontSize * 1.35;

  const [bbox, setBbox] = useState<{
    x: number; y: number; w: number; h: number;
  } | null>(null);

  // Measure after font load + first render
  useEffect(() => {
    const measure = async () => {
      await document.fonts.ready;
      if (!textRef.current) return;
      const b = textRef.current.getBBox();
      if (b.width > 0) setBbox({ x: b.x, y: b.y, w: b.width, h: b.height });
    };
    measure();
  }, [text, fontSize]);

  // Cursor x — tracks leading edge of current scan row
  const cursorX = useTransform(scrollYProgress, (p: number) => {
    if (!bbox) return 0;
    const t    = Math.min(Math.max((p - revealStart) / (revealEnd - revealStart), 0), 1);
    const rowF = t * SCAN_ROWS;
    const row  = Math.min(Math.floor(rowF), SCAN_ROWS - 1);
    const rowT = rowF - row;
    const isRTL = row % 2 === 1;
    return bbox.x + (isRTL ? (1 - rowT) * bbox.w : rowT * bbox.w);
  });

  // Cursor y — centre of the current scan row
  const cursorY = useTransform(scrollYProgress, (p: number) => {
    if (!bbox) return 0;
    const t    = Math.min(Math.max((p - revealStart) / (revealEnd - revealStart), 0), 1);
    const row  = Math.min(Math.floor(t * SCAN_ROWS), SCAN_ROWS - 1);
    const rowH = bbox.h / SCAN_ROWS;
    return bbox.y + (row + 0.5) * rowH;
  });

  // Cursor opacity — visible only during the writing window
  const cursorOpacity = useTransform(
    scrollYProgress,
    [revealStart, revealStart + 0.005, revealEnd - 0.005, revealEnd],
    rm ? [0, 0, 0, 0] : [0, 1, 1, 0],
  );

  // Full-text opacity once written (fill fades in after mask is complete)
  const fillOpacity = useTransform(
    scrollYProgress,
    [revealEnd - 0.01, revealEnd + 0.02],
    rm ? [1, 1] : [0, 1],
  );

  const svgStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    overflow: 'visible',
    height: 'auto',
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${bbox ? bbox.x + bbox.w + 4 : 600} ${viewH}`}
        style={svgStyle}
      >
        <defs>
          <mask id={maskId}>
            {/* Ghost background — stays white so text is fully revealed after write */}
            {bbox && (
              <rect
                x={bbox.x - 2} y={bbox.y - 2}
                width={bbox.w + 4} height={bbox.h + 4}
                fill="rgba(255,255,255,0.12)"
              />
            )}
            {/* Scan rows — each grows via stroke-dashoffset */}
            {bbox && Array.from({ length: SCAN_ROWS }, (_, r) => (
              <ScanRow
                key={r}
                row={r}
                totalRows={SCAN_ROWS}
                bboxX={bbox.x}
                bboxY={bbox.y}
                bboxW={bbox.w}
                bboxH={bbox.h}
                scrollYProgress={scrollYProgress}
                revealStart={revealStart}
                revealEnd={revealEnd}
                rm={rm}
              />
            ))}
            {/* White background covers entire bbox after writing completes,
                ensuring the text stays visible on scroll past it */}
            {bbox && (
              <motion.rect
                x={bbox.x - 2} y={bbox.y - 2}
                width={bbox.w + 4} height={bbox.h + 4}
                style={{ opacity: fillOpacity }}
                fill="white"
              />
            )}
          </mask>
        </defs>

        {/* Ghost text — very faint, visible before pen reaches */}
        <text
          ref={textRef}
          x={2}
          y={fontSize}
          fontFamily={TITLE_FONT}
          fontSize={fontSize}
          fontWeight={600}
          letterSpacing="0.05em"
          textDecoration="none"
          textAnchor="start"
          fill={CREAM}
          fillOpacity={0.1}
          style={{ textTransform: 'uppercase', userSelect: 'none' }}
        >
          {text}
        </text>

        {/* Masked bright text — revealed by scan strokes */}
        {bbox && (
          <text
            x={2}
            y={fontSize}
            fontFamily={TITLE_FONT}
            fontSize={fontSize}
            fontWeight={600}
            letterSpacing="0.05em"
            textAnchor="start"
            fill={CREAM}
            mask={`url(#${maskId})`}
            style={{ textTransform: 'uppercase', userSelect: 'none' }}
          >
            {text}
          </text>
        )}

        {/* Gold stroke outline traces with the scan — drawn on top of mask */}
        {bbox && (
          <text
            x={2}
            y={fontSize}
            fontFamily={TITLE_FONT}
            fontSize={fontSize}
            fontWeight={600}
            letterSpacing="0.05em"
            textAnchor="start"
            fill="none"
            stroke={GOLD}
            strokeWidth="0.8"
            mask={`url(#${maskId})`}
            style={{ textTransform: 'uppercase', userSelect: 'none' }}
          >
            {text}
          </text>
        )}

        {/* Pen-tip cursor glow */}
        {bbox && (
          <motion.g style={{ opacity: cursorOpacity }}>
            {/* Outer soft glow */}
            <motion.circle
              style={{ cx: cursorX, cy: cursorY }}
              r={10}
              fill="rgba(212,168,67,0.25)"
            />
            {/* Inner bright dot */}
            <motion.circle
              style={{ cx: cursorX, cy: cursorY }}
              r={4}
              fill={GOLD}
            />
          </motion.g>
        )}
      </svg>
    </div>
  );
}

// ─── Cinematic image ──────────────────────────────────────────────────────────
function CinematicImage({
  src,
  alt,
  objectFit,
  objectPosition,
  scrollYProgress,
  entryStart,
  entryEnd,
  initRotate,
  initScale,
  initX,
  initY,
  rm,
  isMobile,
  loading = 'lazy',
  style: extraStyle = {},
}: {
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain';
  objectPosition: string;
  scrollYProgress: MotionValue<number>;
  entryStart: number;
  entryEnd: number;
  initRotate: number;
  initScale: number;
  initX: number;
  initY: number;
  rm: boolean;
  isMobile: boolean;
  loading?: 'eager' | 'lazy';
  style?: React.CSSProperties;
}) {
  const rotate  = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, Math.min(entryEnd + 0.1, 1)],
    rm ? [0, 0, 0] : [initRotate, 0, 0],
  );
  const scale   = useTransform(
    scrollYProgress, [entryStart, entryEnd], rm ? [1, 1] : [initScale, 1],
  );
  const tx      = useTransform(
    scrollYProgress, [entryStart, entryEnd], rm ? [0, 0] : [initX, 0],
  );
  const ty      = useTransform(
    scrollYProgress, [entryStart, entryEnd], rm ? [0, 0] : [initY, 0],
  );
  const opacity = useTransform(
    scrollYProgress,
    [entryStart, entryStart + (entryEnd - entryStart) * 0.35],
    rm ? [1, 1] : [0, 1],
  );

  // Reduced shadow on mobile for GPU performance
  const shadow = isMobile
    ? '0 8px 24px rgba(0,0,0,0.55)'
    : '0 20px 70px rgba(0,0,0,0.7), 0 4px 14px rgba(0,0,0,0.4)';

  return (
    <motion.div
      style={{
        position: 'absolute',
        rotate, scale, x: tx, y: ty, opacity,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: shadow,
        willChange: 'transform, opacity',
        ...extraStyle,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
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

  // ─── Corrected timing ──────────────────────────────────────────────────────
  // Images enter ~130 ms before their section, settle 50 ms after.
  // Title starts drawing at yFrac−0.055, completes at yFrac+0.035.
  // Subtitle appears after title is nearly done.
  // Next scene images start at the earliest at titleEnd + 0.025 (enforced by
  // section spacing: sections are 0.23 apart, so imgEntry of section N+1
  // = yFrac[N+1] − 0.13 ≥ titleEnd[N] + 0.025).
  const imgEntry   = Math.max(0, section.yFrac - 0.13);
  const imgSettled = Math.min(1, section.yFrac + 0.03);
  const titleStart = Math.max(0, section.yFrac - 0.055);
  const titleEnd   = Math.min(1, section.yFrac + 0.035);
  const subStart   = titleEnd - 0.01;
  const subEnd     = Math.min(1, titleEnd + 0.04);

  const subOp = useTransform(
    scrollYProgress,
    [subStart, subEnd],
    rm ? [1, 1] : [0, 1],
  );

  // ── Mobile image sizes ──────────────────────────────────────────────────────
  const mainW = isMobile
    ? 'clamp(280px, 91vw, 420px)'
    : 'clamp(320px, 63vw, 840px)';
  const mainH = isMobile
    ? 'clamp(280px, 52svh, 420px)'
    : 'clamp(360px, 72vh, 900px)';
  const secW  = isMobile
    ? 'clamp(130px, 40vw, 200px)'
    : 'clamp(180px, 26vw, 360px)';
  const secH  = isMobile
    ? 'clamp(160px, 34svh, 250px)'
    : 'clamp(220px, 36vh, 460px)';

  // ── Mobile layout adjustments ───────────────────────────────────────────────
  const mainLeft   = isMobile ? 'clamp(0px, 2vw, 12px)' : 'clamp(-40px,-3vw,-16px)';
  const mainRight  = isMobile ? 'clamp(0px, 2vw, 12px)' : 'clamp(-40px,-3vw,-16px)';
  const secRight   = isMobile ? 'clamp(4px, 2vw, 12px)' : 'clamp(8px, 5vw, 60px)';
  const secLeft    = isMobile ? 'clamp(4px, 2vw, 12px)' : 'clamp(8px, 5vw, 60px)';
  const mainTop    = isMobile ? '5%' : '4%';
  const secTop     = isMobile ? '2%' : '6%';
  const textBottom = isMobile ? '2%' : '5%';
  const textSide   = isMobile ? 'clamp(8px,3vw,20px)' : 'clamp(14px,4vw,64px)';
  const textW      = isMobile ? '92vw' : 'clamp(220px,40vw,560px)';

  // Only first section loads eagerly
  const imgLoading: 'eager' | 'lazy' = sectionIndex === 0 ? 'eager' : 'lazy';

  return (
    <div
      style={{
        position: 'absolute',
        top: yPx,
        left: 0, right: 0,
        height: '100vh',
        transform: 'translateY(-50%)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Main image */}
      <CinematicImage
        src={section.mainImg}
        alt={section.mainAlt}
        objectFit={section.mainObjectFit}
        objectPosition={section.mainObjectPosition}
        scrollYProgress={scrollYProgress}
        entryStart={imgEntry}
        entryEnd={imgSettled}
        initRotate={isLeft ? -6 : 6}
        initScale={0.84}
        initX={isLeft ? -90 : 90}
        initY={55}
        rm={rm}
        isMobile={isMobile}
        loading={imgLoading}
        style={{
          [isLeft ? 'left' : 'right']: isLeft ? mainLeft : mainRight,
          top: mainTop,
          width: mainW,
          height: mainH,
          zIndex: 3,
        }}
      />

      {/* Secondary image */}
      <CinematicImage
        src={section.secImg}
        alt={section.secAlt}
        objectFit={section.secObjectFit}
        objectPosition={section.secObjectPosition}
        scrollYProgress={scrollYProgress}
        entryStart={imgEntry + 0.025}
        entryEnd={imgSettled + 0.04}
        initRotate={isLeft ? 8 : -8}
        initScale={0.80}
        initX={isLeft ? 65 : -65}
        initY={-45}
        rm={rm}
        isMobile={isMobile}
        loading={imgLoading}
        style={{
          [isLeft ? 'right' : 'left']: isLeft ? secRight : secLeft,
          top: secTop,
          width: secW,
          height: secH,
          zIndex: 2,
        }}
      />

      {/* Title + subtitle */}
      <div
        style={{
          position: 'absolute',
          [isLeft ? 'right' : 'left']: textSide,
          bottom: textBottom,
          width: textW,
          zIndex: 20,
        }}
      >
        <PenRevealTitle
          sectionId={section.id}
          text={section.title}
          scrollYProgress={scrollYProgress}
          revealStart={titleStart}
          revealEnd={titleEnd}
          rm={rm}
          isMobile={isMobile}
        />

        <motion.p
          style={{
            opacity: subOp,
            marginTop: 14,
            fontSize: isMobile ? 13 : 'clamp(13px,1.4vw,15px)',
            fontFamily: '"Manrope", system-ui, sans-serif',
            fontWeight: 400,
            letterSpacing: '0.06em',
            lineHeight: 1.75,
            color: CREAM_DIM,
            whiteSpace: 'pre-line',
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
  const trackRef  = useRef<HTMLDivElement>(null);
  const rm        = useReducedMotion();
  const isMobile  = useMobile();
  const [pageH, setPageH]         = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef, offset: ['start start', 'end end'],
  });

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const fracs = SECTIONS.map(s => s.yFrac);
    let best = 0, bestDist = Infinity;
    fracs.forEach((f, i) => {
      const d = Math.abs(v - f);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActiveIdx(best);
  });

  useEffect(() => {
    const update = () => {
      if (trackRef.current) setPageH(trackRef.current.scrollHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const scrollToSection = useCallback((idx: number) => {
    if (!trackRef.current) return;
    const H    = trackRef.current.scrollHeight;
    const winH = window.innerHeight;
    const top  = trackRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + SECTIONS[idx].yFrac * (H - winH), behavior: 'smooth' });
  }, []);

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        height: `${PAGE_VH}vh`,
        background: BG_DARK,
        overflowX: 'clip',
      }}
    >
      {/* Grain */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E")`,
      }} />

      {/* Winding line */}
      <WindingLine
        containerRef={trackRef}
        scrollYProgress={scrollYProgress}
        rm={rm}
        isMobile={isMobile}
      />

      {/* Sections */}
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

      {/* Sticky top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'clamp(14px,2.5vw,24px) clamp(16px,3vw,36px)',
        background: 'linear-gradient(to bottom, rgba(10,14,8,0.72) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(20,30,14,0.6)',
            border: '1px solid rgba(212,168,67,0.35)',
            borderRadius: 999, padding: '10px 20px',
            color: 'rgba(245,242,232,0.88)',
            fontSize: 13, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            pointerEvents: 'auto',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = 'rgba(212,168,67,0.7)';
            b.style.boxShadow   = '0 0 20px rgba(212,168,67,0.22)';
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.borderColor = 'rgba(212,168,67,0.35)';
            b.style.boxShadow   = 'none';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </button>

        <div style={{
          width: 'clamp(44px,6vw,60px)', height: 'clamp(44px,6vw,60px)',
          borderRadius: '50%', background: '#596B3D',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(89,107,61,0.4)',
          pointerEvents: 'auto',
        }}>
          <img src={imageAssets.logo} alt="Oliva"
               style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
        </div>

        <div style={{ width: 'clamp(80px,10vw,120px)' }} />
      </div>

      {/* Scroll hint */}
      <motion.div style={{
        position: 'fixed', bottom: 36, left: '50%', x: '-50%',
        zIndex: 40, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
        pointerEvents: 'none', opacity: scrollHintOpacity,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: CREAM_DIM, fontFamily: '"Manrope", sans-serif',
        }}>Scroll</span>
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

      {/* Nav dots */}
      <NavDots activeIdx={activeIdx} onDotClick={scrollToSection} />
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
        position: 'fixed', right: 'clamp(16px,3vw,32px)', top: '50%',
        transform: 'translateY(-50%)', zIndex: 50,
        display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-end',
      }}
    >
      {SECTIONS.map((s, i) => {
        const isActive = i === activeIdx, isHov = i === hovered;
        return (
          <button
            key={s.id}
            onClick={() => onDotClick(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`Go to: ${s.title}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10,
                     background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <motion.span
              animate={{ opacity: isActive || isHov ? 1 : 0, x: isActive || isHov ? 0 : 8 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: isActive ? GOLD : CREAM_DIM, fontFamily: '"Manrope", sans-serif',
                whiteSpace: 'nowrap', fontWeight: isActive ? 700 : 500,
              }}
            >
              {s.title}
            </motion.span>
            <motion.div
              animate={{
                width: isActive ? 26 : 6,
                backgroundColor: isActive ? GOLD
                  : isHov ? 'rgba(245,242,232,0.5)' : 'rgba(245,242,232,0.22)',
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
