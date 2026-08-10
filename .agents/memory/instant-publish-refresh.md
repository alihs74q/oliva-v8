---
name: Instant publish refresh
description: How Oliva public content updates immediately after CMS publish or rollback
---

The Oliva frontend listens for a same-tab publish/rollback event and refetches the current public snapshot with `no-store`; the API public-content response is also marked `no-store`.

**Why:** Admins expect a published edit to appear immediately without manually refreshing the browser.

**How to apply:** Trigger the content-change notification only after publish or rollback succeeds, and keep both public content loaders subscribed so category data and site-wide CMS content stay synchronized.