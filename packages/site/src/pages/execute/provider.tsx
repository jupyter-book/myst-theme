import { SourceFileKind } from 'myst-common';
import React, { useEffect, useReducer, useRef } from 'react';
import { selectAll } from 'unist-util-select';
import type { PageLoader } from '~/types';
import type { ExecuteScopeAction, Computable } from './actions';
import type { BuildStatus, ExecuteScopeState } from './reducer';
import { reducer } from './reducer';
import { useFetchMdast } from 'myst-to-react';
import { selectAreAllDependenciesReady, selectDependenciesToFetch } from './selectors';

interface ExecuteScopeType {
  store: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}

export type IdOrKey = string; // any node key (block, codeCel, output)
export type NotebookSlug = string; // the slug of the notebook
export type CellId = string; // the id of a cell in a notebook, by convention it is the block.key
export type IdKeyMap = Record<IdOrKey, { slug: NotebookSlug; cellId: CellId }>;

export const ExecuteScopeContext = React.createContext<ExecuteScopeType | undefined>(undefined);

function useScopeNavigate({
  article,
  store,
  dispatch,
}: {
  article: PageLoader;
  store: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  useEffect(() => {
    if (store.renderings[article.slug]) {
      console.log(`ExecuteScopeProvider - ${article.slug} is already in scope`);
      return;
    }

    const computables: Computable[] = selectAll('container > embed', article.mdast).map(
      (node: any) => {
        const { key, label, source } = node;
        return { key, label, source };
      },
    );

    dispatch({
      type: 'NAVIGATE',
      payload: {
        kind: article.kind,
        slug: article.slug,
        mdast: article.mdast,
        dependencies: article.dependencies ?? [],
        computables,
      },
    });
  }, [article.slug]);
}

function useExecutionScopeFetcher({
  slug,
  store,
  dispatch,
  idkMap,
}: {
  slug: string;
  store: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
  idkMap: IdKeyMap;
}) {
  useEffect(() => {
    if (store.builds[slug] && store.builds[slug].status === 'pending') {
      dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'fetching' } });
    }
    if (store.builds[slug]) {
      // are all of our dependencies ready?
      console.log(
        'checking if all dependencies are ready',
        slug,
        selectAreAllDependenciesReady(slug, store),
        Object.keys(store.mdast).join(', '),
      );
      if (selectAreAllDependenciesReady(slug, store)) {
        dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'scoping' } });
      }
    }
  }, [store.builds, store.mdast]);
}

function MdastFetcher({
  slug,
  url,
  dispatch,
}: {
  slug: string;
  url: string;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { data, error } = useFetchMdast({ remote: true, dataUrl: `${url}.json` });

  console.log({ data, error });

  useEffect(() => {
    if (!data) return;
    setTimeout(() => {
      dispatch({ type: 'ADD_MDAST', payload: { slug, mdast: data.mdast } });
    }, 1000);
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

/**
 *  The ExecuteScopeProvider is responsible for maintaining the state of the
 *  execution scope. It is also responsible for fetching the json for dependencies
 *  and addind them to the sources tree.
 *
 * @param param0
 * @returns
 */
export function ExecuteScopeProvider({
  children,
  article,
}: React.PropsWithChildren<{ article: PageLoader }>) {
  // compute incoming for first render
  const computables: Computable[] = selectAll('container > embed', article.mdast).map(
    (node: any) => {
      const { key, label, source } = node;
      return { key, label, source };
    },
  );

  const initialState: ExecuteScopeState = {
    mdast: {
      [article.slug]: { root: article.mdast },
    },
    renderings: {
      [article.slug]: {
        computable: computables.length > 0 || article.kind === SourceFileKind.Notebook,
        kind: article.kind,
        slug: article.slug,
        dependencies: article.dependencies ?? [],
        computables,
        ready: false,
        scopes: {},
      },
    },
    builds: {},
  };

  const [store, dispatch] = useReducer(reducer, initialState);

  const idkMap = useRef<IdKeyMap>({});

  const memo = React.useMemo(() => ({ store, dispatch, idkMap }), [store]);

  useScopeNavigate({ article, store, dispatch });
  useExecutionScopeFetcher({ slug: article.slug, store, dispatch, idkMap: idkMap.current });

  // build a list of all the dependencies we need to fetch
  const fetchTargets: { slug: string; url: string }[] = selectDependenciesToFetch(store);

  return (
    <ExecuteScopeContext.Provider value={memo}>
      {fetchTargets.length > 0 && (
        <div className="fixed bottom-0 right-0 p-2 m-1 border rounded shadow-lg">
          {fetchTargets.map(({ slug, url }) => (
            <MdastFetcher key={slug} slug={slug} url={url} dispatch={dispatch} />
          ))}
        </div>
      )}
      {fetchTargets.length === 0 && (
        <div className="fixed bottom-0 right-0 p-2 m-1 border rounded shadow-lg">
          no active fetching
        </div>
      )}
      {children}
    </ExecuteScopeContext.Provider>
  );
}
