import { createRobotsTxtResponse, getDomainFromRequest } from '@myst-theme/site';
import type { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }): Promise<Response | null> => {
  return createRobotsTxtResponse(getDomainFromRequest(request));
};
