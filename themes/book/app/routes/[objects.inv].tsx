import type { LoaderFunction } from 'react-router';
import { getObjectsInv } from '~/utils/loaders.server';

export const loader: LoaderFunction = async (): Promise<Response> => {
  const inv = await getObjectsInv();
  if (!inv) return new Response('Inventory not found', { status: 404 });
  return new Response(inv);
};
