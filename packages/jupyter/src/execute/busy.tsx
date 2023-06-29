import React, { useCallback, useReducer } from 'react';

interface BusyScopeState {
  renderings: {
    [renderSlug: string]: {
      [notebookSlug: string]: boolean;
    };
  }; // at least one notebook scope for this rendering is executing
}

interface BusyScopeContext {
  state: BusyScopeState;
  dispatch: React.Dispatch<BusyScopeAction>;
}

const BusyScopeContext = React.createContext<BusyScopeContext | undefined>(undefined);

interface RenderSlugPayload {
  renderSlug: string;
}

interface SlugPayload {
  renderSlug: string;
  notebookSlug: string;
}

type BusyScopeAction = {
  type: 'SET_BUSY' | 'CLEAR_BUSY';
  payload: SlugPayload;
};

function reducer(state: BusyScopeState, action: BusyScopeAction): BusyScopeState {
  console.log('reducer', action);
  switch (action.type) {
    case 'SET_BUSY':
      return {
        ...state,
        renderings: {
          ...state.renderings,
          [action.payload.renderSlug]: {
            ...state.renderings[action.payload.renderSlug],
            [action.payload.notebookSlug]: true,
          },
        },
      };
    case 'CLEAR_BUSY':
      return {
        ...state,
        renderings: {
          ...state.renderings,
          [action.payload.renderSlug]: {
            ...state.renderings[action.payload.renderSlug],
            [action.payload.notebookSlug]: false,
          },
        },
      };
  }
  return state;
}

export function BusyScopeProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { renderings: {} });

  const memo = React.useMemo(() => ({ state, dispatch }), [state]);

  return <BusyScopeContext.Provider value={memo}>{children}</BusyScopeContext.Provider>;
}

export function useBusyScope() {
  const context = React.useContext(BusyScopeContext);
  if (context === undefined) {
    throw new Error('useBusyScope must be used within a BusyScopeProvider');
  }

  const { dispatch, state } = context;

  const is = useCallback(
    (renderSlug: string, notebookSlug: string) => state.renderings[renderSlug]?.[notebookSlug],
    [state],
  );
  const any = useCallback(
    (renderSlug: string) => {
      return Object.values(state.renderings[renderSlug] ?? {}).some((v) => v);
    },
    [state],
  );
  const set = useCallback(
    (renderSlug: string, notebookSlug: string) => {
      dispatch({ type: 'SET_BUSY', payload: { renderSlug, notebookSlug } });
    },
    [dispatch],
  );
  const clear = useCallback(
    (renderSlug: string, notebookSlug: string) =>
      dispatch({ type: 'CLEAR_BUSY', payload: { renderSlug, notebookSlug } }),
    [dispatch],
  );

  return { is, any, set, clear };
}
