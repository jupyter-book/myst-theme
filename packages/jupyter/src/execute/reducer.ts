import { SourceFileKind } from 'myst-common';
import type { ExecuteScopeAction } from './actions';
import {
  isAddMdastPayload,
  isAddNotebookPayload,
  isBuildStatusPayload,
  isNavigatePayload,
  isSlugPayload,
} from './actions';
import type { ExecuteScopeState } from './types';

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
    case 'ADD_MDAST': {
      if (!isAddMdastPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid ADD_MDAST payload');
      }
      const { slug, mdast } = action.payload;
      if (state.mdast[slug]) return state;
      return {
        ...state,
        mdast: {
          ...state.mdast,
          [slug]: { root: mdast },
        },
      };
    }
    case 'REQUEST_BUILD': {
      if (!isSlugPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid REQUEST_BUILD payload');
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
        throw new Error('Trying to set build status when there is no build state');
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
    case 'ADD_NOTEBOOK': {
      if (!isAddNotebookPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid ADD_NOTEBOOK payload');
      }
      const { renderSlug, notebookSlug, notebook, rendermime } = action.payload;
      if (!state.renderings[renderSlug]) {
        console.error(state, action.payload);
        throw new Error('Trying to add notebook when there is no rendering state');
      }
      if (state.renderings[renderSlug].scopes[notebookSlug]) {
        console.warn('Trying to add notebook scope when rendering already has one', action.payload);
        return state;
      }
      return {
        ...state,
        renderings: {
          ...state.renderings,
          [renderSlug]: {
            ...state.renderings[renderSlug],
            scopes: {
              ...state.renderings[renderSlug].scopes,
              [notebookSlug]: {
                notebook,
                rendermime,
              },
            },
          },
        },
      };
    }
  }
  return state;
}
