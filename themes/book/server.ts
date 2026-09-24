import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import getPort from 'get-port';
import path from 'node:path';


const IS_PRODUCTION = process.env.NODE_ENV?? 'production' === 'production';
const HOST = process.env.HOST || 'localhost';
const PORT =
  process.env.PORT !== undefined
    ? Number.parseInt(process.env.PORT)
    : await getPort({ port: getPort.makeRange(3000, 3100) });

const CLIENT_PATH = path.join(path.dirname(import.meta.dirname), 'client');

// console.log(`Starting ${IS_PRODUCTION ? 'production' : 'development'} server`);

const viteDevServer = IS_PRODUCTION
  ? undefined
  : await import('vite').then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
    );

const reactRouterHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
    : await import('virtual:react-router/server-build'),
});

const app = express();
app.use(compression());
app.use(express.static('build/client', { maxAge: '1h' }));
app.use(morgan('tiny'));

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(express.static(path.join(path.dirname(path.dirname(CLIENT_PATH)), 'public'), { maxAge: "1h" }));
  app.use(
    '/_assets',
    express.static(path.join(CLIENT_PATH, '_assets'), { immutable: true, maxAge: '1y' }),
  );
}
app.use(reactRouterHandler);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
