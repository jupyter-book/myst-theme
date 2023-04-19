---
'@myst-theme/site': patch
---

Remove css updates for document nav and outline from React state

```tsx
const { container, toc } = useTocHeight(top);

// Update the nav and article, removing the height
<Navigation tocRef={toc} ... />
<article ref={container} ... />
```
