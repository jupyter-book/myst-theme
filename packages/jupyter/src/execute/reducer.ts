import { SourceFileKind } from 'myst-spec-ext';
import type { ExecuteScopeAction } from './actions.js';
import {
  isAddMdastPayload,
  isAddNotebookPayload,
  isAddSessionPayload,
  isBuildStatusPayload,
  isNavigatePayload,
  isSlugPayload,
} from './actions.js';
import type { ExecuteScopeState } from './types.js';

export function reducer(state: ExecuteScopeState, action: ExecuteScopeAction): ExecuteScopeState {
  switch (action.type) {
    case 'NAVIGATE': {
      if (!isNavigatePayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid NAVIGATE payload');
      }
      const { kind, slug, location, mdast, dependencies, computables } = action.payload;
      if (state.pages[slug]) return state;
      return {
        ...state,
        mdast: {
          ...state.mdast,
          [slug]: { root: mdast },
        },
        pages: {
          ...state.pages,
          [slug]: {
            kind,
            slug,
            location,
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
    case 'SET_RENDERING_READY': {
      if (!isSlugPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid SET_READY payload');
      }
      const { slug } = action.payload;
      if (state.pages[slug].ready) return state;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [slug]: _, ...builds } = state.builds;
      const newState = {
        ...state,
        builds,
        pages: {
          ...state.pages,
          [slug]: {
            ...state.pages[slug],
            ready: true,
          },
        },
      };
      return newState;
    }
    case 'ADD_NOTEBOOK': {
      if (!isAddNotebookPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid ADD_NOTEBOOK payload');
      }
      const { pageSlug, notebookSlug, notebook, rendermime } = action.payload;
      if (!state.pages[pageSlug]) {
        console.error(state, action.payload);
        throw new Error('Trying to add notebook when there is no rendering state');
      }
      if (state.pages[pageSlug].scopes[notebookSlug]) {
        console.warn('Trying to add notebook scope when rendering already has one', action.payload);
        return state;
      }
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageSlug]: {
            ...state.pages[pageSlug],
            scopes: {
              ...state.pages[pageSlug].scopes,
              [notebookSlug]: {
                notebook,
                rendermime,
              },
            },
          },
        },
      };
    }
    case 'ADD_SESSION': {
      if (!isAddSessionPayload(action.payload)) {
        console.error(action.payload);
        throw new Error('invalid ADD_SESSION payload');
      }
      const { pageSlug, notebookSlug, session } = action.payload;
      if (!state.pages[pageSlug]) {
        console.error(state, action.payload);
        throw new Error('Trying to add session when there is no rendering state');
      }
      if (state.pages[pageSlug].scopes[notebookSlug]?.session) {
        console.warn('Trying to add session scope when rendering already has one', action.payload);
        return state;
      }
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageSlug]: {
            ...state.pages[pageSlug],
            scopes: {
              ...state.pages[pageSlug].scopes,
              [notebookSlug]: {
                ...state.pages[pageSlug].scopes[notebookSlug],
                session,
              },
            },
          },
        },
      };
    }
  }
  return state;
}
