---
title: Testing
---

This project uses [Vitest](https://vitest.dev/) for unit testing, following the same patterns as [mystmd](https://github.com/jupyter-book/mystmd).

## Running Tests

Run all tests across packages:

```bash
# From repository root
npm run test
```

Run tests in a specific package:

```bash
cd packages/<package-name>
npm run test
```

## Test File Locations

Tests are located in one of two places, depending on the package:

1. **Co-located with source** (used by `@myst-theme/common`):
   - Place `.spec.ts` files alongside source files in `src/`
   - Example: `packages/common/src/utils.spec.ts`

2. **Separate test directory** (used by `@myst-theme/jupyter`):
   - Create a `test/` directory in the package root
   - Example: `packages/jupyter/test/thebeOptions.spec.ts`
