/**
 * ContentContext.tsx
 * ──────────────────
 * Provides published CMS content to all public-site components.
 * The API is the source of truth for public content. Static data is used only
 * for component types and presentation defaults, never to replace a snapshot.
 *
 * Usage: wrap the app in <ContentProvider>, then use useContent() in any component.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { coldDrinks, type ColdDrink } from '../data/coldDrinks';
import { hotDrinks, type HotDrink } from '../data/hotDrinks';
import { desserts, type Dessert } from '../data/desserts';
import { shishaItems, type ShishaItem } from '../data/shisha';
import { subcategoryData, type Subcategory } from '../data/subcategories';
import type { ContentSnapshot, ApiSection, ApiProduct } from '../hooks/usePublishedContent';
import type { PromoGallerySlide } from '../components/PromoGallery';
import { getStaticCalories, getStaticNutrition } from '../data/nutrition';
import { getDefaultProductExtras } from '../data/menuExtras';
import { API_BASE } from '../config/api';
import { subscribeToPublishedContentChanges } from '../utils/contentRefresh';
import { readNutrition, visibleExtraCalories } from '../admin/nutritionStorage';
import { getImageForProduct } from '../utils/imageMatching';

// ─── Context shape ─────────────────────────────────────────────────────────────
export interface ContentContextValue {
  coldDrinks: ColdDrink[];
  hotDrinks: HotDrink[];
  desserts: Dessert[];
  shishaItems: ShishaItem[];
  subcategories: Record<string, Subcategory[]>;
  settings: Record<string, string>;
  sections: ApiSection[];
  promoGallery: PromoGallerySlide[];
  status: 'loading' | 'api' | 'error';
}

const ContentContext = createContext<ContentContextValue>({
  coldDrinks: [],
  hotDrinks: [],
  desserts: [],
  shishaItems: [],
  subcategories: {},
  settings: {},
  sections: [],
  promoGallery: [],
  status: 'loading',
});

// ─── Conversion helpers ────────────────────────────────────────────────────────
function formatLbp(n: number): string {
  return n === 0 ? '0 LBP' : n.toLocaleString('en-US') + ' LBP';
}

/** Derive a usable themeColor from a hex, darkened slightly for use as a tint */
function darkenHex(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `#${Math.round(r * 0.5).toString(16).padStart(2, '0')}${Math.round(g * 0.5).toString(16).padStart(2, '0')}${Math.round(b * 0.5).toString(16).padStart(2, '0')}`;
  } catch { return hex; }
}

function apiProductToColdDrink(p: ApiProduct, themeColor: string): ColdDrink {
  return {
    name: p.name,
    shortName: p.shortName || p.name.split(' ')[0].toUpperCase(),
    description: p.description,
    price: p.priceUsd,
    lbpPrice: formatLbp(p.priceLbp),
    image: p.imageUrl ?? getImageForProduct(p.name) ?? null,
    themeColor: darkenHex(themeColor),
    flavors: p.flavors ?? [],
  };
}

function apiProductToHotDrink(p: ApiProduct, themeColor: string): HotDrink {
  return {
    name: p.name,
    shortName: p.shortName || p.name.split(' ')[0].toUpperCase(),
    description: p.description,
    price: p.priceUsd,
    lbpPrice: formatLbp(p.priceLbp),
    image: p.imageUrl ?? getImageForProduct(p.name) ?? null,
    themeColor: darkenHex(themeColor),
    flavors: p.flavors ?? [],
  };
}

function apiProductToDessert(p: ApiProduct, themeColor: string): Dessert {
  return {
    name: p.name,
    shortName: p.shortName || p.name.split(' ')[0].toUpperCase(),
    description: p.description,
    price: p.priceUsd,
    lbpPrice: formatLbp(p.priceLbp),
    image: p.imageUrl ?? getImageForProduct(p.name) ?? null,
    themeColor: darkenHex(themeColor),
    flavors: p.flavors ?? [],
  };
}

