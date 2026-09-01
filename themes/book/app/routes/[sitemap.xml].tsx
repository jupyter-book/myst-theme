import { createSitemapResponse, getSiteSlugs, getCanonicalSiteUrl } from '@myst-theme/site';
import type { LoaderFunction } from '@remix-run/node';
import { getConfig } from '~/utils/loaders.server';

export const loader: LoaderFunction = async ({ request }): Promise<Response> => {
  const config = await getConfig();
  return createSitemapResponse(getCanonicalSiteUrl(request, config), getSiteSlugs(config));
};
