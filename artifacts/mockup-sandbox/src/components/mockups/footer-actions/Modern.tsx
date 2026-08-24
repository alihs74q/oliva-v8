import { useState } from 'react';
import './_group.css';

function HomeIcon() {
  return <svg className="footer-actions-modern__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-6h6v6" /></svg>;
}

function MenuIcon() {
  return <svg className="footer-actions-modern__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M5 7h14M5 12h14M5 17h9" /></svg>;
}

function CourtIcon() {
  return <svg className="footer-actions-modern__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h10l3 4v10l-3 4H7l-3-4V7Z" /><path d="M8 8h8M8 16h8M12 5v14" /></svg>;
}

function InstagramIcon() {
  return <svg className="footer-actions-modern__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>;
}

export function Modern() {
  const [feedback, setFeedback] = useState('Choose a destination to continue.');

  return (
    <section className="footer-actions-demo">
      <div className="footer-actions-demo__panel">
        <p className="footer-actions-demo__eyebrow">Modern footer rail</p>
        <h1 className="footer-actions-demo__title">A clearer final step</h1>
        <p className="footer-actions-demo__copy">One cohesive navigation rail keeps Home, Menu, court booking, and Instagram easy to spot on desktop and mobile.</p>
        <nav className="footer-actions-modern__shell" aria-label="Footer navigation">
          <div className="footer-actions-modern__grid">
            <button className="footer-actions-modern__action" type="button" onClick={() => setFeedback('Home opens the Oliva homepage.')}>
              <HomeIcon /><span className="footer-actions-modern__label">Home</span>
            </button>
            <button className="footer-actions-modern__action" type="button" onClick={() => setFeedback('Menu opens the full Oliva menu.')}>
              <MenuIcon /><span className="footer-actions-modern__label">Menu</span>
            </button>
            <button className="footer-actions-modern__action footer-actions-modern__action--court" type="button" onClick={() => setFeedback('Book a Court opens the padel booking options.')}>
              <CourtIcon /><span className="footer-actions-modern__label">Book a Court</span>
            </button>
            <a className="footer-actions-modern__action" href="https://instagram.com/olivapadel" target="_blank" rel="noreferrer" onClick={() => setFeedback('Opening @olivapadel on Instagram.')}>
              <InstagramIcon /><span className="footer-actions-modern__label">Instagram</span>
            </a>
          </div>
        </nav>
        <p className="footer-actions-modern__hint" aria-live="polite">{feedback}</p>
      </div>
    </section>
  );
}