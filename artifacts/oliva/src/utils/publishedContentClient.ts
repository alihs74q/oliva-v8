import { API_BASE } from '../config/api';

const API_URL = `${API_BASE}/public/content`;
const CONTENT_CACHE_KEY = 'oliva:published-content:v3';

export interface CachedPublishedContent<T> {
  snapshot: T;
  etag: string | null;
  version: string | null;
}

export function readPublishedContentCache<T>(): CachedPublishedContent<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPublishedContent<T>;
    if (!parsed || typeof parsed !== 'object' || !parsed.snapshot) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePublishedContentCache<T>(entry: CachedPublishedContent<T>): void {
  try {
    window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // The bundled snapshot and service-worker response remain available.
  }
}

export async function fetchPublishedContent<T>(
  isValid: (snapshot: T) => boolean,
): Promise<{ snapshot: T; changed: boolean }> {
  const cached = readPublishedContentCache<T>();
  const headers = new Headers();
  if (cached?.etag) headers.set('If-None-Match', cached.etag);

  const response = await fetch(API_URL, {
    cache: 'no-cache',
    headers,
  });

  if (response.status === 304) {
    if (!cached || !isValid(cached.snapshot)) {
      throw new Error('Content was not modified but no valid local snapshot exists');
    }
    return { snapshot: cached.snapshot, changed: false };
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const snapshot = await response.json() as T;
  if (!isValid(snapshot)) throw new Error('Published content response is invalid');

  const etag = response.headers.get('ETag');
  const version = response.headers.get('X-Oliva-Content-Version');
  writePublishedContentCache({ snapshot, etag, version });

  const changed = !cached ||
    (etag ? cached.etag !== etag : version ? cached.version !== version : true);
  return { snapshot, changed };
}