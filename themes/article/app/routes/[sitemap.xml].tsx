import { createSitemapResponse, getSiteSlugs } from '@myst-theme/site';
import { getDomainFromRequest } from '@myst-theme/site';
import type { LoaderFunction } from '@remix-run/node';
import { getConfig } from '~/utils/loaders.server';

export const loader: LoaderFunction = async ({ request }): Promise<Response> => {
  const config = await getConfig();
  return createSitemapResponse(getDomainFromRequest(request), getSiteSlugs(config));
};
