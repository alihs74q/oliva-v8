/**
 * validation.ts
 * ─────────────
 * Local Zod schemas for the admin API.
 */

import { z } from "zod";

export const AdminLoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SetInitialPasswordInput = z.object({
  email: z.string().email(),
  /** One-time setup token generated at account creation, delivered out-of-band. */
  setupToken: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ChangePasswordInput = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const SectionUpdate = z.object({
  name: z.string().optional(),
  subtitle: z.string().optional(),
  hidden: z.boolean().optional(),
  theme: z.record(z.string()).optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
});

export const SectionInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  theme: z.record(z.string()).optional(),
});

export const SubcategoryInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  themeColor: z.string().optional(),
  accentColor: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  subcategoryId: z.string().optional(),
});

export const SubcategoryUpdate = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  themeColor: z.string().optional(),
  accentColor: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  hidden: z.boolean().optional(),
  deleted: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
});

export const ProductInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  priceLbp: z.number().int().min(0),
  imageUrl: z.string().nullable().optional(),
  galleryUrls: z.array(z.string()).optional(),
  imageAlt: z.string().optional(),
  imageFocalPoint: z.string().optional(),
  recipe: z.string().optional(),
  flavors: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
  calories: z.number().int().min(0).optional(),
  extraCalories: z.record(z.string(), z.number().int().min(0)).optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});

export const ProductUpdate = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  shortName: z.string().optional(),
  description: z.string().optional(),
  priceLbp: z.number().int().min(0).optional(),
  imageUrl: z.string().nullable().optional(),
  galleryUrls: z.array(z.string()).optional(),
  imageAlt: z.string().optional(),
  imageFocalPoint: z.string().optional(),
  recipe: z.string().optional(),
  flavors: z.array(z.string()).optional(),
  extras: z.array(z.string()).optional(),
  calories: z.number().int().min(0).optional(),
  extraCalories: z.record(z.string(), z.number().int().min(0)).optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  subcategoryDbId: z.number().int().positive().optional(),
  hidden: z.boolean().optional(),
  soldOut: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
});

export const ReorderInput = z.object({
  ids: z.array(z.number().int()),
});

export const PublishInput = z.object({
  label: z.string().optional(),
});

export const SettingsUpdate = z.record(z.string(), z.string().optional());

export const ExchangeRateUpdate = z.object({
  ratePerUsd: z.number().int().min(1),
  roundingTo: z.number().int().optional(),
});
