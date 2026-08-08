# Vercel + Oliva API setup

Vercel serves the Oliva frontend as static files. Admin login, CMS editing,
published content, sessions, and media still require the API server and its
PostgreSQL database.

## Vercel environment variable

Set this variable in the Vercel project for the Production environment:

```text
VITE_API_BASE_URL=https://YOUR-API-DOMAIN/api
```

The value must include `/api` and must not end with a slash. Vercel must
redeploy after changing it because Vite embeds `VITE_*` variables at build
time.

## API environment variables

On the deployed API server, set:

```text
ADMIN_EMAIL=the-single-admin-email
ADMIN_PASSWORD=the-admin-password
SESSION_SECRET=<a strong production secret>
ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN
```

`DATABASE_URL` is also required by the API and should point to the production
PostgreSQL database. The API uses PostgreSQL-backed sessions, so the same
database must remain available across restarts and Autoscale sleep.

The API always uses `SameSite=Lax`, `Secure` cookies in production, and no
cookie domain. If the API and Vercel frontend use different domains, both
domains must be HTTPS and the Vercel origin must be included in
`ALLOWED_ORIGINS`.