import type { LoaderFunction } from 'react-router';
import { data } from 'react-router';
import { getMystXrefJson } from '~/utils/loaders.server';

export const loader: LoaderFunction = async () => {
  // Handle /myst.xref.json as slug
  const xref = await getMystXrefJson();
  if (!xref) {
    return data({ message: 'myst.xref.json not found', status: 404 }, { status: 404 });
  }
  return xref;
};
