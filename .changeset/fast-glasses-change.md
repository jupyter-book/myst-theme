---
'@myst-theme/jupyter': major
'@myst-theme/common': major
'@myst-theme/article': major
'@myst-theme/book': major
---

Updates the theme to accept a new AST structure for notebook output. These changes are not backwards compatible, and after this change, only the new AST structure is supported. Meaning, content upgrades are required to use the new themes. See https://github.com/jupyter-book/mystmd/pull/1903 for related AST changes.
