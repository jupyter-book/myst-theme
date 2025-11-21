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
