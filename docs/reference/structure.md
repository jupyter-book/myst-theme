---
title: Structure
---

# Page Structure


## Centered Content

:::{div}
:class: text-center

This content is centered using a div with text-center class.
:::


## Multiple Columns

::::{grid} 2

:::{grid-item}
### Left Column

Content in the left column with its own heading and structure.

- Point 1
- Point 2
:::

:::{grid-item}
### Right Column

Content in the right column with separate structure.

- Point A
- Point B
:::

::::

## Margins and Sidebars

### Margins

Margins and sidebars display content alongside the main text (inline on smaller screens).

```{margin} Margin Note
This is a margin note that appears next to the main content.
```

Here's some placeholder text that prevents the following sidebar from overlapping too much.
See the section below for documentation of this bug!

### Sidebars

```{sidebar} Sidebar Title
This is a sidebar with supplementary information.
```

Main content continues here with the sidebar displayed alongside (or above/below on mobile).

### Known issue: overlapping content

If multiple margin or sidebar blocks appear close together without enough main content between them, they may overlap visually. This is a [known bug](https://github.com/jupyter-book/myst-theme/issues/776). Here's an example:

```{margin}
First margin block. If it's long enough then the next margin will overlap with it.

:::{note} Adding some height
And make it overlap with the margin note below.
:::
```

```{margin}
Second margin block.
```

To the right you should see the two margin notes above overlapping one another.

To avoid this, group related margin content into a single block or ensure there is enough main content between margin blocks.

### Complex sidebar example

Sidebars can contain nested content including headings, code blocks, and other directives:

````{sidebar} Complex Sidebar
### Sidebar Heading

Sidebars can contain:

1. Ordered lists
2. Code blocks:

   ```python
   print("Hello")
   ```

3. **Formatted** *text*
````

Main content flows alongside this complex sidebar.
