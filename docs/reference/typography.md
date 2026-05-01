---
title: Typography
abbreviations:
  HOVER: Wow a hoverable abbreviation
---

# Heading Level 1

Some text.

## Heading Level 2

Some text.

### Heading Level 3

Some text.

#### Heading Level 4

Some text.

##### Heading Level 5

Some text.

## Paragraphs

This is a regular paragraph. It contains normal text flow and demonstrates the default paragraph styling used throughout the theme. Multiple sentences form a cohesive block of content.

This is a second paragraph, separated from the first by a blank line. Paragraph spacing and line height contribute to overall readability and visual hierarchy.

## Text Formatting

### Bold and Italic

- **This text is bold**
- _This text is italic_
- **_This text is bold and italic_**

### Underline and Strikethrough

- {strike}`This text has strikethrough`
- <u>This text is underlined</u>

### Inline Code

Use `inline code` for variable names, file paths like `/path/to/file`, or short code snippets.

### Keyboard Input

Press {kbd}`Ctrl+C` to copy, {kbd}`Ctrl+V` to paste, or {kbd}`Ctrl+Alt+Delete` for system options.

### Subscript and Superscript

- Water molecule: H{sub}`2`O
- Squared: x{sup}`2`
- Chemical: CO{sub}`2`
- Exponent: 2{sup}`n`

### Download links

- {download}`tables.md`

### Abbreviations

{abbr}`HTML (HyperText Markup Language)` is used for web structure.

{abbr}`CSS (Cascading Style Sheets)` styles web pages.

{abbr}`JS (JavaScript)` adds interactivity.

### Small Caps

The {smallcaps}`HTML` specification defines web standards.

## Links and terms

- External link: [MyST Markdown](https://mystmd.org)
- External link with hover: [](https://doi.org/10.25080/hwcj9957)
- Internal link to file: [](tables.md)
- Internal link to file w/ metadata for hover: [](../permalinks.md)
- Internal link to label with hover: [](#math)
- Hover-only text: HOVER

## Buttons

{button}`Click Me! <https://mystmd.org>`

(math)=

## Math

### Inline Math

The equation $E = mc^2$ represents mass-energy equivalence.

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

Inline math like $\alpha + \beta = \gamma$ flows with text.

### Display Math

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\begin{align*}
P(\text{Third Year} ~\Big\vert~ \text{Declared}) 
~ &=~ \frac{ 0.4 \times 0.8}{0.6 \times 0.5 ~+~ 0.4 \times  0.8} \\ \\
&=~ \frac{\text{(prior probability of Third Year)} \times
\text{(likelihood of Declared given Third Year)}}
{\text{total probability of Declared}}
\end{align*}
$$

## Special Characters

- Em dash: —
- En dash: –
- Ellipsis: …
- Copyright: ©
- Trademark: ™
- Registered: ®
- Arrows: → ← ↑ ↓ ↔
- Bullets: • ‣ ⁃
- Math: × ÷ ± ≠ ≈ ≤ ≥

## Footnotes

Here is a statement with a footnote[^1].

Another statement with another footnote[^note].

[^1]: This is the first footnote with additional context.

[^note]: This is a named footnote with more detail and explanation.

## Horizontal Rule

Content above the horizontal rule.

---

Content below the horizontal rule.

## Mixed Inline Elements

This paragraph demonstrates **bold**, _italic_, **_bold italic_**, `code`, [links](https://mystmd.org), math $x^2$, {kbd}`Ctrl+S`, H{sub}`2`O, x{sup}`2`, and {abbr}`API (Application Programming Interface)` all in one place.

## Long Words and Wrapping

This is a test of how the theme handles supercalifragilisticexpialidocious words and URLs like https://example.com/very/long/path/to/some/resource/that/might/cause/wrapping/issues in flowing text.

## Code and Pre

### Inline Code Variants

Single backtick code: `variable_name`

Code with special chars: `<div class="example">`

Code with path: `/usr/local/bin/command`

## Text Alignment

Default paragraph with standard left alignment and natural text flow.

## Emphasis Combinations

- _Italic with `code`_
- **Bold with `code`**
- **_Bold italic with `code`_**
- _Italic with [link](https://mystmd.org)_
- **Bold with [link](https://mystmd.org)**

## Numbers and Units

- Temperature: 72°F or 22°C
- Dimensions: 1920×1080 pixels
- Percentage: 85% complete
- Currency: $1,234.56
- Measurement: 5.2 × 10{sup}`8` meters

## Monospace

`monospace text` vs normal text

`/path/to/file.txt` for file paths

`function_name()` for code references

## Line Breaks

Line one
Line two (with manual break)

Line three

Regular paragraph continues here.

## Nested Formatting

This paragraph has **bold text with _italic inside_ it** and _italic with **bold inside** it_.

## Combined Elements in One Line

**Project:** [MyST Markdown](https://mystmd.org) | **Version:** `1.0.0` | **License:** MIT | **Stars:** 1.2k ⭐

## Unicode Support

Greek: α β γ δ ε ζ η θ

Math: ∑ ∏ ∫ √ ∞ ∂

Arrows: ⇒ ⇐ ⇔ ⇑ ⇓

Symbols: ♠ ♣ ♥ ♦ ★ ☆

Emoji: 🎉 🚀 📚 💡 ✨

## Quote Marks and Apostrophes

"Double quotes" and 'single quotes'

Apostrophe's in contractions

Nested "quotes 'within' quotes"
