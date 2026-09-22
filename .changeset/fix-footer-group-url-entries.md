---
"@myst-theme/common": patch
---

Fix `getProjectHeadings`/`getFooterLinks` incorrectly using an external `url:` TOC entry's title as the prev/next "group" label for every subsequent page. A slug-less heading is only a legitimate "Part" grouping node when it also has no `url`; external reference links (which also have no slug) must not overwrite the group label.
