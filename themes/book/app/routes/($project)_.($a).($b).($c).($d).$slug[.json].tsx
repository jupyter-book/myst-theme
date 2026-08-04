import { isFlatSite } from '@myst-theme/common';
import type { LoaderFunction } from 'react-router';
import { data } from 'react-router';
import { getConfig, getPage } from '~/utils/loaders.server';

function api404(message = 'No API route found at this URL') {
  return data(
    {
      status: 404,
      message,
    },
    { status: 404 },
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const pathName = '/' + url.pathname.slice(import.meta.env.BASE_URL.length).replace(/\.data$/, '');
  const [first, ...rest] = pathName
    .slice(1)
    .replace(/\.json$/, '')
    .split('/');
  const config = await getConfig();
  const flat = isFlatSite(config);
  const project = flat ? undefined : first;
  const slugParts = flat ? [first, ...rest] : rest;
  const slug = slugParts.join('.');

  const pageData = await getPage(request, { project, slug });
  if (!pageData) return api404('No page found at this URL.');
  return data(pageData, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
};
