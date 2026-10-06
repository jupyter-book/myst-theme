import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import getPort from 'get-port';
import path from 'node:path';

// Test for old mystmd builds that set MODE==="static"
if (process.env.MODE === 'static') {
  console.error(
    `Your version of mystmd (or jupyter-book) does not support this version of the MyST theme. 

To resolve this error, either:

- Upgrade mystmd/jupyter-book.
- Specify an older version of this theme in your myst.yml.

The newest supported theme for your document engine version is '1.4.1'. 
Set the following configuration in your myst.yml to use this version:

site:
  template: https://github.com/jupyter-book/myst-theme/releases/download/myst-to-react%401.4.1/article-theme.zip
`,
  );
  process.exit(1);
}

const IS_PRODUCTION = (process.env.NODE_ENV ?? 'production') === 'production';
const HOST = process.env.HOST || 'localhost';
const PORT =
  process.env.PORT !== undefined
    ? Number.parseInt(process.env.PORT)
    : await getPort({ port: getPort.makeRange(3000, 3100) });

// console.log(`Starting ${IS_PRODUCTION ? 'production' : 'development'} server`);

const viteDevServer = IS_PRODUCTION
  ? undefined
  : await import('vite').then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
    );

type ServerBuild = Awaited<typeof import('virtual:react-router/server-build')>;
const serverBuild: ServerBuild = viteDevServer
  ? ((await viteDevServer.ssrLoadModule('virtual:react-router/server-build')) as any)
  : await import('virtual:react-router/server-build');

const reactRouterHandler = createRequestHandler({
  build: serverBuild,
});

const app = express();
app.use(compression());
app.use(morgan('tiny'));
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  const baseName = serverBuild.basename ?? '/';
  // Prod builds put us under e.g. <root><base>/server/index.js
  const CLIENT_PATH = path.join(path.dirname(import.meta.dirname), 'client');
  // Serve client assets from <root>/<base>/client
  app.use(baseName, express.static(CLIENT_PATH, { immutable: true, maxAge: '1y' }));
  // Serve public assets from <root>/public
  app.use(
    baseName,
    express.static(path.join(path.dirname(path.dirname(CLIENT_PATH)), 'public'), { maxAge: '1h' }),
  );
}
app.use(reactRouterHandler);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
