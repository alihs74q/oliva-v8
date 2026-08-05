# Oliva — Padel & Café

A cinematic web app for Oliva, a padel café that combines padel courts with a full café menu. Users can browse the menu (cold drinks, hot drinks, desserts, shisha, sandwiches, yogurt), view the gallery, explore the padel courts, and make WhatsApp bookings.

## Run & Operate

- `pnpm install` — install all workspace dependencies
- `pnpm run dev` — start the Oliva web app dev server (forwards to `@workspace/oliva`)
- `pnpm run build` — typecheck + build all packages
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 20+, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + Framer Motion
- Routing: custom hash-based router in `App.tsx`
- PWA: vite-plugin-pwa with custom service worker
- Fonts: Playfair Display, Cormorant Garamond, Manrope (Google Fonts)

## Where things live

- `artifacts/oliva/` — the main web app package (`@workspace/oliva`)
- `artifacts/oliva/src/App.tsx` — root component + hash router
- `artifacts/oliva/src/components/` — all page and UI components
- `artifacts/oliva/src/data/` — static menu/subcategory data
- `artifacts/oliva/src/assets/` — imported image assets (Vite-hashed)
- `artifacts/oliva/public/` — static public assets (logo, product images)
- `artifacts/oliva/vite.config.ts` — Vite config (PORT defaults to 5173 if unset, BASE_PATH defaults to /)

## Architecture decisions

- Hash-based routing (`window.location.hash`) — no server-side routing needed, works as a static SPA
- Images in `src/assets/` get Vite content-hash filenames for cache busting; `public/` images are served at root URL and referenced by path string
- PORT and BASE_PATH are optional in vite.config.ts — defaults allow `pnpm run build` and `pnpm run dev` to work without env vars set

## Product

- Browse café menu by category (cold drinks, hot drinks, desserts, shisha, sandwiches, yogurt)
- View the photo gallery with cinematic scroll transitions
- Explore "Our Place" — the venue story with pinned scroll animations
- Padel court info + WhatsApp booking flow
- PWA-capable with custom service worker

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm run dev` at workspace root forwards to `@workspace/oliva` — there is no workspace-root dev server
- Workflow injects `PORT=25654 BASE_PATH=/` — vite.config.ts falls back to port 5173 and path `/` when those are absent (safe for CI/build)
- Public-dir asset warnings in Vite logs are non-breaking — those files are served via URL strings, not ES module imports

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
