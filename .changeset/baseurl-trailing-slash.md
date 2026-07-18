---
"@myst-theme/providers": patch
"@myst-theme/site": patch
"@myst-theme/book": patch
"@myst-theme/article": patch
---

Strip trailing slash from `BASE_URL` before use to avoid double slashes in hrefs.
This affected the React state of TOC and its expansion.
With no trailing slash in `BASE_URL`, have `withBaseurl` always re-insert one separating slash between `baseurl` and `url`.

