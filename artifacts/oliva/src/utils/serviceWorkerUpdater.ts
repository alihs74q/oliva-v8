/**
 * Service Worker Updater
 * Checks for SW updates on page load and activates new versions safely
 * Prevents refresh loops by tracking if we've already refreshed
 */

const SW_CHECKED_FLAG = 'oliva-sw-checked-v5';
const SW_REFRESHED_FLAG = 'oliva-sw-refreshed-v5';

export async function initServiceWorkerUpdater() {
  // Only run in browser
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Wait for the page to be ready before checking for updates
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkForSwUpdate());
  } else {
    checkForSwUpdate();
  }
}

async function checkForSwUpdate() {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    
    if (!registration) {
      console.log('[SW] No service worker registered');
      return;
    }

    // Check for updates
    const updated = await registration.update();
    
    if (updated && updated.installing) {
      console.log('[SW] New service worker found, waiting for activation...');
      
      // Listen for the new SW to activate
      updated.installing.addEventListener('statechange', (event) => {
        const worker = event.target as ServiceWorkerState;
        if (worker.state === 'activated') {
          handleSwActivated();
        }
      });
    }
  } catch (err) {
    console.warn('[SW] Failed to check for updates:', err);
  }
}

function handleSwActivated() {
  // Check if we've already refreshed for this version
  const hasRefreshed = sessionStorage.getItem(SW_REFRESHED_FLAG) === 'true';
  
  if (hasRefreshed) {
    console.log('[SW] Already refreshed for this version');
    return;
  }

  // Mark that we're refreshing to prevent loops
  sessionStorage.setItem(SW_REFRESHED_FLAG, 'true');
  
  console.log('[SW] New service worker activated, refreshing page...');
  
  // Give the new SW a moment to claim clients, then refresh
  setTimeout(() => {
    window.location.reload();
  }, 100);
}

// Fallback: if we don't see the refresh flag after 2 minutes, clear it
// This prevents being stuck if something goes wrong
setTimeout(() => {
  sessionStorage.removeItem(SW_REFRESHED_FLAG);
}, 2 * 60 * 1000);

// Also handle manual SW update checks
export async function manualUpdateCheck() {
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  if (registration) {
    await registration.update();
  }
}

// Type helper for service worker state
interface ServiceWorkerState extends ServiceWorker {
  state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';
}
