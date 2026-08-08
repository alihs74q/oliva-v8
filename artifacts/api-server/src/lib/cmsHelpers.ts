import { db } from "@workspace/db";
import {
  cmsSectionsTable,
  cmsSubcategoriesTable,
  cmsProductsTable,
  type CmsSection,
  type CmsSubcategory,
  type CmsProduct,
} from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

export interface ProductShape {
  id: number;
  subcategoryDbId: number;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  priceLbp: number;
  priceUsd: string;
  imageUrl: string | null;
  galleryUrls: string[];
  imageAlt: string;
  imageFocalPoint: string;
  recipe: string;
  flavors: string[];
  extras: string[];
  tags: string[];
  allergens: string[];
  featured: boolean;
  sortOrder: number;
  hidden: boolean;
  soldOut: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubcategoryShape {
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
  products: ProductShape[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionShape {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  sortOrder: number;
  hidden: boolean;
  deleted: boolean;
  theme: Record<string, unknown>;
  subcategories: SubcategoryShape[];
}

function toProductShape(p: CmsProduct): ProductShape {
  return {
    id: p.id,
    subcategoryDbId: p.subcategoryDbId,
    name: p.name,
    shortName: p.shortName,
    slug: p.slug,
    description: p.description,
    priceLbp: p.priceLbp,
    priceUsd: p.priceUsd,
    imageUrl: p.imageUrl ?? null,
    galleryUrls: (p.galleryUrls as string[]) ?? [],
    imageAlt: p.imageAlt,
    imageFocalPoint: p.imageFocalPoint,
    recipe: p.recipe,
    flavors: (p.flavors as string[]) ?? [],
    extras: (p.extras as string[]) ?? [],
    tags: (p.tags as string[]) ?? [],
    allergens: (p.allergens as string[]) ?? [],
    featured: p.featured,
    sortOrder: p.sortOrder,
    hidden: p.hidden,
    soldOut: p.soldOut,
    deleted: p.deleted,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function toSubcategoryShape(sub: CmsSubcategory, products: CmsProduct[]): SubcategoryShape {
  return {
    id: sub.id,
    sectionSlug: sub.sectionSlug,
    subcategoryId: sub.subcategoryId,
    name: sub.name,
    description: sub.description,
    themeColor: sub.themeColor,
    accentColor: sub.accentColor,
    imageUrl: sub.imageUrl ?? null,
    sortOrder: sub.sortOrder,
    hidden: sub.hidden,
    deleted: sub.deleted,
    products: products.map(toProductShape),
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  };
}

/** Compute USD display string from LBP price using stored exchange rate */
export function computeUsd(priceLbp: number, ratePerUsd: number, roundingTo: number): string {
  if (priceLbp === 0 || ratePerUsd === 0) return "$0";
  const raw = priceLbp / ratePerUsd;
  // Round to nearest $0.50
  const rounded = Math.round(raw * 2) / 2;
  // Format nicely
  if (rounded === Math.floor(rounded)) return `$${rounded}`;
  return `$${rounded.toFixed(2)}`;
}

/** Load all sections with nested subcategories and products (includes deleted for admin) */
export async function loadFullContent(includeDeleted = false): Promise<SectionShape[]> {
  const sections = await db
    .select()
    .from(cmsSectionsTable)
    .orderBy(asc(cmsSectionsTable.sortOrder));

  const subcategories = await db
    .select()
    .from(cmsSubcategoriesTable)
    .orderBy(asc(cmsSubcategoriesTable.sortOrder));

  const products = await db
    .select()
    .from(cmsProductsTable)
    .orderBy(asc(cmsProductsTable.sortOrder));

  return sections
    .filter((section) => includeDeleted || !section.deleted)
    .map((section): SectionShape => {
    const subs = subcategories.filter(
      (s) => s.sectionSlug === section.slug && (includeDeleted || !s.deleted),
    );
    return {
      id: section.id,
      slug: section.slug,
      name: section.name,
      subtitle: section.subtitle,
      sortOrder: section.sortOrder,
      hidden: section.hidden,
      deleted: section.deleted,
      theme: (section.theme as Record<string, unknown>) ?? {},
      subcategories: subs.map((sub) => {
        const prods = products.filter(
          (p) => p.subcategoryDbId === sub.id && (includeDeleted || !p.deleted),
        );
        return toSubcategoryShape(sub, prods);
      }),
    };
    });
}
