---
title: Structure
description: This has a description so we can test document hover cards.
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

## Margins

```{margin} Margin Note
This is a margin note. It appears in the page margin next to the main content.
```

Main content flows here while the margin note appears to the side.

```{margin}
Margin notes can contain **formatted text**, `code`, and [links](https://mystmd.org).
```

Multiple margin notes can appear at different points in the content.

## Sidebars

```{sidebar} Sidebar Title
This is a sidebar. It contains supplementary information that complements the main content.

Sidebars can include:
- Lists
- **Formatting**
- `Code`
- And more
```

Main content continues here with the sidebar displayed alongside (or above/below on mobile).

```{sidebar} Another Sidebar
Sidebars can appear multiple times throughout the document.
```

More main content with another sidebar present.

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

:::{div .custom-class}
This is a generic div container. It can be styled with custom classes.
:::

## Sections with Targets

(target-section-one)=
### Section One

This section has a target label and can be referenced from elsewhere.

(target-section-two)=
### Section Two

Another section with a target. Reference it using `[link text](target-section-two)`.

Reference to [Section One](#target-section-one) and [Section Two](#target-section-two).

## Table of Contents

### Inline TOC

```{contents}
:depth: 2
```

The above directive would generate an inline table of contents.

### Local TOC

```{contents}
:depth: 1
```

A local TOC shows only sections within the current page.

## Glossary

```{glossary}
Term One
: Definition of the first term in the glossary.

Term Two
: Definition of the second term with more detail.

Term Three
: Another term with its definition.
```

## Index Entries

```{index} single: MyST Markdown
```

```{index} pair: Theme; Documentation
```

Index entries for building a document index.

## Bibliography

```{bibliography}
:filter: docname in docnames
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

:::{div}
:class: outer-container

This is outer container content.

:::{div}
:class: inner-container

This is nested inside the outer container.
:::

Back to outer container.

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

## Panels

:::{panel}
This is panel content. Panels group related content together visually.
:::

## Sidebar with Complex Content

````{sidebar} Complex Sidebar
### Sidebar Heading

Sidebars can contain:

1. Ordered lists
2. Code blocks:

   ```python
   print("Hello")
   ```

3. **Formatted** *text*

And more!
````

Main content flows alongside this complex sidebar.

## Margin with Complex Content

```{margin}
**Margin Title**

Even margins can have:
- Rich content
- `Code`
- [Links](https://mystmd.org)
```

Main content continues here.

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

# Section Title

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
