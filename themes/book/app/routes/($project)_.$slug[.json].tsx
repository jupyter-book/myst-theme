import { isFlatSite } from '@myst-theme/common';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getConfig, getMystXrefJson, getPage } from '~/utils/loaders.server';

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
  const { project, slug } = params;
  // Handle /myst.xref.json as slug
  if (project === undefined && slug === 'myst.xref') {
    const xref = await getMystXrefJson();
    if (!xref) return new Response('myst.xref.json not found', { status: 404 });
    return json(xref);
  }
  const config = await getConfig();
  const flat = isFlatSite(config);
  const data = await getPage(request, {
    project: flat ? project : project ?? slug,
    slug: flat ? slug : project ? slug : undefined,
  });
  if (!data) return api404('No page found at this URL.');
  return json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
};
