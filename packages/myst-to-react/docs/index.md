---
title: myst-to-react
description: myst-to-react is library for converting MyST documents to React.
---

[![myst-to-react on npm](https://img.shields.io/npm/v/myst-to-react.svg)](https://www.npmjs.com/package/myst-to-react)

`myst-to-react` is a library for converting MyST documents into React.

**Goals**

- Convert from `myst-spec` AST documents into React
- Opinionated user interface, but extensible to overwrite components

**Not Goals**

- ...

## Installation

Install the package into your virtual environment using npm:

```bash
npm install myst-to-react
```

## Simple example

```tsx
import { ThemeProvider } from '@myst-theme/providers';
import { MyST, DEFAULT_RENDERERS } from 'myst-to-react';

function MyComponent({ node }) {
  return (
    <ThemeProvider renderers={DEFAULT_RENDERERS}>
      <MyST ast={node.children} />
    </ThemeProvider>
  );
}
```

## Custom Nodes

If you have a custom node of type you can add it to the custom renderers:

```jsx
import { ThemeProvider } from '@myst-theme/providers';
import { MyST, DEFAULT_RENDERERS } from 'myst-to-react';
const RENDERERS = { ...DEFAULT_RENDERERS, MyComponent: MyComponent };
function MyComponent({ node }) {
  return (
    <>
      // add your logic here, and render childrend using MyST.
      <MyST ast={node.children} />
    </>
  );
}
...

// MyST will now be able to render any children that contain a `MyComponent` node.
<ThemeProvider renderers={RENDERERS}>
  <MyST ast={node.children} />
</ThemeProvider>;
```

## Default Renderer

By default, `MyST` will render unknown nodes by either rendering the `.value`
attribute, or rendering each of the children. If you wish to overwrite this
behaviour you can provide a Renderer for the `'DefaultComponent'` key.
