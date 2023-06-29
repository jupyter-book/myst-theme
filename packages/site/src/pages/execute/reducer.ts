import type { Dependency } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import type { Root } from 'mdast';
import type { Computable, ExecuteScopeAction } from './actions';
import {
  isBuildStatusPayload,
  isEnableScopePayload,
  isNavigatePayload,
  isSlugPayload,
} from './actions';

export type BuildStatus = 'pending' | 'fetching' | 'scoping' | 'error';

export interface ExecuteScopeState {
  mdast: {
    [slug: string]: {
      root: Root;
    };
  };
  renderings: {
    [slug: string]: {
      slug: string;
      kind: SourceFileKind;
      computable: boolean;
      dependencies: Dependency[];
      computables: Computable[];
      ready: boolean;
      scopes: {
        [slug: string]: ExecutionScope;
      };
    };
  };
  builds: {
    [slug: string]: {
      status: BuildStatus;
    };
  };
}

export interface ExecutionScope {
  rendermime: any;
  session: any;
  notebook: any;
}

export function reducer(state: ExecuteScopeState, action: ExecuteScopeAction): ExecuteScopeState {
  switch (action.type) {
    case 'NAVIGATE': {
      if (!isNavigatePayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid NAVIGATE payload');
      }
      const { kind, slug, mdast, dependencies, computables } = action.payload;
      if (state.renderings[slug]) return state;
      return {
        ...state,
        mdast: {
          ...state.mdast,
          [slug]: { root: mdast },
        },
        renderings: {
          ...state.renderings,
          [slug]: {
            kind,
            slug,
            dependencies,
            computables,
            computable: computables.length > 0 || kind === SourceFileKind.Notebook,
            ready: false,
            scopes: {},
          },
        },
      };
    }
    case 'REQUEST_BUILD': {
      if (!isSlugPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid ENABLE_SCOPE payload');
      }
      const { slug } = action.payload;
      if (!!state.builds[slug] && state.builds[slug].status === 'pending') return state;
      return {
        ...state,
        builds: {
          ...state.builds,
          [slug]: {
            status: 'pending',
          },
        },
      };
    }
    case 'BUILD_STATUS': {
      if (!isBuildStatusPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid BUILD_STATUS payload');
      }
      const { slug } = action.payload;
      if (!state.builds[slug]) {
        console.error(state, action.payload);
        throw new Error('Trying to set build staus when there is no build state');
      }
      if (state.builds[slug].status === action.payload.status) return state;
      return {
        ...state,
        builds: {
          ...state.builds,
          [slug]: {
            ...state.builds[slug],
            status: action.payload.status,
          },
        },
      };
    }
    case 'CLEAR_BUILD': {
      if (!isSlugPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid CLEAR_BUILD payload');
      }
      const { slug } = action.payload;
      if (!state.builds[slug]) return state;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [slug]: _, ...builds } = state.builds;
      return {
        ...state,
        builds,
      };
    }
    case 'ENABLE_SCOPE': {
      if (!isEnableScopePayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid ENABLE_SCOPE payload');
      }
      const { renderingSlug, scopeSlug } = action.payload;
      if (state.renderings[renderingSlug].scopes[scopeSlug]) return state;
      return {
        ...state,
        renderings: {
          ...state.renderings,
          [renderingSlug]: {
            ...state.renderings[renderingSlug],
            scopes: {
              ...state.renderings[renderingSlug].scopes,
              [scopeSlug]: {
                rendermime: undefined,
                session: undefined,
                notebook: undefined,
              },
            },
          },
        },
      };
    }
  }
  return state;
}
