import type { LoaderFunction } from 'react-router';
// The theme styles come after the reveal.js core styles, so that they override them.
import 'reveal.js/reveal.css';
import '~/styles/app.css';
import 'thebe-core/dist/lib/thebe-core.css';
import { getConfig } from '~/utils/loaders.server';
import type { SiteLoader } from '@myst-theme/common';
import { normalizeBaseURL } from '@myst-theme/common';
import {
  Document,
  responseNoSite,
  ContentReload,
  renderers as defaultRenderers,
} from '@myst-theme/site';
export { AppErrorBoundary as ErrorBoundary } from '@myst-theme/site';
import { Outlet, useLoaderData } from 'react-router';
import { mergeRenderers } from '@myst-theme/providers';
import type { NodeRenderers } from '@myst-theme/providers';
import { JUPYTER_RENDERERS } from '@myst-theme/jupyter';
import { ANY_RENDERERS } from '@myst-theme/anywidget';
import { EditableBlock, NOTEBOOK_BLOCK_SELECTOR } from '~/components/EditableBlock';
import { CREDIT_RENDERERS } from '~/components/Credits';

const RENDERERS: NodeRenderers = mergeRenderers([
  defaultRenderers,
  JUPYTER_RENDERERS,
  ANY_RENDERERS,
  { block: { [NOTEBOOK_BLOCK_SELECTOR]: EditableBlock } },
  CREDIT_RENDERERS,
]);

export const loader: LoaderFunction = async (): Promise<SiteLoader> => {
  const config = await getConfig().catch(() => null);
  if (!config) throw responseNoSite();
  return {
    config,
    CONTENT_CDN_PORT: process.env.CONTENT_CDN_PORT ?? 3100,
    STATIC_BUILD: !!import.meta.env.VITE_BUILD_HTML,
    BASE_URL: normalizeBaseURL(process.env.BASE_URL ?? ''),
  };
};

export default function App() {
  const { config, CONTENT_CDN_PORT, STATIC_BUILD, BASE_URL } = useLoaderData<SiteLoader>();
  return (
    <Document
      config={config}
      scripts={STATIC_BUILD ? undefined : <ContentReload port={CONTENT_CDN_PORT} />}
      staticBuild={STATIC_BUILD}
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
