---
name: Promotion presentation
description: Backward-compatible CMS promotion styling and public rendering rules.
---

Promotion slides are intentionally backward-compatible: older JSON entries should render with default visibility, colors, and fonts when newer style fields are absent. The public presentation uses an exact 16:9 image frame with optional text in a separate section beneath the image.

**Why:** Existing published releases and draft settings can contain older slide objects, so style expansion must not invalidate or hide legacy promotions.

**How to apply:** Add new slide fields as optional, keep safe rendering defaults, and preserve the distinction between the slide's overall visibility and the visibility of its text/title/description.