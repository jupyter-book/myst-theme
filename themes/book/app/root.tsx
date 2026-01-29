import type { LinksFunction, V2_MetaFunction, LoaderFunction } from '@remix-run/node';
import tailwind from '~/styles/app.css';
import thebeCoreCss from 'thebe-core/dist/lib/thebe-core.css';
import { getConfig } from '~/utils/loaders.server';
import type { SiteLoader } from '@myst-theme/common';
import {
  Document,
  responseNoSite,
  getMetaTagsForSite,
  getThemeSession,
  ContentReload,
  SkipTo,
  renderers as defaultRenderers,
} from '@myst-theme/site';
export { AppErrorBoundary as ErrorBoundary } from '@myst-theme/site';
import { createSearch as createMiniSearch } from '@myst-theme/search-minisearch';
import { Outlet, useLoaderData } from '@remix-run/react';
import { SearchFactoryProvider, mergeRenderers } from '@myst-theme/providers';
import type { NodeRenderers } from '@myst-theme/providers';
import type { ISearch, MystSearchIndex } from '@myst-theme/search';
import { SEARCH_ATTRIBUTES_ORDERED } from '@myst-theme/search';

import { JUPYTER_RENDERERS } from '@myst-theme/jupyter';
import { LANDING_PAGE_RENDERERS } from '@myst-theme/landing-pages';
import { useCallback } from 'react';

const RENDERERS: NodeRenderers = mergeRenderers([
  defaultRenderers,
  JUPYTER_RENDERERS,
  LANDING_PAGE_RENDERERS,
]);

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return getMetaTagsForSite({
    title: data?.config?.title,
    description: data?.config?.description,
    twitter: data?.config?.options?.twitter,
  });
};

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwind },
    { rel: 'stylesheet', href: thebeCoreCss },
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/jupyter-matplotlib@0.11.3/css/mpl_widget.css',
    },
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css',
    },
  ];
};

export const loader: LoaderFunction = async ({ request }): Promise<SiteLoader> => {
  const baseURL = process.env.BASE_URL || undefined;
  const [config, themeSession] = await Promise.all([
    getConfig().catch(() => null),
    getThemeSession(request),
  ]);
  if (!config) throw responseNoSite();
  const data = {
    theme: themeSession.getTheme(),
    config,
    CONTENT_CDN_PORT: process.env.CONTENT_CDN_PORT ?? 3100,
    MODE: (process.env.MODE ?? 'app') as 'app' | 'static',
    BASE_URL: baseURL,
  };
  return data;
};

function createSearch(index: MystSearchIndex): ISearch {
  const options = {
    fields: SEARCH_ATTRIBUTES_ORDERED as any as string[],
    storeFields: ['hierarchy', 'content', 'url', 'type', 'id', 'position'],
    idField: 'id',
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
    },
  };
  return createMiniSearch(index.records, options);
}

/*
 * Component that shows a "no CSS loaded" warning when a page
 * loads without the built-in MyST stylesheet. This can happen on static builds
 * when the BASE_URL doesn't match the deployment base URL.
 */
function NoCSSWarning() {
  const CLIENT_THEME_SOURCE = `
    (() => {
            // Test for has-styling variable set by the MyST stylesheet
            const node = document.currentScript.parentNode;
            const hasCSS = window.getComputedStyle(node).getPropertyValue("--has-styling");
            if (hasCSS === ""){
                    node.showModal();
            }

    })()
`;
  return (
    <>
      <dialog
        id="myst-no-css"
        // Use inline styles to ensure styling without stylesheets
        style={{
          position: 'fixed',
          left: '0px',
          top: '0px',
          width: '100%', // This must be %, not vw, so it doesn't cause scrollbars on windows
          height: '100vh',
          fontSize: '4rem',
          padding: '1rem',
          color: 'black',
          background: 'white',
        }}
        // Opening the modal sets an open attribute, so we need to disable the warning
        suppressHydrationWarning
      >
        <strong>Site not loading correctly?</strong>
        <p>
          This may be due to an incorrect <code>BASE_URL</code> configuration. See{' '}
          <a href="https://mystmd.org/guide/deployment#deploy-base-url">the MyST Documentation</a>{' '}
          for reference.
        </p>
        <script dangerouslySetInnerHTML={{ __html: CLIENT_THEME_SOURCE }} />
      </dialog>
    </>
  );
}

export default function AppWithReload() {
  const { theme, config, CONTENT_CDN_PORT, MODE, BASE_URL } = useLoaderData<SiteLoader>();

  const searchFactory = useCallback((index: MystSearchIndex) => createSearch(index), []);

  return (
    <SearchFactoryProvider factory={searchFactory}>
      <Document
        theme={theme}
        config={config}
        scripts={MODE === 'static' ? undefined : <ContentReload port={CONTENT_CDN_PORT} />}
        staticBuild={MODE === 'static'}
        baseurl={BASE_URL}
        renderers={RENDERERS}
        head={
          <>
            <link rel="icon" href={`${BASE_URL || ''}/favicon.ico`} />
            <link rel="stylesheet" href={`${BASE_URL || ''}/myst-theme.css`} />
          </>
        }
      >
        <SkipTo
          targets={[
            { id: 'skip-to-frontmatter', title: 'Skip to article frontmatter' },
            { id: 'skip-to-article', title: 'Skip to article content' },
          ]}
        />
        <NoCSSWarning />
        <Outlet />
      </Document>
    </SearchFactoryProvider>
  );
}
