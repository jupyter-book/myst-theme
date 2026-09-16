import { data } from 'react-router';
import { getPage } from '~/utils/loaders.server';

import type { Route } from './+types/($a).($b).($c).($d).$slug[.json]';

function api404(message = 'No API route found at this URL') {
  return data(
    {
      status: 404,
      message,
    },
    { status: 404 },
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const pathName = '/' + url.pathname.slice(import.meta.env.BASE_URL.length).replace(/\.data$/, '');
  const [first, ...rest] = pathName
    .slice(1)
    .replace(/\.json$/, '')
    .split('/');
  const slug = [first, ...rest].join('.');
  const pageData = await getPage(request, { slug }).catch(() => null);
  if (!pageData) return api404('No page found at this URL.');
  return data(pageData, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
