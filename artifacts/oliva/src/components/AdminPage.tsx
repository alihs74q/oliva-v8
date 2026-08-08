import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Eye, LogOut, Plus, Save, Send, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import type { Subcategory, SubcategoryDrink } from '../data/subcategories';
import { subcategoryData } from '../data/subcategories';
import { API_BASE } from '../config/api';

type MenuSection = {
  id: string;
  name: string;
  subtitle: string;
  themeColor: string;
  accentColor: string;
  subcategories: Subcategory[];
};

type AdminDocument = {
  documentKey: string;
  draft: { sections: MenuSection[] };
  revision: number;
};

type AdminRelease = { id: number; message: string; createdAt: string };

const API = API_BASE;
const initialSections: MenuSection[] = Object.entries(subcategoryData).map(([id, subs]) => ({
  id,
  name: id.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '),
  subtitle: 'Freshly made at Oliva',
  themeColor: '#596B3D',
  accentColor: '#D4A843',
  subcategories: subs,
}));

function makeDraft(): { sections: MenuSection[] } {
  return { sections: structuredClone(initialSections) };
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%', border: '1px solid rgba(212,168,67,.28)', borderRadius: 12,
    background: 'rgba(255,255,255,.06)', color: '#f5f2e8', padding: '12px 13px',
    outline: 'none', fontSize: 14,
  };
}

