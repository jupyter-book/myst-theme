---
title: Syntax Reference
description: Comprehensive reference for all MyST Markdown syntax features
---

# MyST Markdown Syntax Reference

This page demonstrates all MyST Markdown syntax features supported by the theme.

## Basic Text Formatting

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***.

You can also use {strike}`strikethrough`, <u>underline</u>, and {kbd}`Ctrl+C` for keyboard shortcuts.

Inline `code` formatting and [external links](https://mystmd.org) work too.

## Headings

MyST supports heading levels 1-6:

- `# Heading 1`
- `## Heading 2`
- `### Heading 3`
- `#### Heading 4`
- `##### Heading 5`

## Lists

### Unordered Lists

- First item

  First item sentence two.

  First item sentence three.
- Second item
  - Nested item
  - Another nested item
    - Deeply nested item
- Third item

### Ordered Lists

1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested numbered item
3. Third numbered item

### Task Lists (Checkboxes)

- [ ] Unchecked task item that's really long. Unchecked task item that's really long. Unchecked task item that's really long. Unchecked task item that's really long. 
- [x] Checked task item
- [ ] Another unchecked task
  - [x] Nested checked task
  - [ ] Nested unchecked task

### Definition Lists

Term 1
: Definition of term 1

Term 2
: First definition of term 2
: Second definition of term 2

## Links and References

### External Links

Visit [MyST Markdown](https://mystmd.org) for more information.

### Internal Links

Link to [another section](#tables) on this page.

### Reference-style Links

This is a [reference link][ref1] and another [reference link][ref2].

[ref1]: https://mystmd.org
[ref2]: https://jupyter.org

## Tables

### Basic Table

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Aligned Table

| Left | Center | Right |
|:-----|:------:|------:|
| L1   | C1     | R1    |
| L2   | C2     | R2    |

### Table with Markdown

| Feature | Supported | Notes |
|---------|-----------|-------|
| **Bold** | ✓ | Works in tables |
| *Italic* | ✓ | Also supported |
| `code` | ✓ | Inline code too |

## Code

### Inline Code

Use the `print()` function in Python or `console.log()` in JavaScript.

### Code Blocks

```python
def hello_world():
    """A simple greeting function."""
    print("Hello, World!")
    return True

# Call the function
hello_world()
```

```javascript
function helloWorld() {
  // A simple greeting function
  console.log("Hello, World!");
  return true;
}

helloWorld();
```

### Code Block with Line Numbers

```{code-block} python
:linenos:
:emphasize-lines: 2, 4

def calculate_sum(a, b):
    """Calculate the sum of two numbers."""
    result = a + b
    return result
```

## Math

### Inline Math

The equation $E = mc^2$ represents mass-energy equivalence.

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

### Display Math (Block)

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\frac{d}{dx} \left( \int_{0}^{x} f(u) du \right) = f(x)
$$

## Directives

### Notes and Admonitions

```{note}
This is a note admonition. It's useful for highlighting important information.
```

```{warning}
This is a warning admonition. Use it to warn users about potential issues.
```

```{tip}
This is a tip admonition. Share helpful tips with your readers.
```

```{caution}
This is a caution admonition. Similar to warning but for less severe cases.
```

```{danger}
This is a danger admonition. Use for critical warnings.
```

```{attention}
This is an attention admonition.
```

```{error}
This is an error admonition.
```

```{hint}
This is a hint admonition.
```

```{important}
This is an important admonition.
```

```{seealso}
This is a "see also" admonition. Reference related content here.
```

### Admonition with Title

```{note} Custom Title
You can customize the title of any admonition block.
```

### Nested Admonitions

````{note}
This is the outer note.

```{warning}
This is a nested warning inside a note!
```

Back to the outer note content.
````

### Dropdown (Collapsible)

```{dropdown} Click to expand
This content is hidden by default and can be expanded by clicking.

- It can contain any MyST content
- Including lists
- And other directives
```

## Figures and Images

### Basic Image

![MyST Logo](./_static/myst-logo-light.svg)

### Figure with Caption

```{figure} ./_static/myst-logo-light.svg
:name: my-figure
:width: 300px
:align: center

This is a caption for the figure. You can reference it using {numref}`my-figure`.
```

## Blockquotes

> This is a blockquote.
>
> It can span multiple lines and paragraphs.
>
> > Nested blockquotes are also supported.

## Horizontal Rules

Use three or more hyphens, asterisks, or underscores:

---

***

___

## Special Inline Markup

### Subscript and Superscript

- Water molecule: H{sub}`2`O
- Einstein: E = mc{sup}`2`
- Chemical formula: CO{sub}`2`
- Exponent: x{sup}`n+1`

### Abbreviations

{abbr}`HTML (HyperText Markup Language)` is the standard markup language.

{abbr}`CSS (Cascading Style Sheets)` is used for styling.

### Small Caps

The {smallcaps}`HTML` specification defines web standards.

## Comments

% This is a comment and won't be rendered

%% This is also a comment
%% It can span multiple lines

## Footnotes

Here is a statement with a footnote[^1].

Another statement with another footnote[^note].

[^1]: This is the first footnote.
[^note]: This is a named footnote with more detail.

## Targets and Cross-References

(my-target)=
### This Section Has a Target

You can reference [this section](my-target) from anywhere.

## Containers and Panels

```{div}
This is a div container with a custom class.
```

## Sidebars

```{sidebar} Sidebar Title
This content appears in a sidebar next to the main content.

It's useful for supplementary information.
```

## Margins

```{margin}
This content appears in the margin. It's great for side notes and comments.
```

## Epigraphs

```{epigraph}
"The best way to predict the future is to invent it."

-- Alan Kay
```

## Topics

```{topic} Special Topic
This is a topic block for special content that deserves highlighting.
```

## Glossary

```{glossary}
Term One
: Definition of term one.

Term Two
: Definition of term two with more detail.
```

## Buttons

{button}`Click Me! <https://mystmd.org>`


## Cards

::::{grid} 2
:::{card} Card 1
Card content 1
:::
:::{card} Card 2
Card content 2
:::
::::

## Raw HTML/LaTeX

<div style="color: red;">
This is raw HTML content.
</div>


## Include Content

```{include} requirements.txt
```

```{literalinclude} requirements.txt
```

## Special Characters

- Em dash: —
- En dash: –
- Ellipsis: …
- Copyright: ©
- Trademark: ™
- Registered: ®
- Arrows: → ← ↑ ↓
