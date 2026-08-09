import './_group.css';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const items = [
  ['1H Court', 'Full hour of play', '$20', '1,800,000 LBP', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9vR3KMaQrDDBQVuX3Ksa5fIbkllRIY.png'],
  ['1.5H Court', 'Extended playtime', '$30', '2,700,000 LBP', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bnWlzxcRfj4wXowKGA3LnfM1trFRSt.png'],
  ['1H Coaching', 'Professional lessons', '$30', '2,700,000 LBP', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EmI7Im7lNY0MMRPuj1rn3rtLqw3ZsD.png'],
  ['Grip', 'Premium quality', '$5', '450,000 LBP', 'https://images.pexels.com/photos/3808506/pexels-photo-3808506.jpeg?auto=compress&cs=tinysrgb&w=400'],
  ['Ball Set', '3 professional balls', '$9.99', '900,000 LBP', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tASZy37aAXZT8QHk1CUzw40vUE2xQy.png'],
];

export function Current() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#003a4d,#006b8f 55%,#004d6b)', overflow: 'hidden' }}>
      <nav style={{ height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 28px' }}>
        <button style={{ color: '#f0f9fa', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 999, padding: '10px 20px', display: 'flex', gap: 8, alignItems: 'center' }}><ArrowLeft size={16} /> BACK</button>
        <span style={{ background: '#3c3b6e', padding: '8px 12px', borderRadius: 999, fontSize: 11 }}>USD 🇺🇸</span>
      </nav>
      <main className="padel-preview-scroll" style={{ height: 'calc(100vh - 68px)', overflowY: 'auto', padding: '0 28px 40px' }}>
        <div style={{ height: 280, borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ICoaEDFS2acvkeYqAp1z1uT2HyEtlp.png" alt="Oliva Padel Court" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ margin: 0, color: '#4F82C5', letterSpacing: '.15em', fontWeight: 700, fontSize: 13 }}>COURT &amp; COACHING</p>
          <h1 style={{ margin: '10px 0 0', fontSize: 56, lineHeight: 1, color: '#f0f9fa' }}>Padel</h1>
        </div>
        <div style={{ width: 180, height: 180, borderRadius: '50%', background: '#4F82C5', margin: '0 auto 30px', display: 'grid', placeItems: 'center' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 64, color: '#fff' }}>O</span>
        </div>
        <div style={{ maxWidth: 940, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 22 }}>
          {items.map(([title, description, price, , image]) => (
            <article key={title} style={{ minHeight: 170, padding: 25, display: 'flex', justifyContent: 'space-between', gap: 20, background: 'rgba(6,182,212,.08)', border: '2px solid rgba(79,130,197,.38)', borderRadius: 16 }}>
              <div><h2 style={{ margin: 0, color: '#4F82C5', fontSize: 27 }}>{title}</h2><p style={{ color: '#7dd3fc', lineHeight: 1.4 }}>{description}</p><strong style={{ color: '#4F82C5', fontSize: 32 }}>{price}</strong></div>
              <img src={image} alt={title} style={{ width: 112, borderRadius: 12, objectFit: 'cover' }} />
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}