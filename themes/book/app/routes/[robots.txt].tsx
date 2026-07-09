import { createRobotsTxtResponse, getDomainFromRequest } from '@myst-theme/site';
import type { LoaderFunction } from 'react-router';

export const loader: LoaderFunction = async ({ request }): Promise<Response | null> => {
  return createRobotsTxtResponse(getDomainFromRequest(request));
};
