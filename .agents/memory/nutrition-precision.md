---
name: Nutrition precision
description: Precision and matching rules for Oliva menu nutrition imports
---

Protein, carbs, and fat values must support one decimal place; values such as 0.5g, 0.3g, and 0.1g must not be rounded to integers. Bulk imports should update only products confirmed against the current CMS catalog, using explicit aliases for known spelling differences.

**Why:** Nutrition source lists can contain fractional gram values, while the original CMS integer fields silently lost that accuracy. The catalog also contains legacy spelling differences and may not include every source item.

**How to apply:** Keep macro storage/API/admin inputs at one-decimal precision, verify source values against the published snapshot, and report unmatched source products instead of creating incomplete records.