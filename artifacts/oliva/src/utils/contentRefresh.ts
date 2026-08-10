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

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONTENT_PUBLISHED_STORAGE_KEY) onChange();
  };

  window.addEventListener(CONTENT_PUBLISHED_EVENT, onChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(CONTENT_PUBLISHED_EVENT, onChange);
    window.removeEventListener('storage', handleStorage);
  };
}