function apiProductToShishaItem(p: ApiProduct, themeColor: string): ShishaItem {
  return {
    id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: p.name,
    shortName: p.shortName || p.name.split(' ')[0].toUpperCase(),
    description: p.description,
    price: p.priceUsd,
    lbpPrice: formatLbp(p.priceLbp),
    priceColor: '#D4A843',
    image: p.imageUrl ?? getImageForProduct(p.name) ?? null,
    themeColor: darkenHex(themeColor),
    flavors: p.flavors ?? [],
  };
}

function apiToSubcategoryData(sections: ApiSection[]): Record<string, Subcategory[]> {
  const result: Record<string, Subcategory[]> = {};
  for (const section of sections) {
    result[section.slug] = section.subcategories
      .filter((s) => !s.hidden && !s.deleted)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((sub) => ({
        id: sub.subcategoryId,
        name: sub.name,
        description: sub.description,
        themeColor: sub.themeColor,
        accentColor: sub.accentColor,
        image: sub.imageUrl ?? null,
        drinks: sub.products
          .filter((p) => !p.hidden && !p.deleted)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((p) => ({
            name: p.name,
            description: p.description,
            price: p.priceUsd,
            lbpPrice: formatLbp(p.priceLbp),
            image: p.imageUrl ?? getImageForProduct(p.name) ?? null,
            recipe: p.recipe || undefined,
            calories: p.calories ?? getStaticCalories(p.name),
            extraCalories: visibleExtraCalories(p.extraCalories),
            ...readNutrition(p, getStaticNutrition(p.name)),
             allergens: p.allergens ?? [],
             extras: p.extras ?? getDefaultProductExtras(p.name, sub.subcategoryId),
             priceLbp: p.priceLbp,
             soldOut: p.soldOut,
          })),
      } as Subcategory));
  }
  return result;
}

function snapshotToContextValue(snapshot: ContentSnapshot): Omit<ContentContextValue, 'status'> {
  const sections = snapshot.sections;

  const coldSection = sections.find((s) => s.slug === 'cold-drinks');
  const hotSection  = sections.find((s) => s.slug === 'hot-drinks');
  const dessertSection = sections.find((s) => s.slug === 'desserts');
  const shishaSection  = sections.find((s) => s.slug === 'shisha');

  const apiColdDrinks: ColdDrink[] = coldSection
    ? coldSection.subcategories.filter((s) => !s.hidden && !s.deleted)
        .flatMap((sub) => sub.products.filter((p) => !p.hidden && !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder).map((p) => apiProductToColdDrink(p, sub.themeColor)))
    : [];

  const apiHotDrinks: HotDrink[] = hotSection
    ? hotSection.subcategories.filter((s) => !s.hidden && !s.deleted)
        .flatMap((sub) => sub.products.filter((p) => !p.hidden && !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder).map((p) => apiProductToHotDrink(p, sub.themeColor)))
    : [];

  const apiDesserts: Dessert[] = dessertSection
    ? dessertSection.subcategories.filter((s) => !s.hidden && !s.deleted)
        .flatMap((sub) => sub.products.filter((p) => !p.hidden && !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder).map((p) => apiProductToDessert(p, sub.themeColor)))
    : [];

  const apiShishaItems: ShishaItem[] = shishaSection
    ? shishaSection.subcategories.filter((s) => !s.hidden && !s.deleted)
        .flatMap((sub) => sub.products.filter((p) => !p.hidden && !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder).map((p) => apiProductToShishaItem(p, sub.themeColor)))
    : [];

  let promoGallery: PromoGallerySlide[] = [];
  try {
    const parsed = JSON.parse(snapshot.settings?.menu_promo_gallery ?? '[]');
    if (Array.isArray(parsed)) {
      promoGallery = parsed.filter((slide): slide is PromoGallerySlide =>
        slide && typeof slide === 'object' && typeof slide.id === 'string' &&
        typeof slide.imageUrl === 'string' && typeof slide.alt === 'string',
      );
    }
  } catch {
    promoGallery = [];
  }

  return {
    coldDrinks: apiColdDrinks,
    hotDrinks: apiHotDrinks,
    desserts: apiDesserts,
    shishaItems: apiShishaItems,
    subcategories: apiToSubcategoryData(sections),
    settings: snapshot.settings ?? {},
    sections: sections.filter((section) => !section.hidden && !section.deleted).sort((a, b) => a.sortOrder - b.sortOrder),
    promoGallery,
  };
}

