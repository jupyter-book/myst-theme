import type { Dependency } from 'myst-spec-ext';
import { SourceFileKind } from 'myst-spec-ext';
import React, { useEffect, useReducer, useRef } from 'react';
import { selectAll } from 'unist-util-select';
import type { ExecuteScopeAction } from './actions.js';
import type { Computable, ExecuteScopeState, IdKeyMap } from './types.js';
import { reducer } from './reducer.js';
import {
  selectAreAllDependenciesReady,
  selectDependenciesToFetch,
  selectScopeNotebooksToBuild,
  selectSessionsToStart,
} from './selectors.js';
import { MdastFetcher, NotebookBuilder, ServerMonitor, SessionStarter } from './leaf.js';
import type { GenericParent } from 'myst-common';

export interface ExecuteScopeType {
  canCompute: boolean;
  slug: string;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
  idkmap: IdKeyMap;
}

export const ExecuteScopeContext = React.createContext<ExecuteScopeType | undefined>(undefined);

type ArticleContents = {
  slug: string;
  kind: SourceFileKind;
  mdast: GenericParent;
  location?: string;
  dependencies?: Dependency[];
};

function useScopeNavigate({
  contents: { slug, location, kind, mdast, dependencies },
  state,
  dispatch,
}: {
  contents: ArticleContents;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  useEffect(() => {
    if (state.pages[slug]) {
      console.debug(`Jupyter: ExecuteScopeProvider - ${slug} is already in scope`);
      return;
    }

    const computables: Computable[] = listComputables(mdast);

    dispatch({
      type: 'NAVIGATE',
      payload: {
        kind: kind,
        slug: slug,
        location: location ?? (kind === SourceFileKind.Notebook ? '/fallback.ipynb' : '/'),
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

function listComputables(mdast: GenericParent) {
  return selectAll('container[kind=figure]:has(output), embed:has(output)', mdast).map(
    (node: any) => {
      const { key, label, source } = node;
      const output = selectAll('output', node);
      return { embedKey: key, outputKey: (output[0] as any).key, label, source };
    },
  );
}

/**
 *  The ExecuteScopeProvider is responsible for maintaining the state of the
 *  execution scope. It is also responsible for fetching the json for dependencies
 *  and adding them to the sources tree.
 */
export function ExecuteScopeProvider({
  children,
  enable,
  contents,
}: React.PropsWithChildren<{ enable: boolean; contents: ArticleContents }>) {
  // compute incoming for first render
  const computables: Computable[] = listComputables(contents.mdast);

  const fallbackLocation = contents.kind === SourceFileKind.Notebook ? '/fallback.ipynb' : '/';

  const initialState: ExecuteScopeState = {
    mdast: {
      [contents.slug]: { root: contents.mdast },
    },
    pages: {
      [contents.slug]: {
        computable: computables.length > 0 || contents.kind === SourceFileKind.Notebook,
        kind: contents.kind,
        slug: contents.slug,
        location: contents.location ?? fallbackLocation,
        dependencies: contents.dependencies ?? [],
        computables,
        ready: false,
        scopes: {},
      },
    },
    builds: {},
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const idkmap = useRef<IdKeyMap>({});

  useScopeNavigate({ contents, state: state, dispatch });

  // TODO phase this out as it is based on the current slug only!
  useExecutionScopeFetcher({ slug: contents.slug, state: state, dispatch });

  const fetchTargets = selectDependenciesToFetch(state);
  const notebookBuildTargets = selectScopeNotebooksToBuild(state);
  const sessionStartTargets = selectSessionsToStart(state);

  const memo = React.useMemo(
    () => ({
      canCompute: enable,
      slug: contents.slug,
      location: contents.location,
      state,
      dispatch,
      idkmap: idkmap.current,
    }),
    [state, contents.slug, enable],
  );

  if (typeof window !== 'undefined') {
    (window as any).executeScope = memo;
  }

  return (
    <ExecuteScopeContext.Provider value={memo}>
      <div className="hidden">
        {fetchTargets.length > 0 && (
          <div className="p-1 pl-4">
            {fetchTargets.map(({ slug, url }) => (
              <MdastFetcher key={`fetch-${slug}`} slug={slug} url={url} dispatch={dispatch} />
            ))}
          </div>
        )}
        {notebookBuildTargets.length > 0 && (
          <div className="p-1 pl-4">
            {notebookBuildTargets.map(({ pageSlug, notebookSlug }) => (
              <NotebookBuilder
                key={`build-${pageSlug}-${notebookSlug}`}
                pageSlug={pageSlug}
                notebookSlug={notebookSlug}
                idkmap={idkmap.current}
                state={state}
                dispatch={dispatch}
              />
            ))}
          </div>
        )}
        {sessionStartTargets.length > 0 && (
          <div className="p-1 pl-4">
            {sessionStartTargets.map(({ pageSlug, notebookSlug, location }) => (
              <SessionStarter
                key={`session-${pageSlug}-${notebookSlug}`}
                pageSlug={pageSlug}
                notebookSlug={notebookSlug}
                location={location}
                state={state}
                dispatch={dispatch}
              />
            ))}
          </div>
        )}
      </div>
      <ServerMonitor state={state} dispatch={dispatch} />
      {children}
    </ExecuteScopeContext.Provider>
  );
}
