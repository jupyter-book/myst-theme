import { createRobotsTxtResponse, getSiteUrl } from '@myst-theme/site';
import type { LoaderFunction } from '@remix-run/node';
import { getConfig } from '~/utils/loaders.server';

export const loader: LoaderFunction = async ({ request }): Promise<Response | null> => {
  const config = await getConfig();
  return createRobotsTxtResponse(getSiteUrl(request, config));
};
