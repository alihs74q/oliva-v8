---
name: Vercel admin edits
description: Admin edit behavior when the Oliva frontend and API deploy separately
---

When the GitHub/Vercel frontend talks to a separately deployed API, product edits may receive a 409 because PostgreSQL retains microseconds while browser ISO timestamps retain milliseconds. The client should retry once without the optional revision token after a 409; the API should compare timestamps at millisecond precision.

**Why:** The deployed API returned 409 for every product PATCH even though login and content loading worked. The mismatch was deployment-specific, not a form or authentication failure.

**How to apply:** Preserve optimistic conflict checks on the first request, use a single fallback retry for the Vercel admin client, and deploy the API timestamp comparison when the API service is updated.