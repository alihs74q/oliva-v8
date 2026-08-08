import { useState, useEffect } from 'react';
import {
  apiGetSections,
  apiUpdateSubcategory,
  apiDeleteSubcategory,
  apiRestoreSubcategory,
  apiDuplicateSubcategory,
  apiUpdateProduct,
  apiDeleteProduct,
  apiRestoreProduct,
  apiDuplicateProduct,
  apiCreateProduct,
  apiCreateSubcategory,
  apiReorderProducts,
  apiReorderSubcategories,
} from './useAdminApi';
import type { ApiSection, ApiSubcategory, ApiProduct } from '../hooks/usePublishedContent';
import ProductModal from './ProductModal';
import SubcategoryModal from './SubcategoryModal';
import ImagePickerInput from './ImagePickerInput';

const GOLD = '#D4A843';

interface Props {
  sectionSlug: string;
  onBack: () => void;
}

export default function SectionPage({ sectionSlug, onBack }: Props) {
  const [section, setSection] = useState<ApiSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [addProductSubId, setAddProductSubId] = useState<number | null>(null);
  const [editingSub, setEditingSub] = useState<ApiSubcategory | null>(null);
  const [addingSub, setAddingSub] = useState(false);

  const reload = async () => {
    const sections: ApiSection[] = await apiGetSections();
    const found = sections.find((s) => s.slug === sectionSlug);
    setSection(found ?? null);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [sectionSlug]);

  if (loading) return <AdminShell onBack={onBack} title="Loading…"><div style={{ color: 'rgba(245,242,232,0.4)', padding: 40 }}>Loading content…</div></AdminShell>;
  if (!section) return <AdminShell onBack={onBack} title="Not found"><div style={{ color: '#fca5a5', padding: 40 }}>Section not found.</div></AdminShell>;

  const subcategories = section.subcategories
    .filter((s) => showDeleted || !s.deleted)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const moveSubcategory = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= subcategories.length) return;
    const ids = subcategories.map((s) => s.id);
    [ids[idx], ids[target]] = [ids[target], ids[idx]];
    await apiReorderSubcategories(ids);
    await reload();
  };

  return (
    <AdminShell onBack={onBack} title={section.name}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(245,242,232,0.5)' }}>
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          Show deleted
        </label>
        <button
          onClick={() => setAddingSub(true)}
          style={primaryBtn}
        >
          + Add Subcategory
        </button>
      </div>

      {subcategories.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,242,232,0.3)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
          No subcategories yet. Click "Add Subcategory" to create one.
        </div>
      )}

      {subcategories.map((sub, subIdx) => (
        <SubcategoryCard
          key={sub.id}
          sub={sub}
          subIdx={subIdx}
          totalSubs={subcategories.length}
          showDeleted={showDeleted}
          onEditSub={() => setEditingSub(sub)}
          onDeleteSub={async () => { await apiDeleteSubcategory(sub.id); await reload(); }}
          onRestoreSub={async () => { await apiRestoreSubcategory(sub.id); await reload(); }}
          onMoveUp={() => moveSubcategory(subIdx, -1)}
          onMoveDown={() => moveSubcategory(subIdx, 1)}
          onAddProduct={() => setAddProductSubId(sub.id)}
          onEditProduct={(p) => setEditingProduct(p)}
          onDeleteProduct={async (p) => { await apiDeleteProduct(p.id); await reload(); }}
          onRestoreProduct={async (p) => { await apiRestoreProduct(p.id); await reload(); }}
          onDuplicateProduct={async (p) => { await apiDuplicateProduct(p.id); await reload(); }}
          onDuplicateSub={async () => { await apiDuplicateSubcategory(sub.id); await reload(); }}
          onToggleHidden={async (p) => { await apiUpdateProduct(p.id, { hidden: !p.hidden }); await reload(); }}
          onToggleSoldOut={async (p) => { await apiUpdateProduct(p.id, { soldOut: !p.soldOut }); await reload(); }}
          onReorderProducts={async (ids) => { await apiReorderProducts(ids); await reload(); }}
        />
      ))}

      {/* Modals */}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onSave={async (data) => { await apiUpdateProduct(editingProduct.id, data); setEditingProduct(null); await reload(); }}
          onClose={() => setEditingProduct(null)}
        />
      )}
      {addProductSubId !== null && (
        <ProductModal
          onSave={async (data) => { await apiCreateProduct(addProductSubId, data); setAddProductSubId(null); await reload(); }}
          onClose={() => setAddProductSubId(null)}
        />
      )}
      {editingSub && (
        <SubcategoryModal
          sub={editingSub}
          onSave={async (data) => { await apiUpdateSubcategory(editingSub.id, data); setEditingSub(null); await reload(); }}
          onClose={() => setEditingSub(null)}
        />
      )}
      {addingSub && (
        <SubcategoryModal
          onSave={async (data) => { await apiCreateSubcategory(sectionSlug, data); setAddingSub(false); await reload(); }}
          onClose={() => setAddingSub(false)}
        />
      )}
    </AdminShell>
  );
}

