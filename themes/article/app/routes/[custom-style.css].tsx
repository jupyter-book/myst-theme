import type { LoaderFunction } from '@remix-run/node';
import { getCustomStyleSheet } from '~/utils/loaders.server';

export const loader: LoaderFunction = async (): Promise<Response> => {
  const css = await getCustomStyleSheet();
  if (!css) {
    return new Response(`/* No custom stylesheet found */`, {
      headers: { 'Content-Type': 'text/css' },
    });
  } else {
    return new Response(
      css.buffer,
      css.contentType ? { headers: { 'Content-Type': css.contentType } } : undefined,
    );
  }
};
