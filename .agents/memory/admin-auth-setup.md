---
name: Admin auth setup
description: First-time Oliva admin password setup depends on database schema alignment and the session-based auth implementation.
---

# Admin auth setup

The active Oliva admin flow uses `express-session`, `admin_users.setup_token`, and the `audit_log` table. A password can be written before a later audit insert fails, leaving the account apparently unprovisioned while the token is already consumed.

**Why:** The repository briefly contained two incompatible CMS/auth implementations and schemas, so failures could be misleading and rate limiting made retries look like a second problem.

**How to apply:** When first-time setup reports a generic failure followed by rate limiting, check the account state before retrying, verify the audit table matches the active auth route, restart the API to clear the in-memory limiter, and issue a fresh token only if the account needs it.