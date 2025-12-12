---
'@myst-theme/jupyter': patch
---

Added validation and fallback rendering in the `output` node and softened handling of missing `OutputContext`; both changes avoid pageload errors on unexpected AST content for outputs
