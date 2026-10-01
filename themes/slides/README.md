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

## Development

Start a content server for a MyST project, then start the theme:

```sh
myst start --headless
bun run dev
```
