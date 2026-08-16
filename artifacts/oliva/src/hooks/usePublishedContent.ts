/**
 * usePublishedContent.ts
 * ──────────────────────
 * Loads the published CMS content from the API.
 * Falls back to the bundled static data if the API is unreachable.
 * Components should prefer this hook over importing static data directly.
 */

import { useState, useEffect } from 'react';
import { subcategoryData, type Subcategory } from '../data/subcategories';
import type { PromoGallerySlide } from '../components/PromoGallery';
import { getStaticCalories, getStaticNutrition } from '../data/nutrition';
import { getDefaultProductExtras } from '../data/menuExtras';
import { API_BASE } from '../config/api';
import { subscribeToPublishedContentChanges } from '../utils/contentRefresh';
import { readNutrition, visibleExtraCalories } from '../admin/nutritionStorage';

// ─── API content shapes (mirrors server output) ────────────────────────────────
export interface ApiProduct {
  id: number;
  subcategoryDbId: number;
  name: string;
  shortName: string;
  description: string;
  priceLbp: number;
  priceUsd: string;
  imageUrl: string | null;
  recipe: string;
  flavors: string[];
  calories: number;
  extraCalories: Record<string, number>;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  sortOrder: number;
  hidden: boolean;
  soldOut: boolean;
  deleted: boolean;
  slug?: string;
  galleryUrls?: string[];
  imageAlt?: string;
  imageFocalPoint?: string;
  extras?: string[];
  tags?: string[];
  allergens?: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiSubcategory {
  id: number;
  sectionSlug: string;
  subcategoryId: string;
  name: string;
  description: string;
  themeColor: string;
  accentColor: string;
  imageUrl: string | null;
  sortOrder: number;
  hidden: boolean;
  deleted: boolean;
  products: ApiProduct[];
}

export interface ApiSection {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  sortOrder: number;
  hidden: boolean;
  deleted?: boolean;
  theme: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  subcategories: ApiSubcategory[];
}

export interface ContentSnapshot {
  sections: ApiSection[];
  settings: Record<string, string>;
  publishedAt: string;
}

export type { PromoGallerySlide };

// ─── Convert API product → SubcategoryDrink shape ─────────────────────────────
function apiProductToSubcategoryDrink(p: ApiProduct) {
  const nutrition = readNutrition(p, getStaticNutrition(p.name));
  return {
    name: p.name,
    description: p.description,
    price: p.priceUsd,
    lbpPrice: formatLbp(p.priceLbp),
    image: p.imageUrl ?? null,
    recipe: p.recipe || undefined,
    calories: p.calories || getStaticCalories(p.name),
    extraCalories: visibleExtraCalories(p.extraCalories),
    proteinGrams: nutrition.proteinGrams,
    carbsGrams: nutrition.carbsGrams,
    fatGrams: nutrition.fatGrams,
    allergens: p.allergens ?? [],
    extras: p.extras ?? [],
    priceLbp: p.priceLbp,
    soldOut: p.soldOut,
  };
}

function formatLbp(lbp: number): string {
  if (lbp === 0) return '0 LBP';
  return lbp.toLocaleString('en-US') + ' LBP';
}

// ─── Convert API section → subcategoryData shape ──────────────────────────────
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
           .map((product) => ({
             ...apiProductToSubcategoryDrink(product),
             extras: product.extras ?? getDefaultProductExtras(product.name, sub.subcategoryId),
           })),
      } as Subcategory));
  }
  return result;
}

// ─── Base API URL ──────────────────────────────────────────────────────────────
const API_URL = `${API_BASE}/public/content`;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export type ContentStatus = 'loading' | 'api' | 'fallback';

export function usePublishedContent() {
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>(subcategoryData);
  const [snapshot, setSnapshot] = useState<ContentSnapshot | null>(null);
  const [status, setStatus] = useState<ContentStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ContentSnapshot = await res.json();
        if (cancelled) return;
        setSnapshot(data);
        setSubcategories(apiToSubcategoryData(data.sections));
        setStatus('api');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    };

    void load();
    const unsubscribe = subscribeToPublishedContentChanges(() => { void load(); });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { subcategories, snapshot, status };
}
