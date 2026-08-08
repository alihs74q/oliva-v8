# Vercel + Oliva API setup

Vercel serves the Oliva frontend as static files. Admin login, CMS editing,
published content, sessions, and media still require the API server and its
PostgreSQL database.

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