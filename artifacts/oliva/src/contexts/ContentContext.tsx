/**
 * ContentContext.tsx
 * ──────────────────
 * Provides published CMS content to all public-site components.
 * Falls back to bundled static data if the API is unavailable.
 *
 * Usage: wrap the app in <ContentProvider>, then use useContent() in any component.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ColdDrink } from '../data/coldDrinks';
import { coldDrinks as staticColdDrinks } from '../data/coldDrinks';
import type { HotDrink } from '../data/hotDrinks';
import { hotDrinks as staticHotDrinks } from '../data/hotDrinks';
import type { Dessert } from '../data/desserts';
import { desserts as staticDesserts } from '../data/desserts';
import type { ShishaItem } from '../data/shisha';
import { shishaItems as staticShishaItems } from '../data/shisha';
import { subcategoryData, type Subcategory } from '../data/subcategories';
import type { ContentSnapshot, ApiSection, ApiProduct } from '../hooks/usePublishedContent';
import type { PromoGallerySlide } from '../components/PromoGallery';
import { getStaticCalories } from '../data/nutrition';
import { getDefaultProductExtras } from '../data/menuExtras';
import { API_BASE } from '../config/api';
import { subscribeToPublishedContentChanges } from '../utils/contentRefresh';

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
  status: 'loading' | 'api' | 'fallback';
}

const ContentContext = createContext<ContentContextValue>({
  coldDrinks: staticColdDrinks,
  hotDrinks: staticHotDrinks,
  desserts: staticDesserts,
  shishaItems: staticShishaItems,
  subcategories: subcategoryData,
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
    image: p.imageUrl ?? null,
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
    image: p.imageUrl ?? null,
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
    image: p.imageUrl ?? null,
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
    image: p.imageUrl ?? null,
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
            image: p.imageUrl ?? null,
            recipe: p.recipe || undefined,
            calories: p.calories ?? getStaticCalories(p.name),
            extraCalories: p.extraCalories ?? {},
             proteinGrams: p.proteinGrams ?? 0,
             carbsGrams: p.carbsGrams ?? 0,
             fatGrams: p.fatGrams ?? 0,
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
    : staticColdDrinks;

  const apiHotDrinks: HotDrink[] = hotSection
    ? hotSection.subcategories.filter((s) => !s.hidden && !s.deleted)
        .flatMap((sub) => sub.products.filter((p) => !p.hidden && !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder).map((p) => apiProductToHotDrink(p, sub.themeColor)))
    : staticHotDrinks;

  const apiDesserts: Dessert[] = dessertSection
    ? dessertSection.subcategories.filter((s) => !s.hidden && !s.deleted)
        .flatMap((sub) => sub.products.filter((p) => !p.hidden && !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder).map((p) => apiProductToDessert(p, sub.themeColor)))
    : staticDesserts;

  const apiShishaItems: ShishaItem[] = shishaSection
    ? shishaSection.subcategories.filter((s) => !s.hidden && !s.deleted)
        .flatMap((sub) => sub.products.filter((p) => !p.hidden && !p.deleted).sort((a, b) => a.sortOrder - b.sortOrder).map((p) => apiProductToShishaItem(p, sub.themeColor)))
    : staticShishaItems;

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
    coldDrinks: apiColdDrinks.length > 0 ? apiColdDrinks : staticColdDrinks,
    hotDrinks: apiHotDrinks.length > 0 ? apiHotDrinks : staticHotDrinks,
    desserts: apiDesserts.length > 0 ? apiDesserts : staticDesserts,
    shishaItems: apiShishaItems.length > 0 ? apiShishaItems : staticShishaItems,
    subcategories: apiToSubcategoryData(sections),
    settings: snapshot.settings ?? {},
    sections: sections.filter((section) => !section.hidden && !section.deleted).sort((a, b) => a.sortOrder - b.sortOrder),
    promoGallery,
  };
}

// ─── Provider ──────────────────────────────────────────────────────────────────
const API_URL = `${API_BASE}/public/content`;

export function ContentProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ContentContextValue>({
    coldDrinks: staticColdDrinks,
    hotDrinks: staticHotDrinks,
    desserts: staticDesserts,
    shishaItems: staticShishaItems,
    subcategories: subcategoryData,
    settings: {},
    sections: [],
    promoGallery: [],
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const snapshot: ContentSnapshot = await res.json();
        if (cancelled) return;
        const derived = snapshotToContextValue(snapshot);
        setValue({ ...derived, status: 'api' });
      } catch {
        if (!cancelled) {
          setValue((prev) => ({ ...prev, status: 'fallback' }));
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
