---
name: Oliva menu extras contract
description: Product extras are a shared catalog with product-level availability and explicit empty-list semantics.
---

The menu uses one shared catalog for extra names, prices, and calories. Each CMS product stores its own `extras` availability list; an empty list means the product intentionally has no extras and must not fall back to category defaults.

**Why:** Admins need to remove every extra from an individual product without the public fallback logic re-adding them.

**How to apply:** When adding or changing menu extras, update the shared catalog, the product editor, public conversion paths, and the CMS seed rules together. Preserve `null`/missing as fallback-eligible, but preserve `[]` as an explicit override.