import type { LinksFunction, LoaderFunction } from 'react-router';
import '~/styles/app.css';
import 'thebe-core/dist/lib/thebe-core.css';
import { getConfig } from '~/utils/loaders.server';
import type { SiteLoader } from '@myst-theme/common';
import { normalizeBaseURL } from '@myst-theme/common';
import {
  Document,
  responseNoSite,
  ContentReload,
  SkipTo,
  renderers as defaultRenderers,
} from '@myst-theme/site';
export { AppErrorBoundary as ErrorBoundary } from '@myst-theme/site';
import { createSearch as createMiniSearch } from '@myst-theme/search-minisearch';
import { Outlet, useLoaderData } from 'react-router';
import { SearchFactoryProvider, mergeRenderers } from '@myst-theme/providers';
import type { NodeRenderers } from '@myst-theme/providers';
import type { ISearch, MystSearchIndex } from '@myst-theme/search';
import { SEARCH_ATTRIBUTES_ORDERED } from '@myst-theme/search';

import { JUPYTER_RENDERERS } from '@myst-theme/jupyter';
import { LANDING_PAGE_RENDERERS } from '@myst-theme/landing-pages';
import { ANY_RENDERERS } from '@myst-theme/anywidget';
import React, { useCallback } from 'react';
import { loadRemoteModule } from './load-remote.ts';

const RENDERERS: NodeRenderers = mergeRenderers([
  defaultRenderers,
  JUPYTER_RENDERERS,
  LANDING_PAGE_RENDERERS,
  ANY_RENDERERS,
]);

export const links: LinksFunction = () => {
  return [
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

function loadRemotes(config: Awaited<ReturnType<typeof getConfig>>) {
  return (config.options.extensions ?? [])
    .map((item) => {
      const match = item.match(/([^@]+)@(.*)/);
      if (!match) {
        return null;
      }
      const [_, name, entry] = match;
      return { name, entry, type: 'module' };
    })
    .filter(Boolean) as Remote[];
}

export const loader: LoaderFunction = async (): Promise<SiteLoader> => {
  const baseURL = normalizeBaseURL(process.env.BASE_URL ?? '');
  const config = await getConfig().catch(() => null);
  if (!config) throw responseNoSite();
  const remotes = loadRemotes(config);
  const data = {
    config,
    remotes,
    CONTENT_CDN_PORT: process.env.CONTENT_CDN_PORT ?? 3100,
    STATIC_BUILD: !!import.meta.env.VITE_BUILD_HTML,
    BASE_URL: baseURL,
  };
  return data;
};

function createSearch(index: MystSearchIndex): ISearch {
  const options = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          width: '100%',
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

function AppWithRenderers({ renderers }: { renderers: NodeRenderers }) {
  const { config, CONTENT_CDN_PORT, STATIC_BUILD, BASE_URL } = useLoaderData<SiteLoader>();

  const searchFactory = useCallback((index: MystSearchIndex) => createSearch(index), []);
  return (
    <SearchFactoryProvider factory={searchFactory}>
      <Document
        config={config}
        scripts={STATIC_BUILD ? undefined : <ContentReload port={CONTENT_CDN_PORT} />}
        staticBuild={STATIC_BUILD}
        baseurl={BASE_URL}
        renderers={renderers}
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

type Remote = {
  name: string;
  entry: string;
};

let _promise: Promise<NodeRenderers[]>;

function loadRenderers(remotes: Remote[]) {
  if (_promise) {
    return _promise;
  }
  _promise = Promise.all(
    remotes.map((remote) =>
      loadRemoteModule(remote.name, remotes).then((m) => m.default.renderers),
    ),
  );
  return _promise;
}

export default function App() {
  const { remotes } = useLoaderData<SiteLoader>();
  return (
    <React.Suspense fallback={<AppWithRenderers renderers={RENDERERS} />}>
      {(() => {
        const loadedRenderers = React.use(loadRenderers(remotes));
        const nextRenderers = React.useMemo(
          () => mergeRenderers([RENDERERS, ...loadedRenderers]),
          [loadedRenderers],
        );
        console.log(nextRenderers);
        return <AppWithRenderers renderers={nextRenderers} />;
      })()}
    </React.Suspense>
  );
}
