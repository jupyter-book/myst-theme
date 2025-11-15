---
title: Admonitions
---

# Admonitions

## Basic Admonitions

:::{note}
This is a note admonition.
:::

:::{tip}
This is a tip admonition.
:::

:::{warning}
This is a warning admonition.
:::

:::{important}
This is an important admonition.
:::

:::{danger}
This is a danger admonition.
:::

## With Custom Title

:::{note} Custom Title
Admonitions can have custom titles.
:::

:::{warning} Proceed with Caution
Warnings with descriptive titles.
:::

## Nested Admonitions

::::{note}
Outer note admonition.

:::{warning}
Nested warning inside the note.
:::

Back to outer note.
::::

## Rich Content

:::{tip} With Code and Lists
Admonitions can contain:

- Lists and **formatting**
- Code blocks

```python
def example():
    return "Hello!"
```
:::

## Dropdowns

:::{dropdown} Click to Expand
Hidden content that expands on click.
:::

:::{note}
:class: dropdown

Admonitions can use `:class: dropdown` to be collapsible.
:::
