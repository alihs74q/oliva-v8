---
name: CMS schema migrations
description: Safe schema changes for the existing Oliva CMS database
---

When changing the Oliva CMS schema, prefer a narrowly scoped additive migration for the requested columns. The live database contains legacy CMS columns that may already exist even when migration bookkeeping is incomplete, so a broad generated diff can propose duplicate-column changes or unrelated uniqueness prompts.

**Why:** A generated schema push surfaced existing legacy columns and an unrelated uniqueness prompt; applying only the required additions avoided destructive truncation and preserved all menu rows.

**How to apply:** Inspect the live information schema first, add only missing columns, and keep the migration file limited to those additions. Verify row counts and existing content after the change.