import { isFlatSite } from '@myst-theme/common';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getConfig, getMystXrefJson, getMystSearchJson, getPage } from '~/utils/loaders.server';

function api404(message = 'No API route found at this URL') {
  return json(
    {
      status: 404,
      message,
    },
    { status: 404 },
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const [first, ...rest] = new URL(request.url).pathname
    .slice(1)
    .replace(/\.json$/, '')
    .split('/');
  // Handle /myst.xref.json as slug
  if (rest.length === 0 && first === 'myst.xref') {
    const xref = await getMystXrefJson();
    if (!xref) {
      return json({ message: 'myst.xref.json not found', status: 404 }, { status: 404 });
    }
    return json(xref);
  }
  // Handle /myst.search.json as slug
  else if (rest.length === 0 && first === 'myst.search') {
    const search = await getMystSearchJson();
    if (!search) {
      return json({ message: 'myst.search.json not found', status: 404 }, { status: 404 });
    }
    return json(search);
  }
  const config = await getConfig();
  const flat = isFlatSite(config);
  const project = flat ? undefined : first;
  const slugParts = flat ? [first, ...rest] : rest;
  const slug = slugParts.join('.');
  const data = await getPage(request, { project, slug });
  if (!data) return api404('No page found at this URL.');
  return json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
};
