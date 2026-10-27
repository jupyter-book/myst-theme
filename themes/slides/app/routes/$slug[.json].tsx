import { data } from 'react-router';
import { getPage } from '~/utils/loaders.server';

import type { Route } from './+types/$slug[.json]';

function api404(message = 'No API route found at this URL') {
  return data(
    {
      status: 404,
      message,
    },
    { status: 404 },
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { slug } = params;
  const pageData = await getPage(request, { slug });
  if (!pageData) return api404('No page found at this URL.');
  return data(pageData, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
