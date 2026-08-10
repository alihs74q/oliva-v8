---
name: Vercel product images
description: Product image handling for the separately deployed Vercel frontend
---

Product images selected in the admin product form are resized and compressed in the browser, then stored as a data URL in the existing CMS image field. This avoids relying on the separate media upload endpoint or App Storage configuration for product cards.

**Why:** The Vercel frontend and Replit API deployments did not share the same object-storage runtime configuration, so media uploads failed even when product edits worked.

**How to apply:** Keep the browser image output bounded and preserve the existing `imageUrl` contract so the public menu can render the stored value from the published CMS snapshot. Use App Storage separately for large media that should not live in CMS content.