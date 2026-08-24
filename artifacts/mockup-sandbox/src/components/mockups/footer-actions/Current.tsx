import './_group.css';

function InstagramIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Current() {
  return (
    <section className="footer-actions-demo">
      <div className="footer-actions-demo__panel">
        <p className="footer-actions-demo__eyebrow">Existing component</p>
        <h1 className="footer-actions-demo__title">Footer actions today</h1>
        <p className="footer-actions-demo__copy">The current SiteFooter uses a vertical quick-link list and a separate circular Instagram control.</p>
        <div className="footer-actions-current__grid">
          <div>
            <h2 className="footer-actions-current__heading">Quick Links</h2>
            <div className="footer-actions-current__list">
              <button className="footer-actions-current__link" type="button">Home</button>
              <button className="footer-actions-current__link" type="button">Menu</button>
              <button className="footer-actions-current__link" type="button">Book a Court</button>
              <button className="footer-actions-current__link" type="button">Contact</button>
            </div>
          </div>
          <div>
            <h2 className="footer-actions-current__heading">Follow Us</h2>
            <a className="footer-actions-current__instagram" href="https://instagram.com/oliva.padel" aria-label="Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}