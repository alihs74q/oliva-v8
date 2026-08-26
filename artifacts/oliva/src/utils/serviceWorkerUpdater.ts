/**
 * Service Worker Updater
 * Checks for SW updates on page load and activates new versions safely
 * Prevents refresh loops by tracking if we've already refreshed
 */

export async function initServiceWorkerUpdater() {
  // Only run in browser
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  void navigator.serviceWorker.ready
    .then((registration) => registration.update())
    .catch((err) => console.warn('[SW] Failed to check for updates:', err));
}

// Also handle manual SW update checks
export async function manualUpdateCheck() {
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  if (registration) {
    await registration.update();
  }
}
