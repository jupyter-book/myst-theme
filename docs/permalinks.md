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

## Linking to static files

How you link a file determines its URL. See the [MyST downloads guide](https://mystmd.org/guide/website-downloads) for the full reference.

:::{list-table} Static file link behavior
:header-rows: 1

* - Link structure
  - URL you get
  - Notes
  - Example
* - `` {download}`path/to/file.csv` ``
  - `/file-<hash>.csv`
  - Hashed so that URL changes with the contents of the file
  - {download}`assets/downloads/example-data.csv`
* - `[text](path/to/file.csv)` (resolves to a source file)
  - `/file-<hash>.csv`
  - Same as the download role
  - [example-data.csv](assets/downloads/example-data.csv)
* - `[text](/file.csv)` - `static_files` **file** entry
  - `/file.csv`
  - Stable (parent folders dropped)
  - [/standalone.csv](/standalone.csv)
* - `[text](/folder/file.csv)` - `static_files` **folder** entry
  - `/folder/file.csv`
  - Stable (folder name kept, parent dropped)
  - [/downloads/example-data.csv](/downloads/example-data.csv)
:::

A static link only works if its path doesn't match a source file. Declare the file under `static_files` in `myst.yml`, then link to the resulting URL. The live app redirects such unmatched routes to the served file.

Static files are copied to the site root. To link to them, you can provide a link relative to root: `/my_file.pdf` (no need to include `BASE_URL`). Folder structure is preserved, so if `my_folder` is added to `static_files`, you can link to `/my_folder/my_file.pdf`. This is the configuration powering the examples above:

:::{literalinclude} ./myst.yml
:language: yaml
:start-at: static_files:
:end-at: assets/downloads
:::