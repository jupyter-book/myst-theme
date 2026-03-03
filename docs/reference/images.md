---
title: Images & Figures
---

# Images & Figures


## Basic Image

Here's an image in block form:

![MyST Logo](../_static/myst-logo-light.svg)


## Inline Images

Text before ![MyST Logo](../_static/myst-logo-light.svg) text after. This image should appear inline with the text, without line breaks before or after it.

## Linked image

[![MyST Logo](../_static/myst-logo-light.svg)](https://google.com)

Linked inline: [![MyST Logo](../_static/myst-logo-light.svg)](https://google.com)

Linked in a card:

:::{note} Here's a linked image
% Should display as block
[![MyST Logo](../_static/myst-logo-light.svg)](https://google.com)

% Should display as inline
Inline: [![MyST Logo](../_static/myst-logo-light.svg)](https://google.com)
:::

## Inline in lists

- Text before ![MyST Logo](../_static/myst-logo-light.svg) text after within a list item.
- Second item without an image for comparison.

## Inline in tables

:::{note}
Images in tables are currently rendered at full size, even when inline with text.
See [#761](https://github.com/jupyter-book/myst-theme/issues/761) for tracking.
:::

| Description | Inline image |
| ----------- | ------------ |
| Text before ![MyST Logo](../_static/myst-logo-light.svg) text after | Works inside table cells too |

## Standalone images in tables

Images alone in table cells (like contributor cards) should display at their natural size:

| Logo 1 | Logo 2 | Logo 3 |
| :----: | :----: | :----: |
| ![MyST](../_static/myst-logo-light.svg) | ![MyST](../_static/myst-logo-dark.svg) | ![MyST](../_static/myst-logo-light.svg) |

## Inline in definition lists

Term with logo
: Text before ![MyST Logo](../_static/myst-logo-light.svg) text after inside a definition description.

## Images in grids

::::{grid} 3
:::{grid-item}
```{image} ../_static/myst-logo-light.svg
```
:::
:::{grid-item}
```{image} ../_static/myst-logo-light.svg
```
:::
:::{grid-item}
```{image} ../_static/myst-logo-light.svg
```
:::
::::

## Figure with Caption

:::{figure} ../_static/myst-logo-light.svg
:name: fig-example
:width: 300px

Figure with caption and reference label.
:::

Reference: {numref}`fig-example`

## Figure Alignment

:::{figure} ../_static/myst-logo-light.svg
:width: 200px
:align: center

Centered figure.
:::

## Side-by-Side (Grid)

::::{grid} 2

:::{figure} ../_static/myst-logo-light.svg
:width: 100%

Light theme
:::

:::{figure} ../_static/myst-logo-dark.svg
:width: 100%

Dark theme
:::

::::
