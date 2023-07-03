import React, { useCallback, useReducer } from 'react';

export type BusyKind = 'execute' | 'reset';

export interface BusyScopeState {
  execute: {
    [pageSlug: string]: {
      [notebookSlug: string]: {
        [cellId: string]: boolean;
      };
    };
  };
  reset: {
    [pageSlug: string]: {
      [notebookSlug: string]: {
        [cellId: string]: boolean;
      };
    };
  };
}

export interface BusyScopeContext {
  state: BusyScopeState;
  dispatch: React.Dispatch<BusyScopeAction>;
}

const BusyScopeContext = React.createContext<BusyScopeContext | undefined>(undefined);

function isSlugPayload(payload: unknown): payload is SlugPayload {
  return (
    typeof (payload as SlugPayload).pageSlug === 'string' &&
    typeof (payload as SlugPayload).notebookSlug === 'string' &&
    typeof (payload as SlugPayload).kind === 'string'
  );
}

export interface SlugPayload {
  pageSlug: string;
  notebookSlug: string;
  kind: BusyKind;
}

function isCellPayload(payload: unknown): payload is CellPayload {
  return (
    isSlugPayload(payload) &&
    typeof (payload as CellPayload).cellId === 'string' &&
    typeof (payload as CellPayload).kind === 'string'
  );
}

export interface CellPayload {
  pageSlug: string;
  notebookSlug: string;
  cellId: string;
  kind: BusyKind;
}

function isNotebookPayload(payload: unknown): payload is NotebookPayload {
  return (
    isSlugPayload(payload) &&
    Array.isArray((payload as NotebookPayload).cellIds) &&
    (payload as NotebookPayload).cellIds.every((id) => typeof id === 'string') &&
    typeof (payload as NotebookPayload).kind === 'string'
  );
}

