import type { SiteManifest } from 'myst-config';
import type { SiteLoader } from '../types';
import { SiteProvider, Theme, ThemeProvider } from '@myst-theme/providers';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  Link as RemixLink,
} from '@remix-run/react';
import { ContentReload, renderers } from '../components';
import { Analytics } from '../seo';
import { ErrorSiteNotFound } from './ErrorSiteNotFound';
import classNames from 'classnames';
import { ThebeCoreProvider } from 'thebe-react';
import ConfiguredThebeServerProvider from '../components/ConfiguredThebeServerProvider';

export function Document({
  children,
  theme,
  config,
  title,
  CONTENT_CDN_PORT,
  scrollTopClass = 'scroll-p-20',
}: {
  children: React.ReactNode;
  theme: Theme;
  config?: SiteManifest;
  title?: string;
  CONTENT_CDN_PORT?: number | string;
  scrollTopClass?: string;
}) {
  console.log('ROOT');
  return (
    <html lang="en" className={classNames(theme, scrollTopClass)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title && <title>{title}</title>}
        <Meta />
        <Links />
        <Analytics
          analytics_google={config?.analytics_google}
          analytics_plausible={config?.analytics_plausible}
        />
      </head>
      <body className="m-0 transition-colors duration-500 bg-white dark:bg-stone-900">
        <ThemeProvider theme={theme} renderers={renderers} Link={RemixLink as any}>
          <ThebeCoreProvider>
            <SiteProvider config={config}>
              <ConfiguredThebeServerProvider>{children}</ConfiguredThebeServerProvider>
            </SiteProvider>
          </ThebeCoreProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <ContentReload port={CONTENT_CDN_PORT} />
      </body>
    </html>
  );
}

export function App() {
  const { theme, config, CONTENT_CDN_PORT } = useLoaderData<SiteLoader>();
  return (
    <Document theme={theme} config={config} CONTENT_CDN_PORT={CONTENT_CDN_PORT}>
      <Outlet />
    </Document>
  );
}

export function AppCatchBoundary() {
  const caught = useCatch();
  return (
    <Document theme={Theme.light} title={caught.statusText}>
      <article className="content">
        <main className="article-grid article-subgrid-gap col-screen">
          <ErrorSiteNotFound />
        </main>
      </article>
    </Document>
  );
}

export function AppDebugErrorBoundary({ error }: { error: { message: string; stack: string } }) {
  return (
    <Document theme={Theme.light} title="Error">
      <div className="mt-16">
        <main className="article-grid article-subgrid-gap col-screen">
          <h1>An Error Occurred</h1>
          <code>{error.message}</code>
          <pre>{error.stack}</pre>
        </main>
      </div>
    </Document>
  );
}
