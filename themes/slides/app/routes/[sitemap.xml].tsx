import { createSitemapResponse, getSiteSlugs, getDomainFromRequest } from '@myst-theme/site';
import { getConfig } from '~/utils/loaders.server';

import type { Route } from './+types/[sitemap.xml]';

export async function loader({ request }: Route.LoaderArgs) {
  const config = await getConfig();
  return createSitemapResponse(getDomainFromRequest(request), getSiteSlugs(config));
}
