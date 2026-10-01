import type { LinksFunction, MetaFunction, LoaderFunction } from 'react-router';
import tailwind from '~/styles/app.css?url';
import revealCss from 'reveal.js/reveal.css?url';
import thebeCoreCss from 'thebe-core/dist/lib/thebe-core.css?url';
import { getConfig } from '~/utils/loaders.server';
import type { SiteLoader } from '@myst-theme/common';
import {
  Document,
  responseNoSite,
  getMetaTagsForSite,
  ContentReload,
  renderers as defaultRenderers,
} from '@myst-theme/site';
export { AppErrorBoundary as ErrorBoundary } from '@myst-theme/site';
import { Outlet, useLoaderData } from 'react-router';
import { mergeRenderers } from '@myst-theme/providers';
import type { NodeRenderers } from '@myst-theme/providers';
import { JUPYTER_RENDERERS } from '@myst-theme/jupyter';
import { ANY_RENDERERS } from '@myst-theme/anywidget';

const RENDERERS: NodeRenderers = mergeRenderers([
  defaultRenderers,
  JUPYTER_RENDERERS,
  ANY_RENDERERS,
]);

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  return getMetaTagsForSite({
    title: loaderData?.config?.title,
    description: loaderData?.config?.description,
    twitter: loaderData?.config?.options?.twitter,
  });
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: revealCss },
  { rel: 'stylesheet', href: tailwind },
  { rel: 'stylesheet', href: thebeCoreCss },
];

export const loader: LoaderFunction = async (): Promise<SiteLoader> => {
  const config = await getConfig().catch(() => null);
  if (!config) throw responseNoSite();
  return {
    config,
    CONTENT_CDN_PORT: process.env.CONTENT_CDN_PORT ?? 3100,
    MODE: (process.env.MODE ?? 'app') as 'app' | 'static',
    BASE_URL: process.env.BASE_URL || undefined,
  };
};

export default function App() {
  const { config, CONTENT_CDN_PORT, MODE, BASE_URL } = useLoaderData<SiteLoader>();
  return (
    <Document
      config={config}
      scripts={MODE === 'static' ? undefined : <ContentReload port={CONTENT_CDN_PORT} />}
      staticBuild={MODE === 'static'}
      baseurl={BASE_URL}
      renderers={RENDERERS}
      top={0}
      head={
        <>
          <link rel="icon" href={`${BASE_URL || ''}/favicon.ico`} />
          <link rel="stylesheet" href={`${BASE_URL || ''}/myst-theme.css`} />
        </>
      }
    >
      <Outlet />
    </Document>
  );
}
