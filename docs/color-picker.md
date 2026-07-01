---
title: Live color picker
---

Use the picker to experiment with the MyST color tokens live.
Every component on this page reads from the same tokens, so changes propagate instantly.

When you've settled on a palette, copy the generated CSS into a stylesheet in your own site.
Remember to do this for both light and dark modes.
See [Theming](./theming.md) for how to wire up the CSS.

````{anywidget} ./src/color-picker.mjs
:css: ./src/color-picker.css
````

## Sample components

### Admonitions

:::{note}
Info group: `--myst-color-info`, `--myst-color-info-bg`, `--myst-color-info-text`. Used by `{note}`, `{important}`, and `{seealso}`.
:::

:::{tip}
Tip group: `--myst-color-tip`, `--myst-color-tip-bg`, `--myst-color-tip-text`. Used by `{tip}` and `{hint}`. Defaults to the success color.
:::

:::{warning}
Warning group: `--myst-color-warning`, `--myst-color-warning-bg`, `--myst-color-warning-text`. Used by `{warning}`, `{attention}`, and `{caution}`.
:::

:::{danger}
Danger group: `--myst-color-danger`, `--myst-color-danger-bg`, `--myst-color-danger-text`. Used by `{danger}` and `{error}`.
:::

A simple admonition (`:class: simple`) uses `--myst-color-surface` for its background instead of a colored header.

:::{note}
:class: simple
Simple style — background is `--myst-color-surface`.
:::

### Exercise and proof blocks

`{exercise}`, `{solution}`, and `{proof}` blocks use three color groups determined by the proof kind.

:::{prf:criterion}
Example group: `--myst-color-example`, `--myst-color-example-bg`, `--myst-color-example-text`.
Used by criterion, corollary, and property kinds.
:::

:::{prf:theorem}
Theorem group: `--myst-color-theorem`, `--myst-color-theorem-bg`, `--myst-color-theorem-text`.
Used by lemma, conjecture, and theorem kinds.
:::

:::{prf:proof}
Proof group: `--myst-color-proof`, `--myst-color-proof-bg`, `--myst-color-proof-text`.
Used by proof and algorithm kinds, and by default `{solution}` blocks.
:::

### Cards

Card borders use `--myst-color-border`; card headers and footers use `--myst-color-bg-secondary`.

:::{card} Card header (`--myst-color-bg-secondary`)
Card body — sits on the page background (`--myst-color-bg`).

+++
Card footer (`--myst-color-bg-secondary`).
:::

### Dropdowns

The closed dropdown header uses `--myst-color-bg-secondary`.

:::{dropdown} Dropdown header (`--myst-color-bg-secondary`)
Expanded body content.
:::

### Tab sets

The active tab label and bottom border use `--myst-color-active`; inactive tab labels use `--myst-color-text-tertiary`. The tab row sits on `--myst-color-border`.

::::{tab-set}
:::{tab-item} Active tab
Active tab label: `--myst-color-active`.
:::
:::{tab-item} Inactive tab
Inactive tab label: `--myst-color-text-tertiary`.
:::
::::

### Code

The filename bar uses `--myst-color-bg-secondary` and `--myst-color-border`; the filename text uses `--myst-color-text-secondary`.

```{code-block} python
:filename: example.py
def hello():
    print("code blocks are styled by highlight.js")
```

### Prose and typography

Regular prose paragraphs use `--myst-color-prose-body`. [Links](https://mystmd.org) use `--myst-color-link` and `--myst-color-link-underline`. `Inline code` uses `--myst-color-code`. Keyboard shortcuts like {kbd}`Ctrl+C` use `--myst-color-kbd-shadow` for the key shadow.

### Table

Table borders use `--myst-color-border` and `--myst-color-border-strong`.

| Column A | Column B | Column C |
|---|---|---|
| Row 1, cell 1 | Row 1, cell 2 | Row 1, cell 3 |
| Row 2, cell 1 | Row 2, cell 2 | Row 2, cell 3 |
| Row 3, cell 1 | Row 3, cell 2 | Row 3, cell 3 |

### Error states

`--myst-color-error`, `--myst-color-error-bg`, and `--myst-color-error-text` are used for UI error states such as unknown or invalid directives, failed output renders, and form validation. They are not used for content-level admonitions (use `{danger}` for that).

### Navigation and interaction tokens

Some tokens are only visible in the site navigation and UI, or require user interaction to trigger:

- **Page background**: `--myst-color-bg` — the page itself; `--myst-color-bg-secondary` also appears in the sidebar and nav panels.
- **Current-page highlight**: `--myst-color-active-bg` — the sidebar TOC highlights the active page entry.
- **Section heading in TOC**: `--myst-color-accent-text` — bold section titles in the sidebar use this color.
- **Document outline**: `--myst-color-active-surface` — the in-page heading tracker on the right.
- **Focus indicators**: `--myst-color-focus-ring`, `--myst-color-focus-outline` — tab through the page to see focus rings on interactive elements.
- **Primary color**: `--myst-color-primary` — the page-load progress bar and download/launch buttons.
- **Hover popover**: `--myst-color-inverse-bg`, `--myst-color-inverse-text` — hover over a cross-reference or footnote to see the popover tooltip.
