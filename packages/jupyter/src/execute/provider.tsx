import type { Dependency } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import type { Root } from 'mdast';
import React, { useEffect, useReducer, useRef } from 'react';
import { selectAll } from 'unist-util-select';
import type { ExecuteScopeAction, ExecuteScopeType } from './actions';
import type { Computable, ExecuteScopeState, IdKeyMap } from './types';
import { reducer } from './reducer';
import {
  selectAreAllDependenciesReady,
  selectDependenciesToFetch,
  selectScopeNotebooksToBuild,
} from './selectors';
import { BuildMonitor, MdastFetcher, NotebookBuilder, ServerMonitor } from './leaf';

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
    // TODO could be moved to the leaf
    if (state.builds[slug].status === 'pending') {
      dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'fetching' } });
    }
    // TODO could be moved to the leaf
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

  // TODO phase this out as it is based on the current slug only!
  useExecutionScopeFetcher({ slug: contents.slug, state: state, dispatch });

  const fetchTargets: { slug: string; url: string }[] = selectDependenciesToFetch(state);
  const notebookBuildTargets: { renderSlug: string; notebookSlug: string }[] =
    selectScopeNotebooksToBuild(state);

  const memo = React.useMemo(() => ({ state, dispatch, idkMap }), [state]);

  return (
    <ExecuteScopeContext.Provider value={memo}>
      <div className="fixed bottom-0 right-0 hidden p-2 m-1 text-xs border rounded shadow-lg">
        <div className="p-0 m-0">fetching:</div>
        {fetchTargets.length === 0 && <div className="p-1 pl-4">no active fetching</div>}
        {fetchTargets.length > 0 && (
          <div className="p-1 pl-4">
            {fetchTargets.map(({ slug, url }) => (
              <MdastFetcher key={`fetch-${slug}`} slug={slug} url={url} dispatch={dispatch} />
            ))}
          </div>
        )}
        <div className="p-0 m-0">building-notebooks:</div>
        {notebookBuildTargets.length === 0 && <div className="p-1 pl-4">no active building</div>}
        {notebookBuildTargets.length > 0 && (
          <div className="p-1 pl-4">
            {notebookBuildTargets.map(({ renderSlug, notebookSlug }) => (
              <NotebookBuilder
                key={`build-${renderSlug}-${notebookSlug}`}
                renderSlug={renderSlug}
                notebookSlug={notebookSlug}
                idkMap={idkMap.current}
                state={state}
                dispatch={dispatch}
              />
            ))}
          </div>
        )}
      </div>
      <BuildMonitor state={state} dispatch={dispatch} />
      <ServerMonitor showMessages={true} />
      {children}
    </ExecuteScopeContext.Provider>
  );
}
