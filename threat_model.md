# Threat Model

## Project Overview

Oliva is a padel café web application consisting of:
- A static React/Vite SPA frontend (`artifacts/oliva`) — public-facing, serves café menu, gallery, and padel court info
- A Node.js/Express API server (`artifacts/api-server`) — admin CMS backend + public content API
- A PostgreSQL database (via `@workspace/db`) — stores CMS content, sessions, audit logs

Users: unauthenticated public visitors (read-only), and up to 3 hardcoded admin accounts (content management).

No payment processing, user registration, or user accounts beyond the fixed admin set.

## Assets

- **Admin credentials** — bcrypt-hashed passwords and one-time setup tokens stored in `admin_users` table. Compromise allows full CMS control.
- **Session tokens** — express-session cookies (`HttpOnly`, `Secure`, `SameSite=Strict`). Compromise allows impersonation of an admin.
- **CMS content** — published menu items, product images, site settings. Unauthorized modification would deface the public-facing site.
- **Application secrets** — `SESSION_SECRET`, `DATABASE_URL`, `ADMIN_EMAILS`, object storage credentials. Compromise enables session forgery, database access, or admin enumeration.
- **Uploaded images** — promotion/product images stored in object storage. Not sensitive but a content integrity concern.

## Trust Boundaries

- **Browser → API server**: All CMS mutations cross this boundary over HTTPS. CORS is restricted to known Replit domains plus `ALLOWED_ORIGINS`. SameSite=Strict cookies provide CSRF protection.
- **API server → PostgreSQL**: Direct DB access via connection pool. Parameterized queries (Drizzle ORM) prevent SQL injection.
- **API server → Object storage sidecar**: HTTP calls to `127.0.0.1:1106` for signed URLs. Internal loopback; not reachable externally.
- **Public / Authenticated boundary**: `/api/public/*` is unauthenticated. All `/api/admin/*` routes require a valid session verified against the DB on each request.
- **Admin allowlist boundary**: `ADMIN_EMAILS` env var restricts login to exactly 3 pre-approved addresses. DB records are the secondary gate (password hash must be set).

## Scan Anchors

- Production entry points: `artifacts/api-server/src/routes/` — all `/api/*` routes
- Highest-risk code: `artifacts/api-server/src/middlewares/adminAuth.ts`, `artifacts/api-server/src/routes/adminAuth.ts`, `artifacts/api-server/src/lib/adminAllowlist.ts`
- Public surface: `GET /api/public/content`, `GET /api/public/media/:filename`
- Admin surface: `/api/admin/auth/*` (rate-limited), `/api/admin/*` (session-gated)
- Dev/ops only: `scripts/src/seedCmsContent.ts` — run by operators at setup, not reachable in production
- The mockup sandbox (`artifacts/mockup-sandbox`) is dev-only

## Threat Categories

### Spoofing

Admin auth uses bcrypt (cost 12), rate-limited login (10 req/IP/15 min), and single-use setup tokens. Session cookies are HttpOnly + Secure + SameSite=Strict. Sessions are DB-backed and verified against the live admin_users table on every request — revocation is immediate.

**Required**: `SESSION_SECRET` must be a strong random value in production (enforced by startup check). `ADMIN_EMAILS` must be set to exactly 3 valid addresses; misconfiguration causes all logins to fail.

### Tampering

CMS mutations require admin auth. Content is validated with Zod schemas. Optimistic-lock (`expectedUpdatedAt`) prevents lost updates. Audit log captures all mutations.

**Required**: `imageUrl` and free-text fields from the admin API are stored and served without URL-scheme validation — a malicious admin could store `javascript:` URLs that would affect admin UI rendering (though React `src` attributes are safe, `href` usages should be checked).

### Information Disclosure

Logs are structured (pino) with URL path only (no query strings). Passwords are never logged. Setup tokens are never printed to any output. The seed script logs admin email addresses to stdout — acceptable for an operator-run script, but those emails are already known config values.

**Required**: Error responses must not expose stack traces in production (Express 5 default behavior). The `/api/public/media/:filename` endpoint proxies Content-Type from object storage; an attacker who can write to the bucket directly could cause unexpected content types to be served.

### Denial of Service

Auth endpoints are rate-limited. No rate limiting on admin content endpoints, which are session-gated and have a very small user population (≤3 admins). No explicit body size limits on JSON/form routes beyond Express defaults (~100KB) and multer's 10MB file cap.

### Elevation of Privilege

`requireAdminAuth` is applied as a router-level middleware to all admin content/media routes. DB lookup confirms the account still exists and has a password hash on every admin request — no stale session bypass possible.

`ADMIN_EMAILS` env var must contain exactly 3 addresses; a misconfigured value locks out all admins entirely (no partial degradation).

SQL injection: not applicable — Drizzle ORM uses parameterized queries throughout.
Path traversal: object IDs validated with `/^[a-zA-Z0-9_-]{16,80}$/` regex before use.
