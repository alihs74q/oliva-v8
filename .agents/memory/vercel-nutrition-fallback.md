---
name: Vercel nutrition fallback
description: Why the static Oliva frontend carries a nutrition fallback
---

The GitHub/Vercel frontend can be deployed separately from the Replit API. If its `/api` rewrite reaches an older CMS snapshot without nutrition fields, the public menu must use the bundled verified nutrition map rather than defaulting missing values to zero.

**Why:** Vercel serves static files while the CMS API/database may be deployed independently; an old production snapshot previously omitted macro keys even though Replit development content was correct.

**How to apply:** Keep the bundled nutrition map synchronized with verified CMS imports, use API values when present, and only fall back by product name when a macro field is absent.