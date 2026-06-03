---
title: Icons
---

# ScienceIcons

[scienceicons](https://github.com/continuous-foundation/scienceicons) is a collection of icons that are relevant to the scientific community.
It offers a plugin that you can use to create a `{scienceicon}` role.
The MyST themes know how to render the nodes that this role creates.

## Enable the Plugin

First enable the scienceicons plugin.
Add this to `myst.yml`:

```yaml
project:
  plugins:
    - https://unpkg.com/@scienceicons/myst@1.0.4/dist/scienceicons.mjs
```

This enables the role described below:

## Science Icons Role

Inline:

```
{scienceicon}`jupyter` {scienceicon}`github` {scienceicon}`orcid`
```
{scienceicon}`jupyter` {scienceicon}`github` {scienceicon}`orcid`

These are useful if you want to create an **icon link**:

```
[{scienceicon}`github`](https://github.com/jupyter-book/myst-theme)
```

[{scienceicon}`github`](https://github.com/jupyter-book/myst-theme)

The `scicon` alias is a helpful short-hand for the same thing:

```
{scicon}`jupyter-book`
```
{scicon}`jupyter-book`


## All Supported Icon Names

See the [list of supported icons](https://app.unpkg.com/@scienceicons/myst@1.0.4/files/src/names.json) for a list of the names available.
