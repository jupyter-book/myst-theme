# User Interface Components

This page documents site-level UI components that appear on every page. Both components use the same configuration pattern through `project.parts` in `myst.yml`.

## Banner

Display an announcement bar at the top of your site.

### Configuration

Create a markdown file with your banner content and add it to `myst.yml`:

```yaml
project:
  parts:
    banner: _site/banner.md
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
project:
  parts:
    footer: _site/footer.md
```

### Behavior

- Appears at the bottom of every page
- Supports any MyST markdown content (links, formatting, etc.)
