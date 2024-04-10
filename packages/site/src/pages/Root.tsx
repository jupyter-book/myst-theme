import type { SiteManifest } from 'myst-config';
import type { SiteLoader } from '@myst-theme/common';
import type { NodeRenderer } from '@myst-theme/providers';
import { BaseUrlProvider, SiteProvider, Theme, ThemeProvider } from '@myst-theme/providers';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link,
  NavLink,
} from '@remix-run/react';
import { DEFAULT_NAV_HEIGHT, renderers as defaultRenderers } from '../components/index.js';
import { Analytics } from '../seo/index.js';
import { Error404 } from './Error404.js';
import classNames from 'classnames';

export function Document({
  children,
  scripts,
  theme,
  config,
  title,
  staticBuild,
  baseurl,
  top = DEFAULT_NAV_HEIGHT,
  renderers = defaultRenderers,
}: {
  children: React.ReactNode;
  scripts?: React.ReactNode;
  theme: Theme;
  config?: SiteManifest;
  title?: string;
  staticBuild?: boolean;
  baseurl?: string;
  top?: number;
  renderers?: Record<string, NodeRenderer>;
}) {
  const links = staticBuild
    ? {
        Link: (props: any) => <Link {...{ ...props, reloadDocument: true }} />,
        NavLink: (props: any) => <NavLink {...{ ...props, reloadDocument: true }} />,
      }
    : {
        Link: Link as any,
        NavLink: NavLink as any,
      };

  return (
    <html lang="en" className={classNames(theme)} style={{ scrollPadding: top }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title && <title>{title}</title>}
        <Meta />
        <Links />
        <Analytics
          analytics_google={config?.options?.analytics_google}
          analytics_plausible={config?.options?.analytics_plausible}
        />
      </head>
      <body className="m-0 transition-colors duration-500 bg-white dark:bg-stone-900">
        <ThemeProvider theme={theme} renderers={renderers} {...links} top={top}>
          <BaseUrlProvider baseurl={baseurl}>
            <SiteProvider config={config}>{children}</SiteProvider>
          </BaseUrlProvider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        {!staticBuild && <LiveReload />}
        {scripts}
      </body>
    </html>
  );
}

export function App() {
  const { theme, config } = useLoaderData<SiteLoader>();
  return (
    <Document theme={theme} config={config}>
      <Outlet />
    </Document>
  );
}

export function AppCatchBoundary() {
  return (
    <Document theme={Theme.light}>
      <article className="article">
        <main className="article-grid subgrid-gap col-screen">
          <Error404 />
        </main>
      </article>
    </Document>
  );
}