function labelStyle(): React.CSSProperties {
  return { display: 'grid', gap: 7, color: 'rgba(245,242,232,.62)', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' };
}

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentDocument, setContentDocument] = useState<AdminDocument | null>(null);
  const [releases, setReleases] = useState<AdminRelease[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const sections = contentDocument?.draft.sections ?? [];
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];
  const selectedSubcategory = selectedSection?.subcategories.find((subcategory) => subcategory.id === selectedSubcategoryId) ?? selectedSection?.subcategories[0];
  const selectedProduct = selectedProductIndex === null ? null : selectedSubcategory?.drinks[selectedProductIndex] ?? null;

  useEffect(() => {
    window.document.title = 'Admin · Oliva Café';
    const meta = window.document.querySelector('meta[name="robots"]') ?? window.document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    window.document.head.appendChild(meta);
    void loadSession();
  }, []);

  async function loadSession() {
    setLoading(true);
    try {
      const config = await fetch(`${API}/admin/config`).then((response) => response.json());
      setConfigured(Boolean(config.configured));
      const session = await fetch(`${API}/admin/auth/me`, { credentials: 'include' });
      if (session.ok) {
        const data = await session.json();
        setAdminEmail(data.admin.email);
        await loadContent();
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadContent() {
    const response = await fetch(`${API}/admin/content`, { credentials: 'include' });
    if (!response.ok) return;
    const data = await response.json();
    const loaded = data.documents.find((item: AdminDocument) => item.documentKey === 'menu:sections') as AdminDocument | undefined;
    const next = loaded ?? { documentKey: 'menu:sections', draft: makeDraft(), revision: 1 };
    setContentDocument(next);
    setReleases(data.releases ?? []);
    setSelectedSectionId(next.draft.sections[0]?.id ?? '');
    setSelectedSubcategoryId(next.draft.sections[0]?.subcategories[0]?.id ?? '');
  }

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError('');
    setBusy(true);
    const response = await fetch(`${API}/admin/auth/login`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setLoginError(data.error ?? 'Unable to sign in with those details');
      return;
    }
    setAdminEmail(data.admin.email);
    setPassword('');
    await loadContent();
  }

  async function logout() {
    await fetch(`${API}/admin/auth/logout`, { method: 'POST', credentials: 'include' });
    setAdminEmail(null);
    setContentDocument(null);
  }

  function updateDraft(mutator: (draft: { sections: MenuSection[] }) => void) {
    if (!contentDocument) return;
    const draft = structuredClone(contentDocument.draft);
    mutator(draft);
    setContentDocument({ ...contentDocument, draft });
  }

  function addProduct() {
    if (!selectedSection || !selectedSubcategory) return;
    const product: SubcategoryDrink = { name: 'New product', description: 'Add a short description.', price: '$0', lbpPrice: '0 LBP', image: null, recipe: '' };
    updateDraft((draft) => {
      const section = draft.sections.find((item) => item.id === selectedSection.id);
      const subcategory = section?.subcategories.find((item) => item.id === selectedSubcategory.id);
      subcategory?.drinks.push(product);
    });
    setSelectedProductIndex(selectedSubcategory.drinks.length);
    setNotice('New product added to the draft. Fill in its details and save.');
  }

  function removeProduct() {
    if (!selectedSection || !selectedSubcategory || selectedProductIndex === null) return;
    updateDraft((draft) => {
      const subcategory = draft.sections.find((item) => item.id === selectedSection.id)?.subcategories.find((item) => item.id === selectedSubcategory.id);
      subcategory?.drinks.splice(selectedProductIndex, 1);
    });
    setSelectedProductIndex(null);
  }

  function updateProduct(field: keyof SubcategoryDrink, value: string) {
    if (!selectedSection || !selectedSubcategory || selectedProductIndex === null) return;
    updateDraft((draft) => {
      const product = draft.sections.find((item) => item.id === selectedSection.id)?.subcategories.find((item) => item.id === selectedSubcategory.id)?.drinks[selectedProductIndex];
      if (product) product[field] = value as never;
    });
  }

  async function saveDraft() {
    if (!contentDocument) return;
    setBusy(true);
    const response = await fetch(`${API}/admin/content/menu%3Asections`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision: contentDocument.revision, draft: contentDocument.draft }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setNotice(data.error ?? 'Could not save the draft');
      if (response.status === 409) await loadContent();
      return;
    }
    setContentDocument(data.document);
    setNotice('Draft saved. Visitors will not see it until you publish.');
  }

  async function publish() {
    setBusy(true);
    const response = await fetch(`${API}/admin/publish`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Menu update published' }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    setNotice(response.ok ? `Release ${data.release.id} is now live.` : (data.error ?? 'Could not publish'));
    if (response.ok) await loadContent();
  }

  async function rollback(id: number) {
    setBusy(true);
    const response = await fetch(`${API}/admin/rollback/${id}`, { method: 'POST', credentials: 'include' });
    setBusy(false);
    setNotice(response.ok ? 'Previous release restored as a new live release.' : 'Could not roll back this release.');
    if (response.ok) await loadContent();
  }

  const usdPreview = useMemo(() => {
    const value = Number((selectedProduct?.lbpPrice ?? '').replace(/[^0-9]/g, ''));
    return Number.isFinite(value) && value > 0 ? `$${(value / 100000).toFixed(2)}` : '$0.00';
  }, [selectedProduct?.lbpPrice]);

  if (loading) return <div className="oliva-admin-loading">Loading your workspace…</div>;
  if (!adminEmail) {
    return (
      <main className="oliva-admin-login">
        <div className="oliva-admin-glow" />
        <form className="oliva-admin-login-card" onSubmit={submitLogin}>
          <div className="oliva-admin-mark"><ShieldCheck size={27} /></div>
          <p className="oliva-admin-kicker">Oliva · Private workspace</p>
          <h1>Welcome back</h1>
          <p className="oliva-admin-muted">Manage your menu and publish changes with the same care as the café.</p>
          {!configured && <div className="oliva-admin-warning">Admin access is not configured yet. Set exactly three server-side admin emails before signing in.</div>}
          <label style={labelStyle()}>Email<input style={inputStyle()} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label style={labelStyle()}>Password<input style={inputStyle()} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {loginError && <div className="oliva-admin-error">{loginError}</div>}
          <button className="oliva-admin-primary" disabled={busy || !configured}>{busy ? 'Signing in…' : 'Sign in securely'}<ChevronRight size={17} /></button>
          <button type="button" className="oliva-admin-back" onClick={() => { window.location.hash = '/'; }}><ArrowLeft size={15} /> Back to public site</button>
        </form>
      </main>
    );
  }

  return (
    <main className="oliva-admin">
      <aside className="oliva-admin-sidebar">
        <button className="oliva-admin-brand" onClick={() => { window.location.hash = '/'; }}><span className="oliva-admin-brand-dot">O</span><span><strong>Oliva</strong><small>Content studio</small></span></button>
        <div className="oliva-admin-sidebar-label">Menu sections</div>
        {sections.map((section) => <button key={section.id} className={`oliva-admin-nav ${selectedSection?.id === section.id ? 'active' : ''}`} onClick={() => { setSelectedSectionId(section.id); setSelectedSubcategoryId(section.subcategories[0]?.id ?? ''); setSelectedProductIndex(null); }}><span>{section.name}</span><ChevronRight size={15} /></button>)}
        <div className="oliva-admin-sidebar-label">Content</div>
        <button className="oliva-admin-nav" onClick={() => setNotice('Our Place editing is the next content area to connect.')}>Our Place <span className="oliva-admin-soon">Soon</span></button>
        <button className="oliva-admin-nav" onClick={() => setNotice('Site settings are reserved for a later release.')}>Site settings <span className="oliva-admin-soon">Soon</span></button>
        <div className="oliva-admin-sidebar-bottom"><button className="oliva-admin-nav" onClick={() => void logout()}><LogOut size={15} /> Sign out</button><a href="#/" className="oliva-admin-public"><Eye size={15} /> View public site</a></div>
      </aside>
      <section className="oliva-admin-content">
        <header className="oliva-admin-header"><div><p className="oliva-admin-kicker">Content studio</p><h1>{selectedSection?.name ?? 'Menu'}</h1><p className="oliva-admin-muted">Changes are saved as drafts first. Publish when everything looks right.</p></div><div className="oliva-admin-actions"><span className="oliva-admin-user">{adminEmail}</span><button className="oliva-admin-secondary" onClick={() => void saveDraft()} disabled={busy}><Save size={16} /> Save draft</button><button className="oliva-admin-primary compact" onClick={() => void publish()} disabled={busy}><Send size={16} /> Publish</button></div></header>
        {notice && <div className="oliva-admin-notice">{notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
        <div className="oliva-admin-grid">
          <section className="oliva-admin-panel">
            <div className="oliva-admin-panel-heading"><div><p className="oliva-admin-kicker">Structure</p><h2>Subcategories</h2></div><button className="oliva-admin-icon-button" onClick={() => setNotice('Adding new subcategories will be enabled with the section editor.')}><Plus size={17} /></button></div>
            <div className="oliva-admin-subcategories">{selectedSection?.subcategories.map((subcategory) => <button key={subcategory.id} className={`oliva-admin-subcategory ${selectedSubcategory?.id === subcategory.id ? 'selected' : ''}`} onClick={() => { setSelectedSubcategoryId(subcategory.id); setSelectedProductIndex(null); }}><span><strong>{subcategory.name}</strong><small>{subcategory.drinks.length} products</small></span><ChevronRight size={16} /></button>)}</div>
          </section>
          <section className="oliva-admin-panel products-panel">
            <div className="oliva-admin-panel-heading"><div><p className="oliva-admin-kicker">{selectedSubcategory?.description ?? 'Product catalogue'}</p><h2>{selectedSubcategory?.name ?? 'Products'}</h2></div><button className="oliva-admin-secondary compact" onClick={addProduct}><Plus size={16} /> Add product</button></div>
            <div className="oliva-admin-product-list">{selectedSubcategory?.drinks.map((product, index) => <button key={`${product.name}-${index}`} className={`oliva-admin-product-row ${selectedProductIndex === index ? 'selected' : ''}`} onClick={() => setSelectedProductIndex(index)}><span className="oliva-admin-product-thumb">{product.image ? <img src={product.image} alt="" /> : <span>O</span>}</span><span className="oliva-admin-product-copy"><strong>{product.name}</strong><small>{product.description}</small></span><span className="oliva-admin-product-price">{product.lbpPrice}</span><ChevronRight size={15} /></button>)}</div>
          </section>
          <section className="oliva-admin-panel editor-panel">
            <div className="oliva-admin-panel-heading"><div><p className="oliva-admin-kicker">Reusable product template</p><h2>{selectedProduct ? 'Edit product' : 'Choose a product'}</h2></div>{selectedProduct && <button className="oliva-admin-danger" onClick={removeProduct}><Trash2 size={15} /> Delete draft</button>}</div>
            {selectedProduct ? <div className="oliva-admin-form">
              <label style={labelStyle()}>Product name<input style={inputStyle()} value={selectedProduct.name} onChange={(event) => updateProduct('name', event.target.value)} /></label>
              <label style={labelStyle()}>Short description<textarea style={inputStyle()} rows={3} value={selectedProduct.description} onChange={(event) => updateProduct('description', event.target.value)} /></label>
              <div className="oliva-admin-form-row"><label style={labelStyle()}>LBP price<input style={inputStyle()} value={selectedProduct.lbpPrice} onChange={(event) => updateProduct('lbpPrice', event.target.value)} /></label><label style={labelStyle()}>USD preview<input style={{ ...inputStyle(), opacity: .55 }} readOnly value={usdPreview} /></label></div>
              <label style={labelStyle()}>Image URL<input style={inputStyle()} value={selectedProduct.image ?? ''} onChange={(event) => updateProduct('image', event.target.value)} placeholder="/images/products/..." /></label>
              <label style={labelStyle()}>Ingredients / recipe<textarea style={inputStyle()} rows={4} value={selectedProduct.recipe ?? ''} onChange={(event) => updateProduct('recipe', event.target.value)} /></label>
              <div className="oliva-admin-form-actions"><button className="oliva-admin-upload" onClick={() => setNotice('Image uploads will use App Storage after the media manager is connected.')}><Upload size={15} /> Upload image</button><span className="oliva-admin-template-note">This product uses the shared {selectedSection?.name} card design.</span></div>
            </div> : <div className="oliva-admin-empty"><p>Select a product to edit its content.</p><small>Your content is separate from the layout, so every new product automatically inherits this section’s design.</small></div>}
          </section>
        </div>
        <section className="oliva-admin-panel releases-panel"><div className="oliva-admin-panel-heading"><div><p className="oliva-admin-kicker">Safety net</p><h2>Release history</h2></div></div>{releases.length ? releases.map((release) => <div className="oliva-admin-release" key={release.id}><span><strong>Release {release.id}</strong><small>{release.message} · {new Date(release.createdAt).toLocaleString()}</small></span><button className="oliva-admin-secondary compact" onClick={() => void rollback(release.id)} disabled={busy}>Restore</button></div>) : <p className="oliva-admin-muted">No releases yet. Save a draft, then publish your first release.</p>}</section>
      </section>
    </main>
  );
}