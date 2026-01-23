---
title: Structure
---

# Page Structure

This page demonstrates structural elements that affect page layout and organization.

## Section Headers

Section headers create the document hierarchy and table of contents structure.

### Subsection

Subsections provide additional levels of organization.

#### Sub-subsection

Deeper nesting for detailed topic breakdown.

##### Fourth Level

Fourth level headings for fine-grained organization.

## Topics

```{topic} Special Topic
This is a topic block. It's used to highlight special content or create a visually distinct section.
```

Regular content continues after the topic block.

````{topic} Another Topic
Topics can contain rich content:

- Lists
- **Bold text**
- `Code snippets`

```python
print("Code blocks too!")
```
````

## Containers

You can add classes to a div using inline syntax:

:::{div .custom-class}
This is a div with an inline class.
:::

Or using the `:class:` option:

:::{div}
:class: another-class

This is a div with a class specified via option.
:::

## Sections with Targets

(target-section-one)=
### Section One

This section has a target label and can be referenced from elsewhere.

(target-section-two)=
### Section Two

Reference to [Section One](#target-section-one) and [Section Two](#target-section-two).

## Table of Contents

The `{contents}` directive generates a table of contents from headings that follow it on the page. The `:depth:` option controls how many heading levels to include.

With `:depth: 1`, only top-level headings are shown:

```{contents}
:depth: 1
```

With `:depth: 2`, subheadings are also included:

```{contents}
:depth: 2
```

## Glossary

```{glossary}
Term One
    Definition of the first term in the glossary.

Term Two
    Definition of the second term with more detail.

Term Three
    Another term with its definition.
```

## Centered Content

:::{div}
:class: text-center

This content is centered using a div with text-center class.
:::

## Highlighted Content

:::{div}
:class: highlight

This content is highlighted or called out visually.
:::

## Full-Width Content

:::{div}
:class: full-width

This content spans the full width of the page, not constrained by normal content width.
:::

## Nested Structure

::::{div}
:class: outer-container

This is outer container content.

:::{div}
:class: inner-container

This is nested inside the outer container.
:::

Back to outer container.

::::

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

Margins and sidebars display content alongside the main text, in the page margin on larger screens.

### Margins

```{margin} Margin Note
This is a margin note. It appears in the page margin next to the main content.
```

Main content flows here while the margin note appears to the side. Margins are useful for supplementary information, citations, or brief asides that complement the main text without interrupting the reading flow. On smaller screens, margin content appears inline with the main content.

Use the `{margin}` directive to create margin notes. You can optionally include a title as an argument to the directive. Margins can contain rich content including **formatted text**, `code`, and [links](https://mystmd.org).

Here's an example with more complex content in the margin:

```{margin}
**Complex Margin**

Margins can have:
- Rich content
- `Code`
- [Links](https://mystmd.org)
```

The main content continues to flow naturally while margin content appears alongside. Margins are best suited for brief notes, citations, or small pieces of supplementary information.

### Sidebars

Sidebars are similar to margins but typically used for more substantial supplementary content.

```{sidebar} Sidebar Title
This is a sidebar. It contains supplementary information that complements the main content.

Sidebars can include:
- Lists
- **Formatting**
- `Code`
```

Main content continues here with the sidebar displayed alongside (or above/below on mobile). Use the `{sidebar}` directive to create sidebars. Like margins, you can include a title as an argument.

### Known issue: overlapping content

When multiple margin or sidebar blocks appear close together without enough main content between them, they may overlap visually. This is a [known bug](https://github.com/jupyter-book/myst-theme/issues/776). Here's an example:

```{margin}
First margin block.
```

```{margin}
Second margin block.
```

To avoid this, group related margin content into a single block rather than using multiple consecutive blocks, or ensure there is enough main content between margin blocks.

### Complex sidebar example

Sidebars can contain more complex nested content including headings, code blocks, and other directives:

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

Main content flows alongside this complex sidebar. You can use sidebars for extended notes, related information, or supplementary material that complements the main narrative.

## Admonition as Structural Element

:::{note} Structural Note
Admonitions can also serve as structural elements to organize content into distinct sections.

They provide visual separation and hierarchy.
:::

:::{important} Another Structural Block
Using different admonition types creates visual variety in the document structure.
:::

## Container with Multiple Elements

:::{div}
:class: complex-section

**Section Title**

Regular paragraph content.

- List item 1
- List item 2

```python
code_block = "example"
```

> A blockquote within the container.

:::

## End of Structure Examples

This page demonstrates various structural elements that control page layout, organization, and content flow in the MyST theme.
