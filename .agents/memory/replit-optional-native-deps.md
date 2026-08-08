---
name: Replit optional native dependencies
description: Replit package installs can omit Linux native optional dependencies needed by Vite's Rollup, esbuild, Lightning CSS, and Tailwind Oxide.
---

When a Vite preview fails with missing native bindings after a dependency install, check whether the install used `--no-optional` or was interrupted by the package firewall. Those bindings are required at runtime even though package managers mark them optional for cross-platform installs.

**Why:** The Oliva preview could load only after the Linux runtime packages were restored; repeated workflow restarts could not fix an incomplete dependency tree.

**How to apply:** Restore the platform-specific packages or use a clean, firewall-compatible install that includes optional dependencies before debugging application code or workflow ports.