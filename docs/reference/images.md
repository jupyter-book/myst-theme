---
title: Images & Figures
---

# Images & Figures

## Basic Image

![MyST Logo](../_static/myst-logo-light.svg)

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

## Stacked Sub-Figures

:::{figure}
:label: fig-stacked-example

![MyST logo light theme](../_static/myst-logo-light.svg)

![MyST logo dark theme](../_static/myst-logo-dark.svg)

Example of two sub-figures stacked vertically. Reference the parent figure with {numref}`fig-stacked-example`, or individual subfigures: {numref}`fig-stacked-example-a` and {numref}`fig-stacked-example-b`.
:::
