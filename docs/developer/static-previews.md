# Build static HTML for the Netlify previews

We use Netlify to build the latest version of this theme from Pull Requests, and provide a preview.
Ask one of the team members if you need access to its configuration.

To build a static version of the documentation in `docs/` (e.g., for Netlify builds), use this command:

```bash
make build-docs
```

Below is a deeper explanation of what it does.

To build static HTML files with the latest theme changes, you must first _build the theme assets_, and then serve the site using the theme. The MyST site at `docs/` is already configured to use this _local_ theme build in the `.deploy` folder.

**Install the dependencies to build the documentation**

This includes both the latest version of MyST, as well as the Python dependencies to run documentation examples. Run the following command to do so:

```shell
$ pip install -r docs/requirements.txt
$ npm install
```

Then, build the latest version of the theme and preview the local documentation with it

```shell
$ make build-book
$ cd docs
$ myst build --execute --html
```

This will output HTML files for the documentation in `docs/_build/html` that you can re-use elsewhere.
