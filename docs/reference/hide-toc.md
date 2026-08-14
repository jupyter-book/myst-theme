---
title: Hidden sidebars
site:
  hide_toc: true
---

This page sets `site.hide_toc: true` in its frontmatter, like a landing page.
It demonstrates the behavior when there is no table of contents.
Right now this is mostly to demo sidebar behavior.

## Hidden table of contents

- Below the `lg` breakpoint (1024px), the top-bar nav links collapse into a hamburger menu.
  Opening it shows the sidebar with the nav links, behind a darkened overlay.
  Clicking the overlay closes the sidebar.
- At `lg` and above, the nav links are in the top bar, so the sidebar, hamburger, and overlay are all hidden.
  If you open the menu on a narrow window and then widen it past 1024px, the overlay must disappear with the sidebar.

Compare with any other page in these docs, which has a table of contents:
there the sidebar (and its overlay when open) persists up to the `xl` breakpoint (1280px), where the TOC moves into its own column.
