import { getFavicon } from '~/utils/loaders.server';

export async function loader() {
  const favicon = await getFavicon();
  if (!favicon) return new Response('No favicon found', { status: 404 });
  return new Response(
    favicon.buffer,
    favicon.contentType ? { headers: { 'Content-Type': favicon.contentType } } : undefined,
  );
}
