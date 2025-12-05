---
'myst-to-react': patch
'@myst-theme/jupyter': patch
---

Adds frontend validation utility functions and components and uses these at key points intended to prevent full page fatal errors when a particular renderer fails becuase the AST structure does not conform to expectations. Some generic malformed node handling is added so far and a specific case for `output` nodes.
