import { useFetchMdast } from 'myst-to-react';
import { useEffect } from 'react';
import type { ExecuteScopeAction } from './actions';
import type { IdKeyMap } from './provider';
import type { ExecuteScopeState } from './reducer';

export function MdastFetcher({
  slug,
  url,
  dispatch,
}: {
  slug: string;
  url: string;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { data, error } = useFetchMdast({ remote: true, dataUrl: `${url}.json` });

  useEffect(() => {
    if (!data) return;
    dispatch({ type: 'ADD_MDAST', payload: { slug, mdast: data.mdast } });
  }, [data]);

  if (error) {
    return (
      <div>
        error: {slug}
        {error.message}
      </div>
    );
  }

  return <div>fetching: {`${slug}.json`}</div>;
}

export function NotebookBuilder({
  slug,
  idkMap,
  state,
  dispatch,
}: {
  slug: string;
  idkMap: React.MutableRefObject<IdKeyMap>;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  return <div>building</div>;
}