// ─── SubcategoryCard ──────────────────────────────────────────────────────────
function SubcategoryCard({
  sub, subIdx, totalSubs, showDeleted,
  onEditSub, onDeleteSub, onRestoreSub, onDuplicateSub, onMoveUp, onMoveDown,
  onAddProduct, onEditProduct, onDeleteProduct, onRestoreProduct, onDuplicateProduct,
  onToggleHidden, onToggleSoldOut, onReorderProducts,
}: {
  sub: ApiSubcategory;
  subIdx: number;
  totalSubs: number;
  showDeleted: boolean;
  onEditSub: () => void;
  onDeleteSub: () => void;
  onRestoreSub: () => void;
  onDuplicateSub: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddProduct: () => void;
  onEditProduct: (p: ApiProduct) => void;
  onDeleteProduct: (p: ApiProduct) => void;
  onRestoreProduct: (p: ApiProduct) => void;
  onDuplicateProduct: (p: ApiProduct) => void;
  onToggleHidden: (p: ApiProduct) => void;
  onToggleSoldOut: (p: ApiProduct) => void;
  onReorderProducts: (ids: number[]) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const products = sub.products.filter((p) => showDeleted || !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder);

  const moveProduct = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= products.length) return;
    const ids = products.map((p) => p.id);
    [ids[idx], ids[target]] = [ids[target], ids[idx]];
    onReorderProducts(ids);
  };

  return (
    <div style={{
      marginBottom: 20,
      border: `1px solid ${sub.deleted ? 'rgba(220,38,38,0.2)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      opacity: sub.deleted ? 0.6 : 1,
    }}>
      {/* Subcategory header */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'rgba(245,242,232,0.6)', padding: 0, flexShrink: 0 }}>
          {collapsed ? '▶' : '▼'}
        </button>
        {sub.imageUrl && <img src={sub.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f5f2e8' }}>{sub.name}</span>
            {sub.hidden && <span style={badge('#6b7280')}>Hidden</span>}
            {sub.deleted && <span style={badge('#dc2626')}>Deleted</span>}
          </div>
          <span style={{ fontSize: 12, color: 'rgba(245,242,232,0.4)' }}>{products.length} products</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {!sub.deleted && <button onClick={onEditSub} style={ghostBtnSm}>Edit</button>}
          {!sub.deleted && <button onClick={onDuplicateSub} style={ghostBtnSm}>Copy</button>}
          {sub.deleted
            ? <button onClick={onRestoreSub} style={{ ...ghostBtnSm, borderColor: '#86efac', color: '#86efac' }}>Restore</button>
            : <button onClick={onDeleteSub} style={{ ...ghostBtnSm, borderColor: 'rgba(220,38,38,0.4)', color: '#fca5a5' }}>Delete</button>
          }
          {!sub.deleted && <button onClick={onAddProduct} style={{ ...ghostBtnSm, borderColor: 'rgba(212,168,67,0.4)', color: GOLD }}>+ Product</button>}
        </div>
      </div>

      {/* Products table */}
      {!collapsed && (
        <div style={{ overflowX: 'auto' }}>
          {products.length === 0 ? (
            <div style={{ padding: '20px 16px', color: 'rgba(245,242,232,0.3)', fontSize: 13 }}>No products.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Image', 'Name', 'LBP', 'USD', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'rgba(245,242,232,0.4)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: p.deleted ? 0.5 : 1 }}>
                    <td style={{ padding: '8px 12px' }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📷</div>
                      }
                    </td>
                    <td style={{ padding: '8px 12px', color: '#f5f2e8', fontWeight: 600, maxWidth: 200 }}>
                      {p.name}
                      {p.deleted && <span style={{ ...badge('#dc2626'), marginLeft: 6 }}>Deleted</span>}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'rgba(245,242,232,0.6)', whiteSpace: 'nowrap' }}>
                      {p.priceLbp.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 12px', color: GOLD, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {p.priceUsd}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.hidden && <span style={badge('#6b7280')}>Hidden</span>}
                        {p.soldOut && <span style={badge('#d97706')}>Sold out</span>}
                        {!p.hidden && !p.soldOut && <span style={badge('#16a34a')}>Active</span>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                        {!p.deleted && <>
                          <button onClick={() => onEditProduct(p)} style={actionBtn}>Edit</button>
                          <button onClick={() => onToggleHidden(p)} style={actionBtn}>{p.hidden ? 'Show' : 'Hide'}</button>
                          <button onClick={() => onToggleSoldOut(p)} style={actionBtn}>{p.soldOut ? 'In Stock' : 'Sold Out'}</button>
                          <button onClick={() => onDuplicateProduct(p)} style={actionBtn}>Copy</button>
                          <button onClick={() => onDeleteProduct(p)} style={{ ...actionBtn, color: '#fca5a5' }}>Del</button>
                        </>}
                        {p.deleted && <button onClick={() => onRestoreProduct(p)} style={{ ...actionBtn, color: '#86efac' }}>Restore</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AdminShell ───────────────────────────────────────────────────────────────
function AdminShell({ children, onBack, title }: { children: React.ReactNode; onBack: () => void; title: string }) {
  return (
    <div style={{ minHeight: '100svh', background: '#0d1509', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(212,168,67,0.15)',
        padding: '0 clamp(16px,4vw,32px)',
        height: 56, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: 0 }}>
          ← Back
        </button>
        <span style={{ color: 'rgba(245,242,232,0.3)' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f5f2e8' }}>{title}</h1>
      </header>
      <main style={{ flex: 1, padding: 'clamp(16px,3vw,32px) clamp(16px,4vw,40px)', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const primaryBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: GOLD,
  color: '#1a1a0a',
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};
const ghostBtnSm: React.CSSProperties = {
  padding: '5px 10px',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  color: 'rgba(245,242,232,0.6)',
  fontSize: 12,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
const actionBtn: React.CSSProperties = {
  padding: '4px 8px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 5,
  color: 'rgba(245,242,232,0.7)',
  fontSize: 11,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
function badge(color: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '2px 6px',
    background: `${color}33`,
    border: `1px solid ${color}66`,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    color: color,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  } as React.CSSProperties;
}
