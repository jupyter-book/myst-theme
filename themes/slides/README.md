# @myst-theme/slides

A MyST theme that shows each page as a [reveal.js](https://revealjs.com) slide deck.

## Usage

```yaml
site:
  template: slides-theme
  options:
    transition: fade
    slide_number: true
```

A project with one page shows that page as a deck at the root URL.
A project with more pages shows the index page at the root URL, with a list of links to the other pages.
Each other page is a deck.

## Slides

- `---` starts a new slide.
- Headings start slides and vertical columns.
  Levels count from the shallowest heading in the page.
  If the page has one heading level, each heading starts a slide.
  If the page has more levels, level 1 starts a column and level 2 starts a slide below it.
  Set `slide_level` to change this.
- The page title, subtitle, authors and date make a title slide.
  Set `hide_title_slide` to remove it.
- If the page has citations, the last slide shows the bibliography.

## Fragments and notes

```markdown
:::{div}
:class: fragment fade-up
Shows on the next step.
:::

:::{div}
:class: notes
Speaker notes. Press `s` to open the speaker view.
:::
```

## Slide attributes

Block metadata sets reveal.js slide attributes on the slide that contains the start of the block.
Keys that start with `background`, `transition` or `auto-animate`, and the keys `visibility`, `state`, `timing` and `autoslide`, become `data-*` attributes.

```markdown
+++ {"background-color": "#1e3a8a", "auto-animate": true}

## A dark slide
```

The `class` key of block metadata adds classes to the block, for example `fragment`.

## Notebooks

The theme reads the Jupyter `slideshow.slide_type` cell metadata, as RISE and `nbconvert --to slides` do.
`slide` starts a column, `subslide` starts a slide in that column, `fragment` shows the cell on the next step, `notes` makes speaker notes, and `skip` removes the cell.
If any cell has this metadata, headings do not start slides.

## Styling

Put your styles in a CSS file and set the `style` option:

```yaml
site:
  template: slides-theme
  options:
    style: slides.css
```

The theme loads this file after its own styles.

### Colors

The theme uses the MyST color tokens.
See [Styling](../../docs/theming.md) for the full list.
These tokens are the most important for slides:

| Token                     | Use                                |
| ------------------------- | ---------------------------------- |
| `--myst-color-bg`         | Slide background                   |
| `--myst-color-prose-body` | Body text                          |
| `--myst-color-text`       | Headings and bold text             |
| `--myst-color-link`       | Links                              |
| `--myst-color-code`       | Inline code                        |
| `--myst-color-border`     | Table borders and horizontal rules |

Light values go in `:root`.
Dark values go in `.dark`.
If you set a token in `:root` only, the dark mode also uses that value.

```css
:root {
  --myst-color-bg: #fdf6e3;
  --myst-color-prose-body: #073642;
  --myst-color-text: #b58900;
}

.dark {
  --myst-color-bg: #002b36;
  --myst-color-prose-body: #eee8d5;
  --myst-color-text: #b58900;
}
```

On a slide with a dark `background-color`, the theme uses the light text colors of Tailwind Typography.

### Fonts and sizes

The theme sets these variables on `:root`:

| Variable                            | Default         | Use                                  |
| ----------------------------------- | --------------- | ------------------------------------ |
| `--myst-slides-font-family`         | Page font       | Slide text                           |
| `--myst-slides-heading-font-family` | Slide text font | Headings                             |
| `--myst-slides-code-font-family`    | Monospace       | Code blocks and inline code          |
| `--myst-slides-font-size`           | `32px`          | Body text; other sizes scale with it |
| `--myst-slides-code-font-size`      | `22px`          | Code blocks and outputs              |
| `--myst-slides-line-height`         | `1.4`           | Body text                            |
| `--myst-slides-text-align`          | `left`          | Slide text                           |

Sizes are in pixels of the slide canvas.
Reveal.js scales the canvas to fit the window.
The `width` and `height` options set the canvas size (default 1280 × 720).

To use a web font, declare it with `@font-face`:

```css
@font-face {
  font-family: 'Inter';
  src: url('https://example.org/fonts/Inter.woff2') format('woff2');
}

:root {
  --myst-slides-font-family: 'Inter', sans-serif;
}
```

An `@import` rule works only if it is the first rule in the served stylesheet.
With the `numbered_references` option, the theme adds rules before your file, and the `@import` rule has no effect.

### Selectors

Use these selectors for other changes:

| Selector                      | Element                       |
| ----------------------------- | ----------------------------- |
| `.reveal.myst-slides`         | The deck                      |
| `.myst-slides section.prose`  | Each slide                    |
| `.myst-title-slide`           | The title slide               |
| `.myst-references-slide`      | The bibliography slide        |
| `section.has-dark-background` | Slides with a dark background |

To style one slide, give a block a class, and select the slide with `:has()`:

```markdown
+++ {"class": "quote-slide"}

## A quote
```

```css
.myst-slides section:has(> .quote-slide) {
  text-align: center;
}
```

The reveal.js themes (`black`, `white` and others) do not apply.
The theme styles slides with the MyST styles and Tailwind Typography.

## Development

Start a content server for a MyST project, then start the theme:

```sh
myst start --headless
bun run dev
```
