---
name: Oliva CMS Architecture
description: How the Oliva admin CMS stores, drafts, and publishes menu content.
---

# Oliva CMS Architecture

The admin CMS uses a two-layer content model:

## Draft layer (editable tables)
- `cms_sections` — 7 sections (cold-drinks, hot-drinks, desserts, shisha, sandwiches, yogurt, padel)
- `cms_subcategories` — subcategories with sortOrder, hidden, deleted flags
- `cms_products` — products with priceLbp, priceUsd (auto-calc), hidden, soldOut, deleted flags
- `cms_site_settings` — key/value store for exchange rate, hero text, WhatsApp info
- `admin_users` — legacy account metadata retained for schema compatibility; active login uses server-only `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## Admin account setup
- Accounts are created WITHOUT a password (passwordHash = NULL)
- Account holder uses "Set Initial Password" flow at /#/admin on first visit
- No credentials are ever hardcoded, seeded, or committed
- `POST /api/admin/auth/set-initial-password` — works only when passwordHash IS NULL

## Published layer (immutable snapshots)
- `cms_releases` — JSON snapshot of all sections/subcategories/products + settings at publish time
- `isCurrent = true` on one row → that's what the public API serves
- Rollback = atomic transaction flipping isCurrent

## Public API
- `GET /api/public/content` — serves the `isCurrent` release snapshot, no auth, 30s cache
- Falls back to bundled static data in `artifacts/oliva/src/data/` if API unreachable

## Direct content imports
- Writing directly to the draft CMS tables is not enough for the public menu: create a new current release snapshot afterward and clear the API's in-memory published-release cache (a service restart does this during maintenance).
- Catalog additions intended to be permanent website products must also be mirrored in the bundled menu/nutrition fallback while retaining matching editable CMS rows.

**Why:** The public API deliberately reads the immutable release snapshot rather than live draft rows, and static deployments may render bundled fallback content when the API is unavailable. A database-only import can therefore remain invisible.

**How to apply:** Use the authenticated admin API for normal edits. If a controlled bulk import writes draft tables directly, mirror permanent products in bundled data, publish one complete snapshot, and test both API-backed and API-blocked rendering.

## Exchange rate
- Stored in cms_site_settings (exchange_rate_lbp_per_usd, exchange_rate_rounding)
- On rate change, all product priceUsd fields are recalculated atomically in the DB

**Why:** Keeps published content immutable (rollback is safe) while draft edits are live in mutable tables.
