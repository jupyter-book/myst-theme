---
description: Test for hover cards
thumbnail: _static/myst-logo-light.svg
---
# Permalinks and URLs

Configuration options for controlling site navigation and URL structure.

## URL Structure

By default, MyST flattens the directory structure when generating URLs.
For example:

A file at

```
a/b/page.md
```

renders at URL

```
/page
```

### Folder structure URLs

To make URLs respect nested folder structure: 

```yaml
site:
  options:
    folders: true
```

For example, a file at

```
a/b/page.md
```

renders at URL 

```
/a/b/page
```

## External and Internal URLs

The following config makes any external URL behave as if it were an internal URL if it matches the pattern:

```yaml
site:
  options:
    internal_domains: "mystmd.org"
```

For example:

- `<https://mystmd.org>` - treated as *internal* URL because the domain matches
- `<https://docs.mystmd.org>` - treated as external URL because of the `docs.` subdomain
- `<https://jupyterbook.org>` - treated as external URL because it doesn't match at all

You can match an exact domain (e.g. `mystmd.org`) or use a wildcard to match a single subdomain level. Matches will only be for that subdomain level, not deeper ones, and will not match the root domain (e.g. `*.mystmd.org` matches `docs.mystmd.org` but not `a.b.mystmd.org` or `mystmd.org`).

