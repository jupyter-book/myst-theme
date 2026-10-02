# Slides theme demo

A MyST project that shows the features of the slides theme.

1. Build the theme in the repository root:

   ```sh
   make THEME=slides build-theme
   ```

2. Start MyST in this folder:

   ```sh
   myst start --execute
   ```

   To work on the theme with live reload, start the content server with `myst start --headless --execute`, and then run `bun run dev` in the parent folder.

3. Open <http://localhost:3000>.

The `slides.md` deck uses JupyterLite to run code in the browser.
To use a local Jupyter server instead, change `jupyter` in `myst.yml` and start the server:

```sh
jupyter server --IdentityProvider.token=my-token --ServerApp.allow_origin='*'
```
