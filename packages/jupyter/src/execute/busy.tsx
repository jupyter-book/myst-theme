import React, { useCallback, useReducer } from 'react';

export interface BusyScopeState {
  renderings: {
    [renderSlug: string]: {
      [notebookSlug: string]: {
        [cellId: string]: boolean;
      };
    };
  }; // at least one notebook scope for this rendering is executing
}

export interface BusyScopeContext {
  state: BusyScopeState;
  dispatch: React.Dispatch<BusyScopeAction>;
}

const BusyScopeContext = React.createContext<BusyScopeContext | undefined>(undefined);

function isSlugPayload(payload: unknown): payload is SlugPayload {
  return (
    typeof (payload as SlugPayload).renderSlug === 'string' &&
    typeof (payload as SlugPayload).notebookSlug === 'string'
  );
}

export interface SlugPayload {
  renderSlug: string;
  notebookSlug: string;
}

function isCellPayload(payload: unknown): payload is CellPayload {
  return isSlugPayload(payload) && typeof (payload as CellPayload).cellId === 'string';
}

export interface CellPayload {
  renderSlug: string;
  notebookSlug: string;
  cellId: string;
}

function isNotebookPayload(payload: unknown): payload is NotebookPayload {
  return (
    isSlugPayload(payload) &&
    Array.isArray((payload as NotebookPayload).cellIds) &&
    (payload as NotebookPayload).cellIds.every((id) => typeof id === 'string')
  );
}

export interface NotebookPayload {
  renderSlug: string;
  notebookSlug: string;
  cellIds: string[];
}

// TODO action typing is not giving build time type errors :(
type BusyScopeAction = {
  type: 'SET_CELL_BUSY' | 'CLEAR_CELL_BUSY' | 'SET_NOTEBOOK_BUSY' | 'CLEAR_NOTEBOOK_BUSY';
  payload: SlugPayload | CellPayload | NotebookPayload;
};

export function reducer(state: BusyScopeState, action: BusyScopeAction): BusyScopeState {
  switch (action.type) {
    case 'SET_CELL_BUSY': {
      if (!isCellPayload(action.payload)) {
        console.error('SET_CELL_BUSY payload must be a cell payload', action.payload);
        return state;
      }
      const { renderSlug, notebookSlug, cellId } = action.payload;
      if (state.renderings[renderSlug]?.[notebookSlug]?.[cellId]) return state;
      return {
        ...state,
        renderings: {
          ...state.renderings,
          [renderSlug]: {
            ...state.renderings[renderSlug],
            [notebookSlug]: {
              ...state.renderings[renderSlug]?.[notebookSlug],
              [cellId]: true,
            },
          },
        },
      };
    }
    case 'CLEAR_CELL_BUSY': {
      if (!isCellPayload(action.payload)) {
        console.error('CLEAR_CELL_BUSY payload must be a cell payload', action.payload);
        return state;
      }
      const { renderSlug, notebookSlug, cellId } = action.payload;

      const { [renderSlug]: renderBusy, ...otherRenders } = state.renderings;
      if (!renderBusy) return state;

      const { [notebookSlug]: notebookBusy, ...otherNotebooks } = renderBusy;
      if (!notebookBusy) return state;

      if (!notebookBusy[cellId]) return state;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [cellId]: cellBusy, ...otherCells } = notebookBusy;

      // remove the render if it's empty
      if (Object.keys(otherCells).length === 0 && Object.keys(otherNotebooks).length === 0) {
        return {
          ...state,
          renderings: otherRenders,
        };
      }

      // remove the notebook if it's empty
      if (Object.keys(otherCells).length === 0) {
        return {
          ...state,
          renderings: {
            ...state.renderings,
            [renderSlug]: {
              ...otherNotebooks,
            },
          },
        };
      }

      return {
        ...state,
        renderings: {
          ...state.renderings,
          [action.payload.renderSlug]: {
            ...otherNotebooks,
            [notebookSlug]: {
              ...otherCells,
            },
          },
        },
      };
    }
    case 'SET_NOTEBOOK_BUSY': {
      if (!isNotebookPayload(action.payload)) {
        console.error('SET_NOTEBOOK_BUSY payload must be a notebook payload', action.payload);
        return state;
      }

      const { renderSlug, notebookSlug, cellIds } = action.payload;

      return {
        ...state,
        renderings: {
          ...state.renderings,
          [renderSlug]: {
            ...state.renderings[renderSlug],
            [notebookSlug]: {
              ...state.renderings[renderSlug]?.[notebookSlug],
              ...cellIds.reduce((acc, cellId) => ({ ...acc, [cellId]: true }), {}),
            },
          },
        },
      };
    }
    case 'CLEAR_NOTEBOOK_BUSY': {
      if (!isSlugPayload(action.payload)) {
        console.error('CLEAR_NOTEBOOK_BUSY payload must be a notebook payload', action.payload);
        return state;
      }

      const { renderSlug, notebookSlug } = action.payload;

      if (!state.renderings[renderSlug]) return state;
      if (!state.renderings[renderSlug]?.[notebookSlug]) return state;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [notebookSlug]: notebookBusy, ...otherNotebooks } = state.renderings[renderSlug];

      return {
        ...state,
        renderings: {
          ...state.renderings,
          [renderSlug]: {
            ...otherNotebooks,
          },
        },
      };
    }
  }
  return state;
}

