import React, { useEffect, useReducer } from 'react';
import type { PageLoader } from '..';
import type { Dependency } from 'myst-common';
import { selectAll } from 'unist-util-select';

interface ExecuteScopeType {
  scope: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}

const ExecuteScopeContext = React.createContext<ExecuteScopeType | undefined>(undefined);

interface ExecuteScopeState {
  items: {
    [slug: string]: ExecuteScopeItem;
  };
}

interface Computable {
  key: string;
  label: string;
  source: Dependency;
}

interface ExecuteScopeItem {
  article: PageLoader;
  slug: string;
  dependencies: Dependency[];
  computables: Computable[];
}

interface NavigatePayload {
  slug: string;
  dependencies: Dependency[];
  computables: Computable[];
  article: PageLoader;
}

interface ExecuteScopeAction {
  type: 'navigate';
  payload: NavigatePayload;
}

function rootReducer(state: ExecuteScopeState, action: ExecuteScopeAction) {
  switch (action.type) {
    case 'navigate': {
      if (state.items[action.payload.slug]) return state;
      const { slug, dependencies, computables, article } = action.payload;
      return {
        ...state,
        items: {
          ...state.items,
          [slug]: { article, slug, dependencies, computables },
        },
      };
    }
  }
  return state;
}

/*
  Questions:

  - what is the best thing to use to parse the mdast?
  - what is the mechanism to fetch the json for a page?
  - is there a page cache?
  - should we maintain the execute scope for state for each page, so that things are not reset
    when we navigate away from a page?
*/

/**
 *  The ExecuteScopeProvider is responsible for maintaining the state of the
 *  execution scope. It is also responsible for fetching the json for a page
 *  and parsing it into an mdast.
 *
 * @param param0
 * @returns
 */
export function ExecuteScopeProvider({
  children,
  article,
}: React.PropsWithChildren<{ article: PageLoader }>) {
  const [scope, dispatch] = useReducer(rootReducer, {
    items: {},
  });
  const store = React.useMemo(() => ({ scope, dispatch }), [scope]);

  useEffect(() => {
    console.log('ExecuteScopeProvider - navigating', article.slug);
    if (scope.items[article.slug]) {
      console.log(`ExecuteScopeProvider - ${article.slug} is already in scope`);
      return;
    }

    const computables: Computable[] = selectAll('container > embed', article.mdast).map(
      (node: any) => {
        const { key, label, source } = node;
        return { key, label, source };
      },
    );

    console.log('ExecuteScopeProvider - computables', computables);

    dispatch({
      type: 'navigate',
      payload: {
        article,
        slug: article.slug,
        dependencies: article.dependencies ?? [],
        computables,
      },
    });
  }, [article.slug]);

  return <ExecuteScopeContext.Provider value={store}>{children}</ExecuteScopeContext.Provider>;
}

export function useExecuteScope() {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }
  return context;
}
