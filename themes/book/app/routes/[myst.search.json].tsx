import type { LoaderFunction } from 'react-router';
import { data } from 'react-router';
import { getMystSearchJson } from '~/utils/loaders.server';

export const loader: LoaderFunction = async () => {
    const search = await getMystSearchJson();
    if (!search) {
      return data({ message: 'myst.search.json not found', status: 404 }, { status: 404 });
    }
    return search;
};

