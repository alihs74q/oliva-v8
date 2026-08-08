---
name: Replit object storage uploads
description: Durable app uploads should use the Replit object-storage sidecar signed-URL flow.
---

Use the Replit object-storage sidecar to create short-lived signed PUT/GET URLs, and persist only stable object identifiers or paths in application data. Do not use `/tmp` for user-uploaded assets.

**Why:** Runtime-local temporary files disappear on restart while published content can continue to reference them.

**How to apply:** Keep upload authorization on the server, validate the file bytes and size before upload, and serve public assets through a stable application route that signs or resolves the stored object.