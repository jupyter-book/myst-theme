# myst-theme-patches

A minimal repository containing essential patches for myst-theme development

## Usage

This repository contains patches created with the [`patch-package`](https://www.npmjs.com/package/patch-package) module.

The core [`myst-theme` repository](https://github.com/executablebooks/myst-theme) includes this as a gitsubmodule and invokes the package using a `post-install` script in the monorepo's main `package.json` file as:

```json
...
"scripts": {
    "postinstall": "patch-package --patch-dir myst-theme-patches"
},
...
```

If developing a theme in a different repository that utilizes `myst-theme` packages you will need to include this repo are a submodule or otherwise clone it and reference it in a postinstall script in your theme's `package.json` file.