// ─── Provider ──────────────────────────────────────────────────────────────────
const API_URL = `${API_BASE}/public/content`;
const CONTENT_CACHE_KEY = 'oliva:published-content:v1';

const BUNDLED_SECTIONS: ApiSection[] = [
  { id: 0, slug: 'cold-drinks', name: 'Cold Drinks', subtitle: 'Chilled & Refreshing', sortOrder: 1, hidden: false, deleted: false, theme: {}, subcategories: [] },
  { id: 0, slug: 'hot-drinks', name: 'Hot Drinks', subtitle: 'Warm & Aromatic', sortOrder: 2, hidden: false, deleted: false, theme: {}, subcategories: [] },
  { id: 0, slug: 'desserts', name: 'Desserts', subtitle: 'Sweet Indulgence', sortOrder: 3, hidden: false, deleted: false, theme: {}, subcategories: [] },
  { id: 0, slug: 'shisha', name: 'Shisha', subtitle: 'Premium Flavors', sortOrder: 4, hidden: false, deleted: false, theme: {}, subcategories: [] },
  { id: 0, slug: 'sandwiches', name: 'Sandwiches', subtitle: 'Fresh & Delicious', sortOrder: 5, hidden: false, deleted: false, theme: {}, subcategories: [] },
  { id: 0, slug: 'yogurt', name: 'Yogurt', subtitle: 'Creamy & Refreshing', sortOrder: 6, hidden: false, deleted: false, theme: {}, subcategories: [] },
  { id: 0, slug: 'padel', name: 'Padel', subtitle: 'Court & Coaching', sortOrder: 7, hidden: false, deleted: false, theme: {}, subcategories: [] },
];

const BUNDLED_CONTEXT_VALUE: Omit<ContentContextValue, 'status'> = {
  coldDrinks,
  hotDrinks,
  desserts,
  shishaItems,
  subcategories: subcategoryData,
  settings: {},
  sections: BUNDLED_SECTIONS,
  promoGallery: [],
};

function readCachedSnapshot(): ContentSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ContentSnapshot;
    if (!Array.isArray(parsed.sections) || !parsed.settings || typeof parsed.settings !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedSnapshot(snapshot: ContentSnapshot): void {
  try {
    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // The public site still works with bundled content when storage is unavailable.
  }
}

function getInitialContextValue(): ContentContextValue {
  const cachedSnapshot = readCachedSnapshot();
  if (cachedSnapshot && cachedSnapshot.sections.length > 0) {
    return { ...snapshotToContextValue(cachedSnapshot), status: 'api' };
  }
  return { ...BUNDLED_CONTEXT_VALUE, status: 'api' };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ContentContextValue>(getInitialContextValue);

  useEffect(() => {
    let cancelled = false;
    let latestRequest = 0;
    let requestInFlight = false;
    let refreshQueued = false;
    const load = async () => {
      if (requestInFlight) {
        refreshQueued = true;
        return;
      }
      requestInFlight = true;
      const requestId = ++latestRequest;
      try {
        const res = await fetch(`${API_URL}?v=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const snapshot: ContentSnapshot = await res.json();
        if (!Array.isArray(snapshot.sections) || snapshot.sections.length === 0) {
          throw new Error('Published content response has no sections');
        }
        if (cancelled || requestId !== latestRequest) return;
        const derived = snapshotToContextValue(snapshot);
        writeCachedSnapshot(snapshot);
        setValue({ ...derived, status: 'api' });
      } catch {
        // Never replace visible content with a loading or error screen.
        // The cached/bundled snapshot remains available while the next
        // background refresh retries.
      } finally {
        requestInFlight = false;
        if (!cancelled && refreshQueued) {
          refreshQueued = false;
          void load();
        }
      }
    };

    void load();
    const unsubscribe = subscribeToPublishedContentChanges(() => { void load(); });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  return useContext(ContentContext);
}