export function BusyScopeProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { renderings: {} });

  const memo = React.useMemo(() => ({ state, dispatch }), [state]);
  console.log('BusyScopeProvider', memo.state);

  if (typeof window !== 'undefined') {
    (window as any).busyScopeState = memo.state;
  }
  return <BusyScopeContext.Provider value={memo}>{children}</BusyScopeContext.Provider>;
}

export function useBusyScope() {
  const context = React.useContext(BusyScopeContext);
  if (context === undefined) {
    throw new Error('useBusyScope must be used within a BusyScopeProvider');
  }

  const { dispatch, state } = context;

  const cell = useCallback(
    (renderSlug: string, notebookSlug: string, cellId: string) =>
      selectCellIsBusy(state, renderSlug, notebookSlug, cellId),
    [state],
  );
  const notebook = useCallback(
    (renderSlug: string, notebookSlug: string) =>
      selectNotebookIsBusy(state, renderSlug, notebookSlug),
    [state],
  );
  const render = useCallback(
    (renderSlug: string) => selectRenderIsBusy(state, renderSlug),
    [state],
  );

  const setCell = useCallback(
    (renderSlug: string, notebookSlug: string, cellId: string) => {
      dispatch({ type: 'SET_CELL_BUSY', payload: { renderSlug, notebookSlug, cellId } });
    },
    [dispatch],
  );

  const clearCell = useCallback(
    (renderSlug: string, notebookSlug: string, cellId: string) =>
      dispatch({ type: 'CLEAR_CELL_BUSY', payload: { renderSlug, notebookSlug, cellId } }),
    [dispatch],
  );

  const setNotebook = useCallback(
    (renderSlug: string, notebookSlug: string, cellIds: string[]) =>
      dispatch({ type: 'SET_NOTEBOOK_BUSY', payload: { renderSlug, notebookSlug, cellIds } }),
    [dispatch],
  );

  const clearNotebook = useCallback(
    (renderSlug: string, notebookSlug: string) =>
      dispatch({ type: 'CLEAR_NOTEBOOK_BUSY', payload: { renderSlug, notebookSlug } }),
    [dispatch],
  );

  return { cell, notebook, render, setCell, clearCell, setNotebook, clearNotebook };
}

export function selectCellIsBusy(
  state: BusyScopeState,
  renderSlug: string,
  notebookSlug: string,
  cellId: string,
) {
  return !!state.renderings[renderSlug]?.[notebookSlug]?.[cellId];
}

/**
 * a fast selector relying on the fact that if at least one cell is present, the notebook is busy
 *
 * @param state
 * @param renderSlug
 * @param notebookSlug
 * @returns
 */
export function selectNotebookIsBusy(
  state: BusyScopeState,
  renderSlug: string,
  notebookSlug: string,
) {
  return !!state.renderings[renderSlug]?.[notebookSlug];
}

/**
 * a fast selector relying on the fact that if at least one notebook is present, the render is busy
 *
 * @param state
 * @param renderSlug
 * @returns
 */
export function selectRenderIsBusy(state: BusyScopeState, renderSlug: string) {
  return !!state.renderings[renderSlug];
}
