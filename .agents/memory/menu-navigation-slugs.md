---
name: Menu navigation slugs
description: CMS-driven menu cards must route from full section slugs, not only bundled short IDs.
---

CMS section cards use stable slugs such as `cold-drinks`, while bundled fallback cards may use short IDs such as `cold`.

**Why:** Reordering a CMS section changes its position but should not change its identity; mapping only short fallback IDs makes reordered categories appear clickable but do nothing.

**How to apply:** When adding or changing menu navigation, support the published section slug directly and keep short fallback IDs only for static offline data.