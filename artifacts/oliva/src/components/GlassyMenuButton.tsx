import { motion } from 'framer-motion';

export default function GlassyMenuButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="afloat"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg,#1b5e20,#2e7d32,#0f3d13)',
        color: '#fff',
        border: '3px solid rgba(201,229,155,0.7)',
        borderRadius: '60px',
        padding: '36px 80px',
        fontSize: '42px',
        fontWeight: 900,
        fontFamily: '"Arial Black", "Helvetica", sans-serif',
        letterSpacing: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 15px 50px rgba(15,61,19,.8), inset 0 1px 0 rgba(201,229,155,0.3)',
        textShadow: '0 2px 8px rgba(0,0,0,.5), 0 0 20px rgba(201,229,155,0.4)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '18px',
        '--gc': 'rgba(20,83,32,.75)',
        textTransform: 'uppercase',
      } as React.CSSProperties}
      whileHover={{
        scale: 1.12,
        rotate: 1,
        y: -6,
        boxShadow: '0 20px 60px rgba(76,102,35,.9), inset 0 1px 0 rgba(201,229,155,0.4)',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
    >
      <span className="shine-bar" />
      <span className="ej" style={{ fontSize: '2rem', lineHeight: 1 }}>🍵</span>
      <span style={{ position: 'relative', zIndex: 3, fontStyle: 'italic' }}>view menu</span>
    </motion.button>
  );
}
