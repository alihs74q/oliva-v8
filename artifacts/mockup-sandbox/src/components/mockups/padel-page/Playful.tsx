import './_group.css';
import { ArrowLeft, ArrowRight, Check, CircleDollarSign, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';

const items = [
  { title: '1H Court', description: 'Full hour of play', price: '$20', lbpPrice: '1,800,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9vR3KMaQrDDBQVuX3Ksa5fIbkllRIY.png', tag: 'Most popular' },
  { title: '1.5H Court', description: 'Extended playtime', price: '$30', lbpPrice: '2,700,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bnWlzxcRfj4wXowKGA3LnfM1trFRSt.png', tag: 'Go longer' },
  { title: '1H Coaching', description: 'Professional lessons', price: '$30', lbpPrice: '2,700,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EmI7Im7lNY0MMRPuj1rn3rtLqw3ZsD.png', tag: 'Level up' },
  { title: 'Grip', description: 'Premium quality', price: '$5', lbpPrice: '450,000 LBP', image: 'https://images.pexels.com/photos/3808506/pexels-photo-3808506.jpeg?auto=compress&cs=tinysrgb&w=400', tag: 'Fresh gear' },
  { title: 'Ball Set', description: '3 professional balls', price: '$9.99', lbpPrice: '900,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tASZy37aAXZT8QHk1CUzw40vUE2xQy.png', tag: 'Game on' },
];

export function Playful() {
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [active, setActive] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', color: '#f5f2e8', background: 'linear-gradient(145deg,#10170b 0%,#1e2e16 62%,#334b25 100%)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'fixed', width: 320, height: 320, borderRadius: '50%', background: 'rgba(212,168,67,.16)', filter: 'blur(70px)', top: -110, right: -80, animation: 'oliveDrift 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 230, height: 230, borderRadius: '50%', background: 'rgba(89,107,61,.4)', filter: 'blur(65px)', bottom: -80, left: -40, animation: 'oliveDrift 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />
      <nav style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px clamp(18px,5vw,64px)' }}>
        <button style={{ display: 'flex', gap: 8, alignItems: 'center', border: '1px solid rgba(245,242,232,.18)', background: 'rgba(245,242,232,.08)', color: '#f5f2e8', borderRadius: 999, padding: '11px 17px', cursor: 'pointer', fontWeight: 800, letterSpacing: '.06em', fontSize: 12 }}><ArrowLeft size={16} /> Back to menu</button>
        <button onClick={() => setCurrency(currency === 'USD' ? 'LBP' : 'USD')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid rgba(212,168,67,.5)', background: 'rgba(212,168,67,.14)', color: '#f5f2e8', borderRadius: 999, padding: '10px 14px', cursor: 'pointer', fontWeight: 800, fontSize: 11 }}><CircleDollarSign size={15} color="#d4a843" /> {currency}</button>
      </nav>
      <main className="padel-preview-scroll" style={{ position: 'relative', zIndex: 1, height: 'calc(100vh - 78px)', overflowY: 'auto', padding: '0 clamp(18px,5vw,64px) 70px' }}>
        <section style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(290px,.8fr)', gap: 'clamp(24px,5vw,70px)', alignItems: 'center', padding: '20px 0 42px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d4a843', background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.28)', padding: '8px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}><Trophy size={14} /> COURT &amp; COACHING</div>
            <h1 style={{ margin: '22px 0 12px', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(60px,10vw,122px)', lineHeight: '.85', letterSpacing: '-.06em', color: '#f5f2e8' }}>Padel<span style={{ color: '#d4a843' }}>.</span></h1>
            <p style={{ maxWidth: 430, margin: 0, color: 'rgba(245,242,232,.68)', fontSize: 17, lineHeight: 1.65 }}>Pick your pace, bring your people, and make an afternoon of it.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 25 }}>
              {['Book a court', 'Find your flow', 'Play together'].map((text, i) => <span key={text} style={{ color: i === 0 ? '#10170b' : '#d9e2c8', background: i === 0 ? '#d4a843' : 'rgba(245,242,232,.08)', border: '1px solid rgba(245,242,232,.14)', padding: '9px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{text}</span>)}
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 300 }}>
            <div style={{ position: 'absolute', inset: '5% 0 0 5%', borderRadius: 30, background: 'rgba(245,242,232,.09)', transform: 'rotate(5deg)' }} />
            <div style={{ position: 'relative', height: 330, borderRadius: 30, overflow: 'hidden', border: '1px solid rgba(212,168,67,.46)', boxShadow: '0 22px 65px rgba(0,0,0,.28)', transform: 'rotate(-3deg)' }}>
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ICoaEDFS2acvkeYqAp1z1uT2HyEtlp.png" alt="Oliva Padel Court" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(16,23,11,.82))' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}><div><strong style={{ display: 'block', fontSize: 22 }}>Your next rally</strong><span style={{ color: 'rgba(245,242,232,.72)', fontSize: 12 }}>starts at Oliva</span></div><div style={{ animation: 'floatBall 3.2s ease-in-out infinite', fontSize: 42 }}>●</div></div>
            </div>
          </div>
        </section>
        <section style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}><div><p style={{ margin: 0, color: '#d4a843', fontSize: 11, fontWeight: 900, letterSpacing: '.18em' }}>CHOOSE YOUR PLAY</p><h2 style={{ margin: '7px 0 0', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(30px,4vw,46px)' }}>Make it a good one.</h2></div><span style={{ color: 'rgba(245,242,232,.56)', fontSize: 12 }}>Tap a card to highlight</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(235px,1fr))', gap: 16 }}>
            {items.map((item, idx) => {
              const isActive = idx === active;
              return <article key={item.title} onClick={() => setActive(idx)} onMouseDown={() => setPressed(item.title)} onMouseUp={() => setPressed(null)} onMouseLeave={() => setPressed(null)} style={{ position: 'relative', minHeight: 280, padding: 14, borderRadius: 24, overflow: 'hidden', cursor: 'pointer', background: isActive ? 'linear-gradient(145deg,#71864d,#596b3d)' : 'rgba(245,242,232,.08)', border: `1px solid ${isActive ? 'rgba(212,168,67,.82)' : 'rgba(245,242,232,.15)'}`, boxShadow: isActive ? '0 18px 45px rgba(0,0,0,.25), 0 0 0 4px rgba(212,168,67,.08)' : '0 12px 28px rgba(0,0,0,.1)', transform: pressed === item.title ? 'scale(.975)' : isActive ? 'translateY(-5px)' : 'translateY(0)', transition: 'transform .32s cubic-bezier(.34,1.56,.64,1), box-shadow .32s ease, border-color .32s ease' }}>
                <div style={{ height: 145, borderRadius: 17, overflow: 'hidden', position: 'relative' }}><img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease' }} /><span style={{ position: 'absolute', top: 10, left: 10, background: '#d4a843', color: '#10170b', padding: '6px 9px', borderRadius: 999, fontSize: 10, fontWeight: 900 }}>{item.tag}</span></div>
                <div style={{ padding: '15px 4px 2px' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}><h3 style={{ margin: 0, fontSize: 21, letterSpacing: '-.03em' }}>{item.title}</h3><span style={{ color: '#d4a843', fontSize: 23, fontWeight: 900, whiteSpace: 'nowrap' }}>{currency === 'USD' ? item.price : item.lbpPrice}</span></div><p style={{ margin: '7px 0 15px', color: 'rgba(245,242,232,.66)', fontSize: 13 }}>{item.description}</p><div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isActive ? '#f5f2e8' : '#d4a843', fontSize: 11, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>{isActive ? <><Check size={14} /> Ready to play</> : <>Pick this one <ArrowRight size={14} /></>}</div></div>
              </article>;
            })}
          </div>
        </section>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 34, color: 'rgba(245,242,232,.44)', fontSize: 12 }}><Sparkles size={14} color="#d4a843" /> Good games, good coffee, good company.</div>
      </main>
    </div>
  );
}