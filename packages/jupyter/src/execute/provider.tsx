import type { Dependency } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import type { Root } from 'mdast';
import React, { useEffect, useReducer, useRef } from 'react';
import { selectAll } from 'unist-util-select';
import type { ExecuteScopeAction } from './actions';
import type { Computable, ExecuteScopeState, IdKeyMap } from './types';
import { reducer } from './reducer';
import {
  selectAreAllDependenciesReady,
  selectDependenciesToFetch,
  selectScopeNotebooksToBuild,
  selectSessionsToStart,
} from './selectors';
import { MdastFetcher, NotebookBuilder, ServerMonitor, SessionStarter } from './leaf';
import { useCanCompute } from '..';
import type { Thebe } from 'myst-frontmatter';

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
  mdast: Root;
  dependencies?: Dependency[];
  frontmatter: { thebe?: boolean | Thebe };
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
    if (state.pages[slug]) {
      console.debug(`Jupyter: ExecuteScopeProvider - ${slug} is already in scope`);
      return;
    }

    const computables: Computable[] = selectAll('container > embed', mdast).map((node: any) => {
      const { key, label, source } = node;
      const output = selectAll('output', node);
      if (output.length === 0) console.error(`embed must have exactly one output ${key}`);
      if (output.length > 1) console.warn(`embed has more than one output block ${key}}`);
      return { embedKey: key, outputKey: (output[0] as any).key, label, source };
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
 *  and adding them to the sources tree.
 */
export function ExecuteScopeProvider({
  children,
  contents,
}: React.PropsWithChildren<{ contents: ArticleContents }>) {
  const canCompute = useCanCompute(contents);
  // compute incoming for first render
  const computables: Computable[] = selectAll('container > embed', contents.mdast).map(
    (node: any) => {
      const { key, label, source } = node;
      const output = selectAll('output', node);
      if (output.length === 0) console.error(`embed must have exactly one output ${key}`);
      if (output.length > 1) console.warn(`embed has mpre than one output block ${key}}`);
      return { embedKey: key, outputKey: (output[0] as any).key, label, source };
    },
  );

  const initialState: ExecuteScopeState = {
    mdast: {
      [contents.slug]: { root: contents.mdast },
    },
    pages: {
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

  const idkmap = useRef<IdKeyMap>({});

  useScopeNavigate({ contents, state: state, dispatch });

  // TODO phase this out as it is based on the current slug only!
  useExecutionScopeFetcher({ slug: contents.slug, state: state, dispatch });

  const fetchTargets: { slug: string; url: string }[] = selectDependenciesToFetch(state);
  const notebookBuildTargets: { pageSlug: string; notebookSlug: string }[] =
    selectScopeNotebooksToBuild(state);
  const sessionStartTargets: { pageSlug: string; notebookSlug: string }[] =
    selectSessionsToStart(state);

  const memo = React.useMemo(
    () => ({ canCompute, slug: contents.slug, state, dispatch, idkmap: idkmap.current }),
    [state, contents.slug],
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
            {sessionStartTargets.map(({ pageSlug, notebookSlug }) => (
              <SessionStarter
                key={`session-${pageSlug}-${notebookSlug}`}
                pageSlug={pageSlug}
                notebookSlug={notebookSlug}
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
