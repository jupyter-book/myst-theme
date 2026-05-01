# Build static HTML for the Netlify previews

We use Netlify to build the latest version of this theme from Pull Requests, and provide a preview.
Ask one of the team members if you need access to its configuration.

## Quick command

To build a static version of the documentation in `docs/` (e.g., for Netlify builds), run:

```bash
make build-docs
```

## What `make build-docs` does

The command is a shorthand for three steps:

1. **Install dependencies** – grabs the Python requirements for doc execution plus the JS packages used by the theme.
2. **Build the local theme bundle** – runs `make build-book`, which writes the theme assets into `.deploy/book`. This is configured in `docs/myst.yml` in the `template:` key.
3. **Render the docs** – executes `myst build --execute --html` so the docs in `docs/` are rendered using the freshly built theme bundle.

Running those steps manually looks like this:

```bash
pip install -r docs/requirements.txt
npm install
make build-book
cd docs
myst build --execute --html
```

The rendered HTML is written to `docs/_build/html`, ready for Netlify to serve (or for you to preview locally).