export interface NotebookPayload {
  pageSlug: string;
  notebookSlug: string;
  cellIds: string[];
  kind: BusyKind;
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
      const { pageSlug, notebookSlug, cellId, kind } = action.payload;
      if (state[kind][pageSlug]?.[notebookSlug]?.[cellId]) return state;
      return {
        ...state,
        [kind]: {
          ...state[kind],
          [pageSlug]: {
            ...state[kind][pageSlug],
            [notebookSlug]: {
              ...state[kind][pageSlug]?.[notebookSlug],
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
      const { pageSlug, notebookSlug, cellId, kind } = action.payload;

      const { [pageSlug]: renderBusy, ...otherRenders } = state[kind];
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
          [kind]: otherRenders,
        };
      }

      // remove the notebook if it's empty
      if (Object.keys(otherCells).length === 0) {
        return {
          ...state,
          [kind]: {
            ...state[kind],
            [pageSlug]: {
              ...otherNotebooks,
            },
          },
        };
      }

      return {
        ...state,
        [kind]: {
          ...state[kind],
          [action.payload.pageSlug]: {
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

      const { pageSlug, notebookSlug, cellIds, kind } = action.payload;

      return {
        ...state,
        [kind]: {
          ...state[kind],
          [pageSlug]: {
            ...state[kind][pageSlug],
            [notebookSlug]: {
              ...state[kind][pageSlug]?.[notebookSlug],
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

      const { pageSlug, notebookSlug, kind } = action.payload;

      if (!state[kind][pageSlug]) return state;
      if (!state[kind][pageSlug]?.[notebookSlug]) return state;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [notebookSlug]: notebookBusy, ...otherNotebooks } = state[kind][pageSlug];

      if (Object.keys(otherNotebooks).length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [pageSlug]: renderBusy, ...otherRenders } = state[kind];
        return {
          ...state,
          [kind]: otherRenders,
        };
      }

      return {
        ...state,
        [kind]: {
          ...state[kind],
          [pageSlug]: {
            ...otherNotebooks,
          },
        },
      };
    }
  }
  return state;
}

export function BusyScopeProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { execute: {}, reset: {} });

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
    (pageSlug: string, notebookSlug: string, cellId: string, kind: BusyKind) =>
      selectCellIsBusy(state, pageSlug, notebookSlug, cellId, kind),
    [state],
  );
  const notebook = useCallback(
    (pageSlug: string, notebookSlug: string, kind: BusyKind) =>
      selectNotebookIsBusy(state, pageSlug, notebookSlug, kind),
    [state],
  );
  const page = useCallback(
    (pageSlug: string, kind: BusyKind) => selectPageIsBusy(state, pageSlug, kind),
    [state],
  );

  const setCell = useCallback(
    (pageSlug: string, notebookSlug: string, cellId: string, kind: BusyKind) => {
      dispatch({ type: 'SET_CELL_BUSY', payload: { pageSlug, notebookSlug, cellId, kind } });
    },
    [dispatch],
  );

  const clearCell = useCallback(
    (pageSlug: string, notebookSlug: string, cellId: string, kind: BusyKind) =>
      dispatch({ type: 'CLEAR_CELL_BUSY', payload: { pageSlug, notebookSlug, cellId, kind } }),
    [dispatch],
  );

  const setNotebook = useCallback(
    (pageSlug: string, notebookSlug: string, cellIds: string[], kind: BusyKind) =>
      dispatch({ type: 'SET_NOTEBOOK_BUSY', payload: { pageSlug, notebookSlug, cellIds, kind } }),
    [dispatch],
  );

  const clearNotebook = useCallback(
    (pageSlug: string, notebookSlug: string, kind: BusyKind) =>
      dispatch({ type: 'CLEAR_NOTEBOOK_BUSY', payload: { pageSlug, notebookSlug, kind } }),
    [dispatch],
  );

  return { cell, notebook, page, setCell, clearCell, setNotebook, clearNotebook };
}

export function selectCellIsBusy(
  state: BusyScopeState,
  pageSlug: string,
  notebookSlug: string,
  cellId: string,
  kind: BusyKind,
) {
  return state[kind][pageSlug]?.[notebookSlug]?.[cellId];
}

// export function selectCellIsExecuting(
//   state: BusyScopeState,
//   pageSlug: string,
//   notebookSlug: string,
//   cellId: string,
// ) {
//   return state.execute[pageSlug]?.[notebookSlug]?.[cellId];
// }

// export function selectCellIsResetting(
//   state: BusyScopeState,
//   pageSlug: string,
//   notebookSlug: string,
//   cellId: string,
// ) {
//   return state.execute[pageSlug]?.[notebookSlug]?.[cellId];
// }

/**
 * a fast selector relying on the fact that if at least one cell is present, the notebook is busy
 *
 * @param state
 * @param pageSlug
 * @param notebookSlug
 * @returns
 */
export function selectNotebookIsBusy(
  state: BusyScopeState,
  pageSlug: string,
  notebookSlug: string,
  kind: BusyKind,
) {
  return !!state[kind][pageSlug]?.[notebookSlug];
}

// export function selectNotebookIsExecuting(
//   state: BusyScopeState,
//   pageSlug: string,
//   notebookSlug: string,
// ) {
//   return !!state.execute[pageSlug]?.[notebookSlug];
// }

// export function selectNotebookIsResetting(
//   state: BusyScopeState,
//   pageSlug: string,
//   notebookSlug: string,
// ) {
//   return !!state.reset[pageSlug]?.[notebookSlug];
// }

/**
 * a fast selector relying on the fact that if at least one notebook is present, the render is busy
 *
 * @param state
 * @param pageSlug
 * @returns
 */
export function selectPageIsBusy(state: BusyScopeState, pageSlug: string, kind: BusyKind) {
  return !!state[kind][pageSlug];
}

// export function selectPageIsExecuting(state: BusyScopeState, pageSlug: string) {
//   return !!state.execute[pageSlug];
// }

// export function selectPageIsResetting(state: BusyScopeState, pageSlug: string) {
//   return !!state.reset[pageSlug];
// }
