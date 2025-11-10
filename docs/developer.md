# Developer guide

## Build static HTML from the local documentation

This project comes with a mini documentation site to demonstrate and preview functionality. This section describes how you can build static HTML files for use in preview services like Netlify.

:::{note} For live reloading, see the developer documentation
The `README.md` file for this repository has in-depth information for how you can use a live reload server to preview changes to the theme.
:::

To build static HTML files with the latest theme changes, you must first _build the theme assets_, and then serve the site using the theme. The MyST site at `docs/` is already configured to use this _local_ theme build (in the `.deploy` folder), so to use it, run the following commands:

**Install the dependencies to build the documentation**

This includes both the latest version of MyST, as well as the Python dependencies to run documentation examples. Run the following command to do so:

```bash
pip install -r docs/requirements.txt
```

Then, build the latest version of the theme and preview the local documentation with it

```bash
make build-book
cd docs
myst build --execute --html
```

This will output HTML files for the documentation in `docs/_build/html` that you can re-use elsewhere.

You can also run this with the Make comment:

```bash
make build-docs
```

## Previews in Pull Requests

We use Netlify to build the latest version of this theme from Pull Requests, and provide a preview.
Ask one of the team members if you need access to its configuration.

## Theme development best practices

### Using TabStateProvider for MyST content

When creating components that render MyST content (using `<MyST ast={content} />`), wrap them in a `TabStateProvider` to ensure proper React context is available.
This ensures that interactivity works properly, and doesn't negatively impact _other_ interactive content on a page.

See [`themes/book/app/routes/$.tsx#L98-L121`](https://github.com/jupyter-book/myst-theme/blob/f758f671a883bbdc2e9950ed2da9c0b99fb96720/themes/book/app/routes/$.tsx#L98-L121) for examples of how the Banner and Footer components are wrapped in `TabStateProvider`.

## Add documentation

We have a small demo documentation site in `docs/` to provide guidance for how to use and develop the MyST react themes.
As you add new features, document some basic information for others to use them.

Add a new section (or a page, if it's a big change) with at least:

- One sentence describing of the feature.
- One sentence describing its value and when to use it.
- A few bullet points describing how to use it and expected behavior.

### Documenting vs. in mystmd.org

Currently much of the documentation for the myst-theme is in the [mystmd guide](https://mystmd.org/guide/website-templates).

We are considering moving all of that documentation to the `myst-theme` repository so they are in one place. Follow this issue for details:

https://github.com/jupyter-book/myst-theme/issues/391
