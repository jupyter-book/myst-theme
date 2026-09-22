import { getCDNUrl } from '~/utils/loaders.server';
import type { Route } from './+types/[build].$';

export async function loader({ params }: Route.LoaderArgs) {
  // Default to CDN url itself
  const url = getCDNUrl(params['*'] ?? '');
  return fetch(url);
}
