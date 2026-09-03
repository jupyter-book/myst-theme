import type { LoaderFunction } from 'react-router';
import { data } from 'react-router';
import { getCDNUrl } from '~/utils/loaders.server';

export const loader: LoaderFunction = async ({ params }) => {
    const url = getCDNUrl(params['*']);
  return fetch(url);
 };


