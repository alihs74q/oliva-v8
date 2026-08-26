import { API_BASE } from '../config/api';

export const CONTENT_PUBLISHED_EVENT = 'oliva:content-published';
const CONTENT_PUBLISHED_STORAGE_KEY = 'oliva-content-published';

export function notifyPublishedContentChanged(): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(CONTENT_PUBLISHED_EVENT));
  try {
    window.localStorage.setItem(CONTENT_PUBLISHED_STORAGE_KEY, String(Date.now()));
  } catch {
    // The in-tab event still works when localStorage is unavailable.
  }
}

export function subscribeToPublishedContentChanges(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let refreshTimer: number | undefined;
  let events: EventSource | null = null;
  const requestRefresh = () => {
    if (refreshTimer !== undefined) return;
    refreshTimer = window.setTimeout(() => {
      refreshTimer = undefined;
      onChange();
    }, 150);
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONTENT_PUBLISHED_STORAGE_KEY) requestRefresh();
  };
  const connectEvents = () => {
    if (events || !navigator.onLine) return;
    events = new EventSource(`${API_BASE}/public/content/events`);
    events.addEventListener('published', requestRefresh);
  };
  const disconnectEvents = () => {
    events?.close();
    events = null;
  };
  const handleOnline = () => {
    connectEvents();
    requestRefresh();
  };
  const handleOffline = () => disconnectEvents();

  window.addEventListener(CONTENT_PUBLISHED_EVENT, requestRefresh);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  const handleFocus = () => requestRefresh();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') requestRefresh();
  };
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);
  connectEvents();
  const poll = window.setInterval(() => {
    if (navigator.onLine) requestRefresh();
  }, 60_000);

  return () => {
    if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
    window.clearInterval(poll);
    disconnectEvents();
    window.removeEventListener(CONTENT_PUBLISHED_EVENT, requestRefresh);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}