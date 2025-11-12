import type { SiteManifest } from 'myst-config';
import type { SiteLoader } from '@myst-theme/common';
import type { NodeRenderers } from '@myst-theme/providers';
import {
  BaseUrlProvider,
  SiteProvider,
  Theme,
  ThemeProvider,
  useThemeSwitcher,
} from '@myst-theme/providers';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link,
  NavLink,
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from 'react-router';
import {
  DEFAULT_NAV_HEIGHT,
  renderers as defaultRenderers,
  BlockingThemeLoader,
} from '../components/index.js';
import { useTheme } from '../hooks/index.js';
import { Analytics } from '../seo/index.js';
import { Error404 } from './Error404.js';
import { ErrorUnhandled } from './ErrorUnhandled.js';
import classNames from 'classnames';

export function Document({
  children,
  scripts,
  theme: ssrTheme,
  config,
  title,
  staticBuild,
  baseurl,
  top = DEFAULT_NAV_HEIGHT,
  renderers = defaultRenderers,
  head,
}: {
  children: React.ReactNode;
  scripts?: React.ReactNode;
  theme?: Theme;
  config?: SiteManifest;
  title?: string;
  staticBuild?: boolean;
  baseurl?: string;
  top?: number;
  renderers?: NodeRenderers;
  head?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const links = staticBuild
    ? {
        Link: (props: any) => <Link {...{ ...props, reloadDocument: true }} />,
        NavLink: (props: any) => <NavLink {...{ ...props, reloadDocument: true }} />,
      }
    : {
        Link: Link as any,
        NavLink: NavLink as any,
        navigate,
      };

  // (Local) theme state driven by SSR and cookie/localStorage
  const [theme, setTheme] = useTheme({ ssrTheme: ssrTheme, useLocalStorage: staticBuild });

  // Inject blocking element to set proper pre-hydration state
  const headAndLoader = (
    <>
      {head}
      {ssrTheme ? undefined : <BlockingThemeLoader useLocalStorage={!!staticBuild} />}
    </>
  );

  return (
    <ThemeProvider theme={theme} setTheme={setTheme} renderers={renderers} {...links} top={top}>
      <DocumentWithoutProviders
        children={children}
        scripts={scripts}
        head={headAndLoader}
        config={config}
        title={title}
        liveReloadListener={!staticBuild}
        baseurl={baseurl}
        top={top}
      />
    </ThemeProvider>
  );
}

export function DocumentWithoutProviders({
  children,
  scripts,
  head,
  config,
  title,
  baseurl,
  top = DEFAULT_NAV_HEIGHT,
  liveReloadListener,
}: {
  children: React.ReactNode;
  scripts?: React.ReactNode;
  head?: React.ReactNode;
  config?: SiteManifest;
  title?: string;
  baseurl?: string;
  useLocalStorageForDarkMode?: boolean;
  top?: number;
  theme?: Theme;
  liveReloadListener?: boolean;
}) {
  // Theme value from theme context. For a clean page load (no cookies), both ssrTheme and theme are null
  // And thus the BlockingThemeLoader is used to inject the client-preferred theme (localStorage or media query)
  // without a FOUC.
  //
  // In live-server contexts, setting the theme or changing the system preferred theme will modify the ssrTheme upon next request _and_ update the useThemeSwitcher context state, leading to a re-render
  // Upon re-render, the state-theme value is set on `html` and the client-side BlockingThemeLoader discovers that it has no additional work to do, exiting the script tag early
  // Upon a new request to the server, the theme preference is received from the set cookie, and therefore we don't inject a BlockingThemeLoader AND we have the theme value in useThemeSwitcher.
  //
  // In static sites, ssrTheme is forever null.
  // if (ssrTheme) { assert(theme === ssrTheme) }
  const { theme } = useThemeSwitcher();
  return (
    // Set the theme during SSR if possible, otherwise leave it up to the BlockingThemeLoader
    (<html lang="en" className={classNames(theme)} style={{ scrollPadding: top }}>
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
        {head}
      </head>
      <body className="m-0 transition-colors duration-500 bg-white dark:bg-stone-900">
        <BaseUrlProvider baseurl={baseurl}>
          <SiteProvider config={config}>{children}</SiteProvider>
        </BaseUrlProvider>
        <ScrollRestoration />
        <Scripts />
        {scripts}
      </body>
    </html>)
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

export function AppErrorBoundary() {
  const error = useRouteError();
  return (
    <Document theme={Theme.light}>
      <main className="article-grid subgrid-gap col-screen">
        <article className="article">
          {isRouteErrorResponse(error) ? <Error404 /> : <ErrorUnhandled error={error as any} />}
        </article>
      </main>
    </Document>
  );
}
