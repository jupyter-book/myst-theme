---
title: MyST meets reveal.js
subtitle: A slides theme
authors:
  - name: Ada Lovelace
    affiliations:
      - Analytical Engine Society
    orcid: 0000-0002-1825-0097
    github: example
    bluesky: ada.example.org
    mastodon: "@ada@example.org"
    url: https://example.org/ada
date: 2026-10-01
kernelspec:
  name: python3
  display_name: Python 3
---

## Plain slide

Some text with **bold** and $e^{i\pi} + 1 = 0$, written in MyST [@jupyterbook2025; @doi:10.25080/nkvc9349].

- one
- two

---

A slide without a heading.

:::{div}
:class: notes
These are speaker notes.
:::

## Fragments

:::{div}
:class: fragment
First appears.
:::

:::{div}
:class: fragment fade-up
Then this.
:::

## Executed code

```{code-cell} python
:tags: [remove-stderr]
import sys
if sys.platform == 'emscripten':  # JupyterLite: install packages in the browser
    import piplite
    await piplite.install('ipywidgets')

import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 200)
fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(x, np.sin(3 * x), linewidth=3)
ax.set_xlabel('x')
ax.set_ylabel('sin(3x)')
plt.show();
```

## Live Python widget

Press the power button, then run the cell.

```{code-cell} python
:tags: [remove-stderr]
:class: side-by-side
import ipywidgets as widgets

xx, yy = np.meshgrid(np.linspace(-5, 5, 300), np.linspace(-5, 5, 300))
r2 = xx**2 + yy**2

@widgets.interact(sigma=(0.5, 2.5, 0.1))
def mexican_hat(sigma=1.0):
    z = (1 - r2 / sigma**2) * np.exp(-r2 / (2 * sigma**2))
    fig, ax = plt.subplots(figsize=(4, 4))
    ax.imshow(z, cmap='viridis', vmin=-0.5, vmax=1, extent=(-5, 5, -5, 5))
    ax.set_title(f'σ = {sigma:.1f}, computed on {sys.platform}')
    ax.set_axis_off()
    plt.show();
```

## Interactive JavaScript widget

Drag the slider to change the frequency.

```{anywidget} ./slider-plot.mjs
{"frequency": 3, "min": 0.5, "max": 8}
```

## Two columns

::::{grid} 2
:::{grid-item}
Left column text.

- a
- b
:::
:::{grid-item}
```{figure} waves.svg
Right column figure.
```
:::
::::

+++ {"background-color": "#1e3a8a"}

## Blue background

# A theorem

:::{proof:theorem} Pythagoras
:label: thm-pythagoras
For a right triangle with legs $a$ and $b$ and hypotenuse $c$,

$$a^2 + b^2 = c^2.$$
:::

## Its proof

:::{proof:proof}
:nonumber:
Arrange four copies of the triangle inside a square of side $a + b$.
The uncovered area is $c^2$, and also $(a + b)^2 - 2ab = a^2 + b^2$.
:::

[](#thm-pythagoras) follows.

# Section

The section title slide.

## Below section

A vertical slide.

## Also below

```python
def f(x):
    return x**2
```

+++ {"auto-animate": true}

## Figure

```{figure} waves.svg
:label: fig-pic
A picture.
```

See [](#fig-pic).

+++

# Thank you

Slides made with [MyST Markdown](https://mystmd.org) and [reveal.js](https://revealjs.com).

```{slide-authors}
:socials:
```

```{slide-socials}
```
