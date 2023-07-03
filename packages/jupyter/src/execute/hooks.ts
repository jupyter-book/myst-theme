import React, { useCallback } from 'react';
import type { IdOrKey } from './types';
import { ExecuteScopeContext } from './provider';
import type { IThebeCell, ThebeCell, ThebeEventCb, ThebeNotebook } from 'thebe-core';
import { useBusyScope } from './busy';
import { findErrors, useThebeConfig } from 'thebe-react';
import { SourceFileKind } from 'myst-common';

export function useExecutionScope({
  clearOutputsOnExecute = false,
}: { clearOutputsOnExecute?: boolean } = {}) {
  const context = React.useContext(ExecuteScopeContext);
  const { config } = useThebeConfig();
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
    Object.entries(state.renderings[slug].scopes).forEach(([notebookSlug, { notebook }]) => {
      busy.setNotebook(
        slug,
        notebookSlug,
        notebook.cells.map((c) => c.id),
      );
    });

    if (clearOutputsOnExecute) {
      // clear all notebook cell outputs
      Object.values(state.renderings[slug].scopes).forEach(({ notebook }) => {
        notebook.clear();
      });
    }

    // let busy state update prior to launching execute
    setTimeout(async () => {
      const handler: ThebeEventCb = (_, data) => {
        if (data.subject === 'cell' && data.status === 'idle') {
          const notebookSlug = (data.object as ThebeCell).notebookId ?? 'unknown';
          busy.clearCell(slug, notebookSlug, data.id ?? 'unknown');
        }
      };
      config?.events.on('status' as any, handler);
      // execute all cells on all notebooks
      await Promise.all(
        Object.entries(state.renderings[slug].scopes).map(async ([, { notebook }]) => {
          const execReturns = await notebook.executeAll(true);
          const errs = findErrors(execReturns);
          if (errs != null) console.error('errors', errs);
        }),
      );
      config?.events.off('status' as any, handler);
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
          busy.setNotebook(
            renderSlug,
            notebookSlug,
            notebook.cells.map((c) => c.id),
          );
          setTimeout(async () => {
            notebook.reset();
            await session?.kernel?.restart();
            busy.clearNotebook(renderSlug, notebookSlug);
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
 * useNotebookExecution a hook to govern notebook execution in the context of a single
 * cell embedded in an article
 *
 */
export function useNotebookExecution(id: IdOrKey, clearOutputsOnExecute = false) {
  const context = React.useContext(ExecuteScopeContext);
  const { config } = useThebeConfig();
  const busy = useBusyScope();
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  const { state, dispatch, idkmap } = context;
  const target = idkmap[id] ?? {};
  const { renderSlug, notebookSlug, cellId } = target;

  // TODO consider extending this to start only the notebook requested, currently this will
  // execute all connected notebooks
  const start = useCallback(() => {
    dispatch({
      type: 'REQUEST_BUILD',
      payload: {
        slug: context.slug,
      },
    });
  }, [target]);

  let cell: IThebeCell | undefined;
  let notebook: ThebeNotebook | undefined;

  if (target && state.renderings[renderSlug]) {
    notebook = state.renderings[renderSlug].scopes[notebookSlug].notebook;
    if (!notebook) console.error('no notebook for', { renderSlug, notebookSlug, cellId });
    cell = notebook?.getCellById(cellId);
    if (!cell) console.error('no cell found', { renderSlug, notebookSlug, cellId });
  }

  const execute = () => {
    const nb = state.renderings[renderSlug]?.scopes[notebookSlug]?.notebook;
    // set busy
    busy.setNotebook(
      renderSlug,
      notebookSlug,
      nb.cells.map((c) => c.id),
    );

    if (clearOutputsOnExecute) nb.clear();

    // let busy state update prior to launching execute
    setTimeout(async () => {
      const handler: ThebeEventCb = (_, data) => {
        if (data.subject === 'cell' && data.status === 'idle') {
          busy.clearCell(renderSlug, notebookSlug, data.id ?? 'unknown');
        }
      };
      config?.events.on('status' as any, handler);
      // execute all cells on the notebooks
      const execReturns = await nb.executeAll(true);
      const errs = findErrors(execReturns);
      if (errs != null) console.error('errors', errs); // TODO: handle errors
      config?.events.off('status' as any, handler);
    }, 100);
  };

  /**
   * clearAll clears all cells in all notebooks for a given rendering
   *
   */
  const clear = useCallback(() => {
    const nb = state.renderings[renderSlug]?.scopes[notebookSlug]?.notebook;
    nb.clear();
  }, [state]);

  /**
   * resetAll resets all cells in all notebooks for a given rendering
   */
  const reset = useCallback(() => {
    const { notebook: nb, session } = state.renderings[renderSlug]?.scopes[notebookSlug] ?? {};
    busy.setNotebook(
      renderSlug,
      notebookSlug,
      nb.cells.map((c) => c.id),
    );
    setTimeout(() => {
      nb.reset();
      session?.kernel?.restart().finally(() => {
        busy.clearNotebook(renderSlug, notebookSlug);
      });
    }, 300);
  }, [state]);

  const ready = context.state.renderings[context.slug]?.ready;

  return {
    ...context,
    ready,
    start,
    clear,
    reset,
    execute,
    cellIsBusy: cell ? busy.cell(renderSlug, notebookSlug, cell?.id) : false,
    notebookIsBusy: busy.notebook(renderSlug, notebookSlug),
    executionCount: cell?.executionCount,
  };
}

/**
 * useCellExecution a hook to govern the execute status and actions for a single cell
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
  const kind = context.state.renderings[context.slug]?.kind ?? SourceFileKind.Article;

  const execute = useCallback(() => {
    if (!cell) {
      console.error('no cell found on execute', { renderSlug, notebookSlug, cellId });
      return;
    }
    // set busy
    busy.setCell(renderSlug, notebookSlug, cell.id);
    cell.clear();
    // let busy state update prior to launching execute
    setTimeout(() => {
      if (!cell) throw new Error('no cell found on execute');
      cell.execute().then(() => {
        if (!cell) throw new Error('no cell found after execute');
        busy.clearCell(renderSlug, notebookSlug, cell?.id);
      });
    }, 100);
  }, [state, cell]);

  const clear = useCallback(() => {
    if (!cell) {
      console.error('no cell found on clear', { renderSlug, notebookSlug, cellId });
      return;
    }
    cell.clear();
  }, [state, cell]);

  return {
    kind,
    ready,
    execute,
    clear,
    cellIsBusy: cell ? busy.cell(renderSlug, notebookSlug, cell?.id) : false,
    notebookIsBusy: busy.notebook(renderSlug, notebookSlug),
    cell,
  };
}

export function useIsAComputableCell(id: IdOrKey) {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  const { idkmap } = context;
  const target = idkmap[id] ?? {};

  return {
    slug: context.slug,
    computable: !!target,
    ready: context.state.renderings[context.slug]?.ready ?? false,
  };
}

export function useReadyToExecute() {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  return context.state.renderings[context.slug]?.ready ?? false;
}
