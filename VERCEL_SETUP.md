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
ADMIN_EMAILS=oliva@cafe.fun,oliva2@cafe.fun,oliva3@cafe.fun
SESSION_SECRET=<a strong production secret>
ALLOWED_ORIGINS=https://YOUR-VERCEL-DOMAIN
COOKIE_SAME_SITE=none
```

The API must use the same production PostgreSQL database that contains the
admin account. If the API is proxied through the same Vercel origin instead,
keep `COOKIE_SAME_SITE` unset and use the same-origin `/api` path.