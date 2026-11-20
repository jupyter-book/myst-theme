import { getObjectsInv } from '~/utils/loaders.server';

export async function loader() {
  const inv = await getObjectsInv();
  if (!inv) return new Response('Inventory not found', { status: 404 });
  return new Response(inv);
}
