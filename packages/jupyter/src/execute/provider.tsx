import type { Dependency } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import type { Root } from 'mdast';
import React, { useEffect, useReducer, useRef } from 'react';
import { selectAll } from 'unist-util-select';
import type { ExecuteScopeAction, Computable } from './actions';
import type { ExecuteScopeState } from './reducer';
import { reducer } from './reducer';
import { selectAreAllDependenciesReady, selectDependenciesToFetch } from './selectors';
import { MdastFetcher, NotebookBuilder } from './leaves';

interface ExecuteScopeType {
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}

export type IdOrKey = string; // any node key (block, codeCel, output)
export type NotebookSlug = string; // the slug of the notebook
export type CellId = string; // the id of a cell in a notebook, by convention it is the block.key
export type IdKeyMap = Record<IdOrKey, { slug: NotebookSlug; cellId: CellId }>;

export const ExecuteScopeContext = React.createContext<ExecuteScopeType | undefined>(undefined);

type ArticleContents = {
  slug: string;
  kind: SourceFileKind;
  mdast: Root;
  dependencies?: Dependency[];
};

function useScopeNavigate({
  contents: { slug, kind, mdast, dependencies },
  state,
  dispatch,
}: {
  contents: ArticleContents;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  useEffect(() => {
    if (state.renderings[slug]) {
      console.log(`ExecuteScopeProvider - ${slug} is already in scope`);
      return;
    }

    const computables: Computable[] = selectAll('container > embed', mdast).map((node: any) => {
      const { key, label, source } = node;
      return { key, label, source };
    });

    dispatch({
      type: 'NAVIGATE',
      payload: {
        kind: kind,
        slug: slug,
        mdast: mdast,
        dependencies: dependencies ?? [],
        computables,
      },
    });
  }, [slug]);
}

function useExecutionScopeFetcher({
  slug,
  state,
  dispatch,
}: {
  slug: string;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  useEffect(() => {
    if (!state.builds[slug]) return;
    if (state.builds[slug].status === 'pending') {
      dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'fetching' } });
    }
    if (state.builds[slug].status === 'fetching') {
      if (selectAreAllDependenciesReady(state, slug)) {
        dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'build-notebooks' } });
      }
    }
  }, [state.builds, state.mdast]);
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
  contents,
}: React.PropsWithChildren<{ contents: ArticleContents }>) {
  // compute incoming for first render
  const computables: Computable[] = selectAll('container > embed', contents.mdast).map(
    (node: any) => {
      const { key, label, source } = node;
      return { key, label, source };
    },
  );

  const initialState: ExecuteScopeState = {
    mdast: {
      [contents.slug]: { root: contents.mdast },
    },
    renderings: {
      [contents.slug]: {
        computable: computables.length > 0 || contents.kind === SourceFileKind.Notebook,
        kind: contents.kind,
        slug: contents.slug,
        dependencies: contents.dependencies ?? [],
        computables,
        ready: false,
        scopes: {},
      },
    },
    builds: {},
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const idkMap = useRef<IdKeyMap>({});

  useScopeNavigate({ contents, state: state, dispatch });
  useExecutionScopeFetcher({ slug: contents.slug, state: state, dispatch });

  // idkMap: idkMap.current
  // build a list of all the dependencies we need to fetch

  const fetchTargets: { slug: string; url: string }[] = selectDependenciesToFetch(state);
  const buildTargets = Object.values(state.builds).filter((b) => b.status === 'build-notebooks');

  const memo = React.useMemo(() => ({ state, dispatch, idkMap }), [state]);

  return (
    <ExecuteScopeContext.Provider value={memo}>
      <div className="fixed bottom-0 right-0 p-2 m-1 text-xs border rounded shadow-lg">
        <div className="p-0 m-0">fetching:</div>
        {fetchTargets.length === 0 && <div className="p-1 pl-4">no active fetching</div>}
        {fetchTargets.length > 0 && (
          <div className="p-1 pl-4">
            {fetchTargets.map(({ slug, url }) => (
              <MdastFetcher key={slug} slug={slug} url={url} dispatch={dispatch} />
            ))}
          </div>
        )}
        <div className="p-0 m-0">building-notebooks:</div>
        {buildTargets.length === 0 && <div className="p-1 pl-4">no active building</div>}
        {buildTargets.length > 0 && (
          <NotebookBuilder slug={contents.slug} idkMap={idkMap} state={state} dispatch={dispatch} />
        )}
      </div>
      {children}
    </ExecuteScopeContext.Provider>
  );
}
