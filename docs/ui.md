# User Interface Components

This page documents site-level UI components that appear on every page. Both components use the same configuration pattern through `site.parts` or `project.parts` in `myst.yml`.

## Banner

Display an announcement bar at the top of your site.

### Configuration

Create a markdown file with your banner content and add it to `myst.yml`:

```yaml
site:
  parts:
    banner: _site/banner.md
```

or directly as text:

```yaml
site:
  parts:
    banner: My banner [content](https://mystmd.org)!
```

### Behavior

- Appears at the top of every page, above the navigation
- Users can dismiss it by clicking the X button
- Dismissal persists in the browser
- Will expand vertically if extra content is in it
- If you change the banner content, it will reappear for all users

## Footer

Display custom content at the bottom of every page.

### Configuration

Create a markdown file with your footer content and add it to `myst.yml`:

```yaml
site:
  parts:
    footer: _site/footer.md
```

### Behavior

- Appears at the bottom of every page
- Supports any MyST markdown content (links, formatting, etc.)

## Sidebar Footer

Display custom content at the bottom of the primary sidebar (table of contents).

### Configuration

Create a markdown file with your sidebar footer content and add it to `myst.yml`:

```yaml
site:
  parts:
    primary_sidebar_footer: _site/primary_sidebar_footer.md
```

### Behavior

- Appears at the bottom of the primary sidebar (left-side navigation)
- If the `.md` file it points to is empty, the footer will not be visible
- If not configured, falls back to the default "Made with MyST" footer

## Navbar Icons

Display icon links in the navigation bar for social media, GitHub, and other external resources.

### Configuration

Add icons to your site's navbar through `site.options.navbar_icons`:

```yaml
site:
  options:
    navbar_icons:
      - icon: github
        url: https://github.com/your-org/your-repo
      - icon: discord
        url: https://discord.gg/your-server
      - icon: bluesky
        url: https://bsky.app/profile/your-profile
```

Each icon requires:

- `icon`: The icon name (see supported icons below)
- `url`: The external URL to link to
- `title` (optional): Custom tooltip text

### Supported Icons

| Icon name | Description |
|-----------|-------------|
| `github` | GitHub |
| `twitter` or `x` | X (Twitter) |
| `bluesky` | Bluesky |
| `discord` | Discord |
| `mastodon` | Mastodon |
| `linkedin` | LinkedIn |
| `youtube` | YouTube |
| `slack` | Slack |
| `email` | Email |
| `rss` | RSS Feed |
| `link` or `website` | Generic external link |

## Hiding Elements

Control the visibility of various page elements. All options can be set site-wide or per-page.

### Hide Authors

Hide the author and affiliations list from the frontmatter block.

```yaml
site:
  options:
    hide_authors: true
```

### Hide Table of Contents

Hide the left sidebar table of contents.

```yaml
site:
  options:
    hide_toc: true
```

### Hide Outline

Hide the right sidebar document outline.

```yaml
site:
  options:
    hide_outline: true
```

### Hide Title Block

Hide the entire frontmatter block (title, authors, date, etc.).

```yaml
site:
  options:
    hide_title_block: true
```

### Hide Footer Links

Hide the previous/next navigation links at the bottom of each page.

```yaml
site:
  options:
    hide_footer_links: true
```

### Hide Search

Disable the search functionality.

```yaml
site:
  options:
    hide_search: true
```

### Page-level Overrides

Any of these options can be set on individual pages to override site-wide settings:

```yaml
---
site:
  hide_authors: true
  hide_outline: true
---
```
