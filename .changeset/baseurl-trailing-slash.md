---
"@myst-theme/providers": patch
"@myst-theme/site": patch
"@myst-theme/book": patch
"@myst-theme/article": patch
---

Strip trailing slash from `BASE_URL` before use to avoid double slashes in hrefs.
This affected the React state of TOC and its expansion.
With no trailing slash in `BASE_URL`, have `withBaseurl` always re-insert one separating slash between `baseurl` and `url`.

For static `myst build --html` exports, clicking a TOC header with a page associated does a reload.
Avoid doing a setOpen before (since animation will play once page reload finishes).

As an additional optimization, for now disable the TOC's open/close CSS animation entirely for static builds—we already have one flash due to the reload, so the animation feels egregious.

Fix another source of flashing: the dismissible top banner determined its visible/height state (and dependents like the sidebar's position) in a `useEffect`, which runs after the browser paints. Switched to `useLayoutEffect` so that state is settled before the first paint instead of snapping into place a frame later.

