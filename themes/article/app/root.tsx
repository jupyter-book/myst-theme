import type { LinksFunction, MetaFunction, LoaderFunction, V2_MetaFunction } from '@remix-run/node';
import tailwind from '~/styles/app.css';
import thebeCoreCss from 'thebe-core/dist/lib/thebe-core.css';
import { getConfig } from '~/utils/loaders.server';
import { type SiteLoader } from '@myst-theme/common';
import {
  Document,
  responseNoSite,
  getMetaTagsForSite,
  getThemeSession,
  ContentReload,
  SkipTo,
} from '@myst-theme/site';
import { Outlet, useLoaderData } from '@remix-run/react';
export { AppCatchBoundary as CatchBoundary } from '@myst-theme/site';

export const meta: V2_MetaFunction = ({ data }) => {
  return getMetaTagsForSite({
    title: data?.config?.title,
    description: data?.config?.description,
    twitter: data?.config?.options?.twitter,
  });
};

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    { rel: 'stylesheet', href: tailwind },
    { rel: 'stylesheet', href: thebeCoreCss },
    { rel: 'stylesheet', href: '/myst-theme.css' },
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
    BASE_URL: process.env.BASE_URL || undefined,
  };
  return data;
};

export default function AppWithReload() {
  const { theme, config, CONTENT_CDN_PORT, MODE, BASE_URL } = useLoaderData<SiteLoader>();
  return (
    <Document
      theme={theme}
      config={config}
      scripts={MODE === 'static' ? undefined : <ContentReload port={CONTENT_CDN_PORT} />}
      staticBuild={MODE === 'static'}
      baseurl={BASE_URL}
      top={0}
    >
      <SkipTo targets={[{ id: 'skip-to-article', title: 'Skip to article content' }]} />
      <Outlet />
    </Document>
  );
}
