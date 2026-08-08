/**
 * useAdminApi.ts
 * ──────────────
 * Thin fetch wrappers for the admin API.
 * All requests go to /api/admin/* with credentials included.
 */

import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  return res;
}

// ─── Session ──────────────────────────────────────────────────────────────────
export interface AdminSession {
  email: string;
}

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/auth/session');
      if (res.ok) setSession(await res.json());
      else setSession(null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { session, loading, refresh };
}

export async function apiLogin(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return { ok: false, error: 'Invalid email or password.' };
    if (res.status === 403) return { ok: false, error: data.message ?? 'Password is not set for this account.' };
    if (res.status === 404) return { ok: false, error: 'Admin API is not connected to this website.' };
    if (res.status === 429) return { ok: false, error: 'Too many attempts. Please wait 15 minutes and try again.' };
    return { ok: false, error: data.error ?? `Admin API error (${res.status}).` };
  } catch {
    return { ok: false, error: 'Admin API is unavailable. Please try again.' };
  }
}

export async function apiLogout(): Promise<void> {
  await apiFetch('/admin/auth/logout', { method: 'POST' });
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await apiFetch('/admin/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? 'Failed to change password' };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}

// ─── Sections ─────────────────────────────────────────────────────────────────
export async function apiGetSections() {
  const res = await apiFetch('/admin/sections');
  if (!res.ok) throw new Error('Failed to load sections');
  return res.json();
}

export async function apiUpdateSection(slug: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/admin/sections/${slug}`, { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Failed'); }
  return res.json();
}

export async function apiCreateSection(data: Record<string, unknown>) {
  const res = await apiFetch('/admin/sections', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Failed'); }
  return res.json();
}

export async function apiDeleteSection(slug: string) {
  const res = await apiFetch(`/admin/sections/${slug}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed');
}

export async function apiRestoreSection(slug: string) {
  const res = await apiFetch(`/admin/sections/${slug}/restore`, { method: 'POST', body: '{}' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

// ─── Subcategories ────────────────────────────────────────────────────────────
export async function apiCreateSubcategory(sectionSlug: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/admin/sections/${sectionSlug}/subcategories`, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Failed'); }
  return res.json();
}

export async function apiUpdateSubcategory(id: number, data: Record<string, unknown>) {
  const res = await apiFetch(`/admin/subcategories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Failed'); }
  return res.json();
}

export async function apiDeleteSubcategory(id: number) {
  await apiFetch(`/admin/subcategories/${id}`, { method: 'DELETE' });
}

export async function apiRestoreSubcategory(id: number) {
  const res = await apiFetch(`/admin/subcategories/${id}/restore`, { method: 'POST', body: '{}' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function apiCreateProduct(subcategoryId: number, data: Record<string, unknown>) {
  const res = await apiFetch(`/admin/subcategories/${subcategoryId}/products`, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Failed'); }
  return res.json();
}

export async function apiUpdateProduct(id: number, data: Record<string, unknown>) {
  const res = await apiFetch(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Failed'); }
  return res.json();
}

export async function apiDeleteProduct(id: number) {
  await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}

export async function apiRestoreProduct(id: number) {
  const res = await apiFetch(`/admin/products/${id}/restore`, { method: 'POST', body: '{}' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiDuplicateProduct(id: number) {
  const res = await apiFetch(`/admin/products/${id}/duplicate`, { method: 'POST', body: '{}' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiMoveProduct(id: number, subcategoryDbId: number) {
  const res = await apiFetch(`/admin/products/${id}/move`, {
    method: 'POST',
    body: JSON.stringify({ subcategoryDbId }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Failed'); }
  return res.json();
}

export async function apiDuplicateSubcategory(id: number) {
  const res = await apiFetch(`/admin/subcategories/${id}/duplicate`, { method: 'POST', body: '{}' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiReorderSections(ids: number[]) {
  await apiFetch('/admin/sections/reorder', { method: 'POST', body: JSON.stringify({ ids }) });
}

export async function apiReorderSubcategories(ids: number[]) {
  await apiFetch('/admin/subcategories/reorder', { method: 'POST', body: JSON.stringify({ ids }) });
}

export async function apiReorderProducts(ids: number[]) {
  await apiFetch('/admin/products/reorder', { method: 'POST', body: JSON.stringify({ ids }) });
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function apiGetSettings(): Promise<Record<string, string>> {
  const res = await apiFetch('/admin/settings');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiUpdateSettings(data: Record<string, string>) {
  const res = await apiFetch('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

// ─── Exchange rate ────────────────────────────────────────────────────────────
export async function apiGetExchangeRate() {
  const res = await apiFetch('/admin/exchange-rate');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiUpdateExchangeRate(ratePerUsd: number, roundingTo?: number) {
  const res = await apiFetch('/admin/exchange-rate', { method: 'PATCH', body: JSON.stringify({ ratePerUsd, roundingTo }) });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

// ─── Releases ─────────────────────────────────────────────────────────────────
export async function apiListReleases() {
  const res = await apiFetch('/admin/releases');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiPublish(label?: string) {
  const res = await apiFetch('/admin/releases', { method: 'POST', body: JSON.stringify({ label: label ?? '' }) });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiRollback(id: number) {
  const res = await apiFetch(`/admin/releases/${id}/rollback`, { method: 'POST', body: '{}' });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

// ─── Media upload ─────────────────────────────────────────────────────────────
export async function apiUploadMedia(file: File, altText = ''): Promise<{ url: string; filename: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('altText', altText);
  const res = await fetch(`${API_BASE}/admin/media/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? 'Upload failed'); }
  return res.json();
}
