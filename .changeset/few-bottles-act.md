---
'@myst-theme/jupyter': patch
---

Defensive changes to avoid runtime issues with deployed content with older mdast. Specifically this guards against not being able to look up notebook scopes in the execution provided because of undefined slugs.
