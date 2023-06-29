import React, { useCallback } from 'react';
import type { IdOrKey } from './types';
import { ExecuteScopeContext } from './provider';
import type { IThebeCell, ThebeNotebook } from 'thebe-core';
import { useBusyScope } from './busy';
import { findErrors } from 'thebe-react';

export function useExecuteScope() {
  const context = React.useContext(ExecuteScopeContext);
  const busy = useBusyScope();

  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  const { state, dispatch } = context;

  const start = useCallback((slug: string) => {
    console.log('starting...', slug);
    dispatch({
      type: 'REQUEST_BUILD',
      payload: {
        slug,
      },
    });
  }, []);

  const execute = (slug: string) => {
    // set busy
    Object.keys(state.renderings[slug].scopes).forEach((notebookSlug) => {
      console.log('busy', slug, notebookSlug);
      busy.set(slug, notebookSlug);
    });
    // clear all notebook cell outputs
    Object.values(state.renderings[slug].scopes).forEach(({ notebook }) => {
      notebook.clear();
    });

    // let busy state update prior to launching execute
    setTimeout(() => {
      // execute all cells on all notebooks
      Object.entries(state.renderings[slug].scopes).forEach(([notebookSlug, { notebook }]) => {
        console.log('executeAll', slug, { notebook });
        notebook.executeAll(true).then((execReturns) => {
          const errs = findErrors(execReturns);
          if (errs != null) console.error('errors', errs);
          // clear busy
          busy.clear(slug, notebookSlug);
        });
      });
    }, 100);
  };

  /**
   * clearAll clears all cells in all notebooks for a given rendering
   *
   */
  const clearAll = useCallback(
    (renderSlug: string) => {
      Object.entries(state.renderings[renderSlug].scopes).forEach(([, { notebook }]) => {
        notebook.clear();
      });
    },
    [state],
  );

  /**
   * resetAll resets all cells in all notebooks for a given rendering
   */
  const resetAll = useCallback(
    (renderSlug: string) => {
      Object.entries(state.renderings[renderSlug].scopes).forEach(
        ([notebookSlug, { notebook, session }]) => {
          busy.set(renderSlug, notebookSlug);
          setTimeout(async () => {
            notebook.reset();
            await session?.kernel?.restart();
            busy.clear(renderSlug, notebookSlug);
          }, 300);
        },
      );
    },
    [state],
  );

  const ready = context.state.renderings[context.slug]?.ready;

  return { ...context, ready, start, clearAll, resetAll, execute };
}

/**
 * useCellExecution a hook to govern the execute status and actions for a singel cell
 *
 * @param id
 * @returns
 */
export function useCellExecution(id: IdOrKey) {
  const busy = useBusyScope();
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  const { state, idkmap } = context;
  const target = idkmap[id] ?? {};
  const { renderSlug, notebookSlug, cellId } = target;

  let cell: IThebeCell | undefined;
  let notebook: ThebeNotebook | undefined;

  if (target && state.renderings[renderSlug]) {
    notebook = state.renderings[renderSlug].scopes[notebookSlug].notebook;
    if (!notebook) console.error('no notebook for', { renderSlug, notebookSlug, cellId });
    cell = notebook?.getCellById(cellId);
    if (!cell) console.error('no cell found', { renderSlug, notebookSlug, cellId });
  }

  const ready = context.state.renderings[context.slug]?.ready;

  const execute = useCallback(
    (rdrSlug: string, nbSlug: string) => {
      // set busy
      busy.set(rdrSlug, nbSlug);
      // clear all notebook cell outputs
      const { notebook: nb } = state.renderings[rdrSlug].scopes[nbSlug];
      nb.clear();
      // let busy state update prior to launching execute
      setTimeout(() => {
        // execute all cells on all notebooks
        nb.executeAll(true).then((execReturns) => {
          const errs = findErrors(execReturns);
          if (errs != null) console.error('errors', errs);
          // clear busy
          busy.clear(rdrSlug, nbSlug);
        });
      }, 100);
    },
    [state],
  );

  const clear = useCallback(
    (rdrSlug: string, nbSlug: string) => {
      const { notebook: nb } = state.renderings[rdrSlug].scopes[nbSlug];
      nb.clear();
    },
    [state],
  );

  const reset = useCallback(
    (rdrSlug: string, nbSlug: string) => {
      const { notebook: nb, session } = state.renderings[rdrSlug].scopes[nbSlug];
      busy.set(rdrSlug, nbSlug);
      setTimeout(async () => {
        nb.reset();
        await session?.kernel?.restart();
        busy.clear(rdrSlug, nbSlug);
      }, 300);
    },
    [state],
  );

  return { ready, execute, clear, reset, cell };
}

export function useReadyToExecute() {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  return context.state.renderings[context.slug]?.ready ?? false;
}
