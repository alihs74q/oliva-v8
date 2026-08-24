import './_glass-court.css';
import { ArrowLeft, ArrowRight, Check, Trophy } from 'lucide-react';
import { useState } from 'react';

const items = [
  { title: '1H Court', description: 'Full hour of play', price: '$20', lbpPrice: '1,800,000 LBP', tag: 'Most popular' },
  { title: '1.5H Court', description: 'Extended playtime', price: '$30', lbpPrice: '2,700,000 LBP', tag: 'Go longer' },
  { title: '1H Coaching', description: 'Professional lessons', price: '$30', lbpPrice: '2,700,000 LBP', tag: 'Level up' },
  { title: 'Grip', description: 'Premium quality', price: '$5', lbpPrice: '450,000 LBP', tag: 'Fresh gear' },
  { title: 'Ball Set', description: '3 professional balls', price: '$9.99', lbpPrice: '900,000 LBP', tag: 'Game on' },
];

export function GlassCourt() {
  const [currency, setCurrency] = useState<'USD' | 'LBP'>('USD');
  const [selected, setSelected] = useState<number | null>(null);
  const selectedItem = selected === null ? null : items[selected];
  const isBookable = selectedItem && selectedItem.title !== 'Grip' && selectedItem.title !== 'Ball Set';
  const openBooking = () => {
    if (!selectedItem) return;
    window.open(`https://wa.me/96170647506?text=${encodeURIComponent(`mar7aba shou hiye law2at lfine 2e7joz fiha lyom - ${selectedItem.title}`)}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="glass-court">
      <div className="glass-court__sky" /><div className="glass-court__grain" />
      <div className="glass-court__orb glass-court__orb--a" /><div className="glass-court__orb glass-court__orb--b" />
      <nav className="glass-court__nav">
        <div className="glass-court__brand"><span className="glass-court__brand-mark">O</span> OLIVA / PADEL</div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button className="glass-court__back" onClick={() => window.history.back()}><ArrowLeft size={15} /> <span>Back to menu</span></button>
          <button className="glass-court__currency" onClick={() => setCurrency(currency === 'USD' ? 'LBP' : 'USD')} aria-label="Change currency">{currency}</button>
        </div>
      </nav>
      <main className="glass-court__main">
        <section className="glass-court__hero">
          <div>
            <div className="glass-court__eyebrow"><Trophy size={14} /> Court &amp; coaching</div>
            <h1>Padel<em>.</em></h1>
            <p className="glass-court__intro">Pick your pace, bring your people, and make an afternoon of it. Your next rally starts at Oliva.</p>
            <div className="glass-court__pills"><span className="glass-court__pill glass-court__pill--active">Book a court</span><span className="glass-court__pill">Find your flow</span><span className="glass-court__pill">Play together</span></div>
          </div>
          <div className="glass-court__scene" aria-label="Lit glass padel court illustration">
            <div className="glass-court__scene-glow" />
            <div className="glass-court__court"><span className="glass-court__court-label">OLIVA / COURT 01 / DUSK</span><span className="glass-court__light" /><span className="glass-court__ball" /><span className="glass-court__net" /><div className="glass-court__caption">The evening is yours<small>good games, good coffee</small></div></div>
          </div>
        </section>
        <section className="glass-court__offers" aria-labelledby="glass-offers-title">
          <div className="glass-court__section-head"><div><p className="glass-court__section-kicker">Choose your play</p><h2 id="glass-offers-title">Make it a good one.</h2></div><span className="glass-court__hint">Tap an offer to reserve</span></div>
          <div className="glass-court__grid">
            {items.map((item, index) => {
              const active = selected === index;
              return <button type="button" className={`glass-court__card${active ? ' is-selected' : ''}`} key={item.title} onClick={() => setSelected(index)} aria-pressed={active}>
                <span className="glass-court__card-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.description}</p><strong className="glass-court__card-price">{currency === 'USD' ? item.price : item.lbpPrice}</strong><span className="glass-court__card-action">{active ? <><Check size={13} /> Ready</> : <>Select <ArrowRight size={13} /></>}</span>
              </button>;
            })}
          </div>
        </section>
        <div className="glass-court__footer">Good games, good coffee, good company.</div>
      </main>
      {isBookable && selectedItem && <div className="glass-court__sheet" role="dialog" aria-label={`Book ${selectedItem.title}`}><div className="glass-court__sheet-copy"><small>Ready to play</small><strong>{selectedItem.title}</strong><span>{currency === 'USD' ? selectedItem.price : selectedItem.lbpPrice}</span></div><div><button className="glass-court__book" onClick={openBooking}>Accept &amp; book now <ArrowRight size={14} /></button><button className="glass-court__close" onClick={() => setSelected(null)} aria-label="Close booking">×</button></div></div>}
    </div>
  );
}

export default GlassCourt;