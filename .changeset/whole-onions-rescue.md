---
'myst-to-react': patch
'@myst-theme/article': patch
'@myst-theme/book': patch
---

Use of `migrate()` updates to ensure full pass-through of the `PageLoader` data. At the moment `myst-migrate` only deals with `mdast` but in will likely deal with the entire page, this change enables that.
