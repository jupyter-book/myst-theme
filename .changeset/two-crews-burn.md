---
'myst-to-react': patch
'myst-demo': patch
'@myst-theme/providers': patch
'@myst-theme/jupyter': patch
'@myst-theme/common': patch
'@myst-theme/article': patch
'@myst-theme/site': patch
'@myst-theme/book': patch
---

Added ability to start thebe sessions for notebooks on the correct path such that relative importants and file loading will work. As a result base `myst` packages have also been upgraded, mainly for types so we can consume the new `location` field appropraitely, that holds the path information.
