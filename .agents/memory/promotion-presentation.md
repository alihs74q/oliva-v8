---
name: Promotion presentation
description: Backward-compatible CMS promotion styling and public rendering rules.
---

Promotion slides are intentionally backward-compatible: older JSON entries should render with default visibility, colors, and fonts when newer style fields are absent. The public presentation uses an exact 16:9 image frame with only the optional title in a separate section beneath the image.

Promotion headlines use a large editable brush-script default inspired by the supplied calligraphy reference; users can choose other script or display fonts in Admin, while legacy sans-serif defaults are mapped to the new script treatment. The public gallery intentionally hides all other editorial copy and controls.

**Why:** Existing published releases and draft settings can contain older slide objects, so style expansion must not invalidate or hide legacy promotions.

**How to apply:** Add new slide fields as optional, keep safe rendering defaults, preserve the title visibility control, and keep the headline font editable. Do not reintroduce public descriptions, labels, counters, dots, arrows, overlays, or hover-paused rotation unless explicitly requested.