---
'@myst-theme/jupyter': patch
'@myst-theme/article': patch
'@myst-theme/site': patch
'@myst-theme/book': patch
---

- Split up ConfiguredThebeServer provider moving ComputeOptions out allowing it to be higher up in the render tree.
- `thebe-lite` bundle is now loaded when lite is enabled in frontmatter.
- Added feature flags to enable different ui compute features.
- fixed busy state on notebook error.
