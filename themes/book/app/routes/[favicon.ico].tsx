import type { LoaderFunction } from 'react-router';
import { getFavicon } from '~/utils/loaders.server';

export const loader: LoaderFunction = async (): Promise<Response> => {
  const favicon = await getFavicon();
  if (!favicon) return new Response('No favicon found', { status: 404 });
  return new Response(
    favicon.buffer,
    favicon.contentType ? { headers: { 'Content-Type': favicon.contentType } } : undefined,
  );
};
