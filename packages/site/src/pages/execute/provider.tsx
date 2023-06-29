import { SourceFileKind } from 'myst-common';
import React, { useEffect, useReducer, useRef } from 'react';
import { selectAll } from 'unist-util-select';
import type { PageLoader } from '~/types';
import type { ExecuteScopeAction, Computable } from './actions';
import type { ExecuteScopeState } from './reducer';
import { reducer } from './reducer';

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
    if (store.mdast[article.slug]) {
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
    if (!store.builds[slug] || store.builds[slug]?.status !== 'pending') return;
    dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'fetching' } });
    setTimeout(() => {
      alert(`fetched depdenccies for ${slug}`);
      dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'scoping' } });
    }, 6000);
  }, [store.builds]);
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

  return <ExecuteScopeContext.Provider value={memo}>{children}</ExecuteScopeContext.Provider>;
}
