---
title: Live color picker
---

Use the picker to experiment with the MyST color tokens live.
Every component on this page reads from the same tokens, so changes propagate instantly.

When you've settled on a palette, copy the generated CSS into a stylesheet in your own site.
See [Theming](./theming.md) for how to wire it up.

````{anywidget} ./src/color-picker.mjs
:css: ./src/color-picker.css
````

## Sample components

:::{note}
This is a note admonition. It uses `--myst-color-info`, `--myst-color-info-bg`, and `--myst-color-info-text`.
:::

:::{tip}
This is a tip — it shares the success color group.
:::

:::{warning}
This is a warning — it uses the warning color group.
:::

:::{danger}
This is a danger admonition — it uses the danger color group.
:::

A paragraph with a [link](https://mystmd.org) and some `inline code`.
The link color comes from `--myst-color-link`, and inline code uses `--myst-color-code`.

```python
def hello():
    print("code blocks are styled by highlight.js")
```
