---
name: Express router ordering with blanket middleware
description: When router.use(middleware) in a sub-router intercepts all paths through it, affecting unrelated routes.
---

# Express Router Ordering with Blanket Middleware

## The rule
If a sub-router uses `router.use(someMiddleware)` without a path prefix, that middleware runs for **every request that reaches that router** — before route matching. This will block requests intended for other routers registered after it.

## How to apply
In `routes/index.ts`: always register public/unauthenticated routes **before** admin/protected routers.

```ts
// CORRECT ORDER
router.use(healthRouter);
router.use(publicContentRouter);   // public — must come first
router.use(adminAuthRouter);       // auth endpoints (no blanket middleware)
router.use(adminContentRouter);    // blanket requireAdminAuth inside
router.use(adminMediaRouter);      // blanket requireAdminAuth inside
```

**Why:** `adminContentRouter` has `router.use(requireAdminAuth)` as its first statement, making it intercept all requests. Public routes registered after it would receive 401 even without auth.

**Alternative:** mount each sub-router with a path prefix (`router.use('/admin', requireAdminAuth, adminContentRouter)`) and strip the `/admin` prefix from routes inside the router.
