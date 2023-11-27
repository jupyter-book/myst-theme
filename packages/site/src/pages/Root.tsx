import type { SiteManifest } from 'myst-config';
import type { SiteLoader } from '@myst-theme/common';
import {
  BaseUrlProvider,
  ProjectProvider,
  SiteProvider,
  Theme,
  ThemeProvider,
} from '@myst-theme/providers';
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
import { DEFAULT_NAV_HEIGHT, renderers } from '../components/index.js';
import { Analytics } from '../seo/index.js';
import { Error404 } from './Error404.js';
import classNames from 'classnames';
import { ConfiguredThebeServerProvider } from '@myst-theme/jupyter';
import { ThebeBundleLoaderProvider } from 'thebe-react';

export function Document({
  children,
  scripts,
  theme,
  config,
  title,
  staticBuild,
  baseurl,
  loadThebeLite,
  top = DEFAULT_NAV_HEIGHT,
}: {
  children: React.ReactNode;
  scripts?: React.ReactNode;
  theme: Theme;
  config?: SiteManifest;
  title?: string;
  staticBuild?: boolean;
  baseurl?: string;
  loadThebeLite?: boolean;
  top?: number;
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
            <ThebeBundleLoaderProvider loadThebeLite={loadThebeLite} publicPath={baseurl}>
              <SiteProvider config={config}>
                <ProjectProvider>
                  <ConfiguredThebeServerProvider>{children}</ConfiguredThebeServerProvider>
                </ProjectProvider>
              </SiteProvider>
            </ThebeBundleLoaderProvider>
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
