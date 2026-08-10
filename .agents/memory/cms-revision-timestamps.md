---
name: CMS revision timestamp comparisons
description: Optimistic concurrency checks for admin CMS edits across PostgreSQL and JavaScript timestamp formats
---

Admin CMS edit requests send `updatedAt` values serialized through JavaScript ISO strings, which preserve milliseconds while PostgreSQL timestamps may retain microseconds. Exact timestamp equality can therefore reject every legitimate edit as stale.

**Why:** A product edit returned a false 409 because the database timestamp had sub-millisecond precision that could not round-trip through the browser.

**How to apply:** Keep optimistic concurrency protection, but compare the stored timestamp within the one-millisecond interval represented by the serialized revision instead of using exact Date equality.