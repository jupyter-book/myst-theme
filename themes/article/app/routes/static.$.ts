import { type LoaderFunction } from '@remix-run/node';
import { getConfig, updateLink } from '~/utils/loaders.server';
import { responseNoSite, responseNoAsset } from '@myst-theme/site';

export const loader: LoaderFunction = async ({ params }) => {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const slug = params['*'] as string;
  if (!slug || slug === '') return responseNoAsset();
  const staticFiles = config?.static?.filter(({ filename }) => filename.endsWith(slug));
  if (!staticFiles || staticFiles.length === 0) return responseNoAsset();
  const url = updateLink(staticFiles[0].url);
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return new Response(response.body as any, {
    status: 200,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream',
      'Content-Length': response.headers.get('Content-Length') || '',
      'Content-Disposition': `inline; filename="${staticFiles[0].url.split('/').pop()}"`,
      'X-Remix-Resource': 'yes',
    },
  });
};
