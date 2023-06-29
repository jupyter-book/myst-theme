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
    console.log('execute', slug);
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

  const resetAll = useCallback(
    (renderSlug: string) => {
      // directly interact with the session & notebook
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

  return { ...context, ready, start, resetAll, execute };
}

/**
 * useCellExecution a hook to govern the execute status and actions for a singel cell
 *
 * @param id
 * @returns
 */
export function useCellExecution(id: IdOrKey) {
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
  const execute = () => alert('execute the notebook for this cell');
  const clear = () => alert('clear this cell');
  const reset = (rdrSlug: string, nbSlug: string) => alert('clear this cell');

  // this needs to tie in to the cell executation status in context of the notebook
  // i.e. this cell may nnot be the origin of the execute click but should show busy if needed
  const executing = false;

  return { ready, executing, execute, clear, reset, cell };
}

export function useReadyToExecute() {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  return context.state.renderings[context.slug]?.ready ?? false;
}
