import type { LoaderFunction } from '@remix-run/node';
import { getCustomStyleSheet } from '~/utils/loaders.server';

export const loader: LoaderFunction = async (): Promise<Response> => {
  const css = await getCustomStyleSheet();
  if (!css) return new Response('No custom CSS stylesheet found', { status: 404 });
  return new Response(
    css.buffer,
    css.contentType ? { headers: { 'Content-Type': css.contentType } } : undefined,
  );
};
