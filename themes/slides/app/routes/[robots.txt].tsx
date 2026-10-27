import { createRobotsTxtResponse, getDomainFromRequest } from '@myst-theme/site';
import type { Route } from './+types/[robots.txt]';

export async function loader({ request }: Route.LoaderArgs) {
  return createRobotsTxtResponse(getDomainFromRequest(request));
}
