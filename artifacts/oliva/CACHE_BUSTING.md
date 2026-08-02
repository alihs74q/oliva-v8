# Cache Busting Implementation

## Problem Solved
Previously, when logos or product images were replaced, browsers cached the old versions and showed stale content to users even after updates. This required customers to manually clear their browser cache.

## Solution Implemented

### 1. Content-Hashed URLs (Vite Asset System)
- **File**: `vite.config.ts`
- **How it works**: Vite automatically generates unique hashes in filenames for every local image
- **Example**: `oliva-logo.png` → `oliva-logo-CLvaJJLk.png` (hash changes when file changes)
- When an image changes: new hash generated → new URL → browser downloads it
- When an image doesn't change: same hash → same URL → browser uses cached version

### 2. Image Asset Imports
- **File**: `src/utils/imageAssets.ts`
- **How it works**: Centralized imports that use Vite's `?url` query to get hashed URLs
- All components import from this single source (`import { imageAssets } from '../utils/imageAssets'`)
- Updated components: `Navbar.tsx`, `OlivaLogo.tsx`, `App.tsx`, `PadelPage.tsx`, `CategoryListPage.tsx`, `HomepageExperience.tsx`, `HeroToGalleryTransition.tsx`, `LoadingIntro.tsx`

### 3. Service Worker Versioning (v5)
- **File**: `public/sw.js`
- **Cache Strategy**:
  - Hashed assets (`/assets/*-[hash].*`): Cache indefinitely (immutable)
  - HTML, Service Worker, manifest: Always revalidate (network-first)
  - Non-hashed assets: Network-first with cache fallback
  
- **Automatic Cleanup on Update**:
  - On activation, deletes all old `oliva-*` caches (v1–v4)
  - New Service Worker immediately claims all tabs (`clients.claim()`)
  - Prevents serving old assets from old caches
  - Uses `skipWaiting()` to activate immediately

### 4. Service Worker Update Checker
- **File**: `src/utils/serviceWorkerUpdater.ts`
- **How it works**:
  - Runs on page load, checks for SW updates
  - If new SW found, waits for activation
  - Refreshes page once (session flag prevents refresh loops)
  - Clears refresh flag after 2 minutes as safety timeout

- **Integration**: Called in `src/main.tsx` during app init

### 5. Vercel Cache Headers
- **File**: `vercel.json`
- **Configuration**:
  - Hashed assets: `Cache-Control: public, immutable, max-age=31536000` (1 year)
  - HTML/SW: `Cache-Control: public, must-revalidate, max-age=0` (always revalidate)
  - Non-hashed: `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` (1hr + 1day SWR)

## Testing Results

✅ **Test Case**: Replace logo while keeping filename
1. Original build: `oliva-logo-CLvaJJLk.png` (hash: `CLvaJJLk`)
2. Modify logo file
3. Rebuild
4. New hash generated: `oliva-logo-CkKGurzv.png` (hash: `CkKGurzv`)
5. ✓ Hash changed automatically — cache buster confirmed working

✅ **Build Verification**:
- TypeScript: ✓ Passed
- Production build: ✓ Successful (2.95s)
- Hashed assets: ✓ Generated with unique filenames
- Service Worker: ✓ Updated to v5 with cleanup logic

## How It Works in Practice

### When You Replace an Image:
1. Update the file in `public/oliva-logo.png`
2. Run `npm run build`
3. Vite detects the file changed
4. Generates a new hash automatically
5. Deployed files: `dist/public/assets/oliva-logo-[NEW_HASH].png`
6. Users see the new image immediately (no cache issues)

### When You Add a New Product Image:
1. Place PNG/JPG in `public/assets/`
2. Import using Vite's `?url` query
3. Build includes hashed filename automatically
4. Browsers cache it for 1 year since the hash is immutable

### When the Service Worker Updates:
1. Browser checks `sw.js` on page load (always revalidates)
2. New SW found → activates automatically
3. Old caches deleted (v1–v4 removed, v5 active)
4. Page refreshes once (with session flag preventing loops)
5. Users get new design/assets immediately

## Cache Behavior Summary

| Content | First Load | After Change | After Update |
|---------|-----------|--------------|--------------|
| HTML | Download | Download | Download |
| Service Worker | Download | Download | Download |
| Hashed Image (unchanged) | Download | Use cache | Use cache |
| Hashed Image (changed) | Download | Download new | Download new |
| Non-hashed asset | Download | Check server | Use cache (SWR) |

## No Refresh Loops
- Session flag (`oliva-sw-refreshed-v5`) prevents multiple refreshes
- Timeout clears flag after 2 minutes for safety
- Only refreshes once when new SW activates

## Build Information
- **Build Time**: ~3 seconds
- **Output**: `dist/public/` with hashed assets
- **SW Version**: v5 (incremented for deployment)
- **Vite Version**: Latest (configured in package.json)

## Deployment
Push to production with `npm run build`. Vercel automatically:
1. Deploys new hashed files (old hashes never served)
2. Applies cache headers from `vercel.json`
3. Service Worker update checker runs on user browsers
4. Old caches cleaned up automatically
