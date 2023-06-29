import React, { useCallback, useEffect, useReducer } from 'react';
import type { PageLoader } from '..';
import type { Dependency } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import { selectAll } from 'unist-util-select';
import type { Root } from 'mdast';

interface ExecuteScopeType {
  store: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}

const ExecuteScopeContext = React.createContext<ExecuteScopeType | undefined>(undefined);

interface ExecuteScopeState {
  mdast: {
    [slug: string]: {
      root: Root;
    };
  };
  scopes: {
    [slug: string]: {
      slug: string;
      kind: SourceFileKind;
      computable: boolean;
      dependencies: Dependency[];
      computables: Computable[];
      context?: {
        rendermime: any;
        session: any;
        notebooks: {
          slug: string;
          notebook: any;
        }[];
      };
    };
  };
}

interface Computable {
  key: string;
  label: string;
  source: Dependency;
}

function isNavigatePayload(payload: unknown): payload is NavigatePayload {
  const maybePayload = payload as NavigatePayload;
  return (
    typeof maybePayload.slug === 'string' &&
    typeof maybePayload.mdast === 'object' &&
    Array.isArray(maybePayload.dependencies) &&
    Array.isArray(maybePayload.computables)
  );
}

interface NavigatePayload {
  kind: SourceFileKind;
  slug: string;
  mdast: Root;
  dependencies: Dependency[];
  computables: Computable[];
}

function isSlugPayload(payload: unknown): payload is SlugPayload {
  return typeof (payload as SlugPayload).slug === 'string';
}

interface SlugPayload {
  slug: string;
}

interface ExecuteScopeAction {
  type: 'NAVIGATE' | 'ENABLE_SCOPE';
  payload: NavigatePayload | SlugPayload;
}

function rootReducer(state: ExecuteScopeState, action: ExecuteScopeAction) {
  switch (action.type) {
    case 'NAVIGATE': {
      if (!isNavigatePayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid NAVIGATE payload');
      }
      const { kind, slug, mdast, dependencies, computables } = action.payload;
      if (state.scopes[slug]) return state;
      return {
        ...state,
        mdast: {
          ...state.mdast,
          [slug]: { root: mdast },
        },
        scopes: {
          ...state.scopes,
          [slug]: {
            kind,
            slug,
            dependencies,
            computables,
            computable: computables.length > 0 || kind === SourceFileKind.Notebook,
          },
        },
      };
    }
    case 'ENABLE_SCOPE': {
      console.log('ENABLE_SCOPE', action.payload);
      if (!isSlugPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid ENABLE_SCOPE payload');
      }
      const { slug } = action.payload;
      if (state.scopes[slug].context) return state;
      console.log('ENABLE_SCOPE mutating');
      return {
        ...state,
        scopes: {
          ...state.scopes,
          [slug]: {
            ...state.scopes[slug],
            context: {
              rendermime: undefined,
              session: undefined,
              notebooks: [],
            },
          },
        },
      };
    }
  }
  return state;
}

function useScopeNavigate({
  article,
  scope,
  dispatch,
}: {
  article: PageLoader;
  scope: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  useEffect(() => {
    if (scope.mdast[article.slug]) {
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

export function selectIsComputable(slug: string, state: ExecuteScopeState) {
  return state.scopes[slug]?.computable ?? false;
}

export function selectIsExecutionScopeStarted(slug: string, state: ExecuteScopeState) {
  return !!state.scopes[slug]?.context;
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

  const [store, dispatch] = useReducer(rootReducer, {
    mdast: {
      [article.slug]: { root: article.mdast },
    },
    scopes: {
      [article.slug]: {
        computable: computables.length > 0 || article.kind === SourceFileKind.Notebook,
        kind: article.kind,
        slug: article.slug,
        dependencies: article.dependencies ?? [],
        computables,
      },
    },
  });

  const memo = React.useMemo(() => ({ store, dispatch }), [store]);

  useScopeNavigate({ article, scope: store, dispatch });

  return <ExecuteScopeContext.Provider value={memo}>{children}</ExecuteScopeContext.Provider>;
}

export function useExecuteScope() {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  const { dispatch } = context;

  const start = useCallback((slug: string) => {
    console;
    dispatch({
      type: 'ENABLE_SCOPE',
      payload: {
        slug,
      },
    });
  }, []);

  const restart = useCallback((slug: string) => {
    // directly interact with the session
    console.error('restart not implemented', slug);
  }, []);

  return { ...context, start, restart };
}
