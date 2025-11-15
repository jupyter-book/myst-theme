# Live preview changes to the themes

To interact with the themes in development mode (e.g. with live-reload of components and styles as you are making changes), you need three things running at the same time (each in a different terminal window):

1. Content: A content server that serves AST to the theme server.
2. Theme: A dev server that watches for changes to this theme and re-builds it automatically.
3. Theme: The theme server / renderer application.

## Start a content server

First, start [a content server application](https://mystmd.org/guide/developer#content-server) in another MyST site. For example, with our docs:

```bash
# Terminal 1
cd docs/
myst start --headless
```

The content server parses MyST content into AST. By using `--headless`, we tell the content server **not** to start its own theme server.

## Start a development server

Next, start the dev server which will look for local changes and ensure they're being used in previews.

```bash
# Terminal 2
npm install
npm run dev
```

## Start a theme server

Finally, start the theme server application, which will take the AST from the content server in Terminal 1 and render it for you to preview:

```shell
# Terminal 3
$ npm run theme:book
```

## Preview your changes

Open the port that is printed in the terminal for your theme server (usually, `https://localhost:3000`). The theme server will start serving the AST from the content as a website at that port.

## Use a custom port

By default, the theme server will use the same port as the content server for changes to the AST. If you'd like to use a custom port, you can do so like this:

```bash
myst start --headless --server-port 3111
CONTENT_CDN_PORT=3111 npm run theme:book
```

To connect to a remote content server, set the `CONTENT_CDN` environment variable:

```bash
CONTENT_CDN=https://remote.example.com npm run theme:book
CONTENT_CDN=https://remote.example.com npm run theme:article
```

## Preview components and UI with storybook

We have a lightweight [storybook](https://storybook.js.org/) configuration, which is another way to preview the design of these components.

This is the same tool that powers [the MyST Theme components documentation](https://jupyter-book.github.io/myst-theme/?path=/docs/components-introduction--docs).

To use Storybook:

First, run storybook:

```shell
# Terminal 1
npm run storybook
```

Then, run a development server:

```shell
# Terminal2
$ npm run dev
```
