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

## Inline in lists

- Text before ![MyST Logo](../_static/myst-logo-light.svg) text after within a list item.
- Second item without an image for comparison.

## Inline in tables

| Description | Inline image |
| ----------- | ------------ |
| Text before ![MyST Logo](../_static/myst-logo-light.svg) text after | Works inside table cells too |

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
