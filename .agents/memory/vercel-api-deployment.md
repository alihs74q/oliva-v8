---
name: Vercel frontend and API deployment
description: Oliva's Vercel static frontend must point to a separately deployed API for admin auth and CMS features.
---

Oliva's Vercel deployment serves static frontend files only. Admin login, sessions, CMS editing, published content, and media require the Express API and its PostgreSQL database to be deployed separately. Vercel proxies relative `/api/*` requests to the published backend.

**Why:** Vercel's static build has no `/api/admin/auth/login` handler, so same-origin login requests can be reported by the UI as invalid credentials even when the development password is correct.

**How to apply:** Configure the Vercel `/api/*` rewrite to the published backend; configure the API's `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ALLOWED_ORIGINS`, production `SESSION_SECRET`, and `DATABASE_URL`.