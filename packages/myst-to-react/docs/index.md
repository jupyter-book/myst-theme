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
