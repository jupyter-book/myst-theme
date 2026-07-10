import { isFlatSite } from '@myst-theme/common';
import type { LoaderFunction } from 'react-router';
import { data } from 'react-router';
import { getConfig, getMystXrefJson, getMystSearchJson, getPage } from '~/utils/loaders.server';

function api404(message = 'No API route found at this URL') {
  return data(
    {
      status: 404,
      message,
    },
    { status: 404 },
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const pathName = '/' + url.pathname.slice(import.meta.env.BASE_URL.length).replace(/\.data$/, '');
  const [first, ...rest] = pathName
    .slice(1)
    .replace(/\.json$/, '')
    .split('/');
  // Handle /myst.xref.json as slug
  if (rest.length === 0 && first === 'myst.xref') {
    const xref = await getMystXrefJson();
    if (!xref) {
      return data({ message: 'myst.xref.json not found', status: 404 }, { status: 404 });
    }
    return xref;
  }
  // Handle /myst.search.json as slug
  else if (rest.length === 0 && first === 'myst.search') {
    const search = await getMystSearchJson();
    if (!search) {
      return data({ message: 'myst.search.json not found', status: 404 }, { status: 404 });
    }
    return search;
  }
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
