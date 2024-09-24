import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getMystXrefJson, getMystSearchJson, getPage } from '~/utils/loaders.server';

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
  const { slug } = params;
  // Handle /myst.xref.json as slug
  if (slug === 'myst.xref') {
    const xref = await getMystXrefJson();
    if (!xref) {
      return json({ message: 'myst.xref.json not found', status: 404 }, { status: 404 });
    }
    return json(xref);
  }
  // Handle /myst.search.json as slug
  else if (slug === 'myst.search') {
    const search = await getMystSearchJson();
    if (!search) {
      return json({ message: 'myst.search.json not found', status: 404 }, { status: 404 });
    }
    return json(search);
  }
  const data = await getPage(request, { slug }).catch(() => null);
  if (!data) return api404('No page found at this URL.');
  return json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
};
