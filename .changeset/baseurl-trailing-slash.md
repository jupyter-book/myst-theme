---
"@myst-theme/providers": patch
"@myst-theme/site": patch
"@myst-theme/book": patch
"@myst-theme/article": patch
---

Strip trailing slash from `BASE_URL` before use to avoid double slashes in hrefs.
This affected the rendering of TOC and its expansion too.

