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
Ask one of the team members if you need access to the configuration of this.
