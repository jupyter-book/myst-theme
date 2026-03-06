---
title: Widgets
---

This page demonstrates the MyST widget renderer in `myst-theme`.
Widgets follow the [anywidget specification](https://docs.anywidget.dev) and are added using the `{anywidget}` directive.

- For full documentation on using widgets, see the [MyST widgets guide](https://mystmd.org/guide/widgets).
- For more demos, see the [example-widgets repository](https://github.com/jupyter-book/example-widgets).

:::{note} MyST widgets are different from Jupyter widgets
MyST widgets are a specific widget implementation for the MyST Document Engine.
They are similar to Jupyter widgets, and many Jupyter widgets can leverage the MyST Widget stack (if they are `anywidget`-compliant), but they are still two different implementations.
:::

## Example widget structure

The following local widget shows off the main API that widgets use within MyST:

```{literalinclude} src/anywidget-counter.mjs
```


## Local widget via path

This widget includes its own inline styles, so it looks good without any external stylesheet:

```{anywidget} ./src/anywidget-counter.mjs
{
  "count": 0
}
```

You can also provide an additional CSS stylesheet via `:css:` to override or enhance the built-in styles:

```{anywidget} ./src/anywidget-counter.mjs
:css: ./src/anywidget-counter.css
{
  "count": 10
}
```

## Remote widget via URL

The following loads a widget from the [`example-js-anywidget` repository](https://github.com/jupyter-book/example-js-anywidget):

```{anywidget} https://github.com/jupyter-book/example-js-anywidget/releases/latest/download/widget.mjs
```

## Security and best practices

### Do not modify items outside of the `el` element

Widgets have full access to the `document` element of a page, which means they can select, modify, or remove any element on the page.
Don't do this! It will create confusion with React and is generally not a supported workflow, even though it is technically possible.
