import React, { useCallback } from 'react';
import type { IdOrKey } from './types.js';
import { ExecuteScopeContext } from './provider.js';
import type { IThebeCell, ThebeCodeCell, ThebeEventCb, ThebeNotebook } from 'thebe-core';
import { useBusyScope } from './busy.js';
import { findErrors, useThebeConfig } from 'thebe-react';
import { SourceFileKind } from 'myst-spec-ext';
import { selectNotebookForPage } from './selectors.js';

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
    console.debug(`Jupyter: Starting ${slug}`);
    dispatch({
      type: 'REQUEST_BUILD',
      payload: {
        slug,
      },
    });
  }, []);

  const execute = (slug: string) => {
    // set busy
    Object.entries(state.pages[slug].scopes).forEach(([notebookSlug, { notebook }]) => {
      busy.clearError(slug, notebookSlug);
      busy.setNotebook(
        slug,
        notebookSlug,
        notebook.code.map((c) => c.id),
        'execute',
      );
    });

    if (clearOutputsOnExecute) {
      // clear all notebook cell outputs
      Object.values(state.pages[slug].scopes).forEach(({ notebook }) => {
        notebook.clear();
      });
    }

    // let busy state update prior to launching execute
    setTimeout(async () => {
      const handler: ThebeEventCb = (_, data) => {
        if (data.subject === 'cell' && data.status === 'idle') {
          const notebookSlug = (data.object as ThebeCodeCell).notebookId ?? 'unknown';
          busy.clearCell(slug, notebookSlug, data.id ?? 'unknown', 'execute');
        }
      };
      config?.events.on('status' as any, handler);
      // execute all cells on all notebooks
      await Promise.all(
        Object.entries(state.pages[slug].scopes).map(async ([, { notebook }]) => {
          const execReturns = await notebook.executeAll(true);
          const errs = findErrors(execReturns);
          if (errs != null) {
            console.error('errors', errs);
            busy.setError(slug, notebook.id, errs);
            busy.clearNotebook(slug, notebook.id, 'execute');
          }
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
    (pageSlug: string) => {
      Object.entries(state.pages[pageSlug]?.scopes).forEach(([, { notebook }]) => {
        notebook.clear();
      });
    },
    [state],
  );

  /**
   * resetAll resets all cells in all notebooks for a given rendering
   */
  const resetAll = useCallback(
    (pageSlug: string) => {
      Object.entries(state.pages[pageSlug]?.scopes).forEach(
        ([notebookSlug, { notebook, session }]) => {
          busy.clearError(pageSlug, notebookSlug);
          busy.setNotebook(
            pageSlug,
            notebookSlug,
            notebook.code.map((c) => c.id),
            'reset',
          );
          setTimeout(() => {
            notebook.reset();
            session?.kernel?.restart().finally(() => {
              busy.clearNotebook(pageSlug, notebookSlug, 'reset');
            });
          }, 300);
        },
      );
    },
    [state],
  );

  const ready = context.state.pages[context.slug]?.ready;

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
    throw new Error('useNotebookExecution must be used within a ExecuteScopeProvider');
  }

  const { state, dispatch, idkmap } = context;
  const target = idkmap[id] ?? {};
  const { pageSlug, notebookSlug, cellId } = target;

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

  if (target && state.pages[pageSlug]) {
    notebook = selectNotebookForPage(state, pageSlug, notebookSlug);
    if (notebook) cell = notebook?.getCellById(cellId);
  }

  const execute = () => {
    const nb = selectNotebookForPage(state, pageSlug, notebookSlug);
    busy.clearError(pageSlug, notebookSlug);
    // set busy
    busy.setNotebook(
      pageSlug,
      notebookSlug,
      nb.code.map((c) => c.id),
      'execute',
    );

    if (clearOutputsOnExecute) nb.clear();

    // let busy state update prior to launching execute
    setTimeout(async () => {
      const handler: ThebeEventCb = (_, data) => {
        if (data.subject === 'cell' && data.status === 'idle') {
          busy.clearCell(pageSlug, notebookSlug, data.id ?? 'unknown', 'execute');
        }
      };
      config?.events.on('status' as any, handler);
      // execute all cells on the notebooks
      const execReturns = await nb.executeAll(true);
      const errs = findErrors(execReturns);
      if (errs != null) {
        console.error('an error occurred during notebook execution');
        busy.setError(pageSlug, notebookSlug, errs);
        busy.clearNotebook(pageSlug, notebookSlug, 'execute');
      }
      config?.events.off('status' as any, handler);
    }, 100);
  };

  /**
   * clearAll clears all cells in all notebooks for a given rendering
   *
   */
  const clear = useCallback(() => {
    const nb = selectNotebookForPage(state, pageSlug, notebookSlug);
    nb.clear();
  }, [state]);

  /**
   * resetAll resets all cells in all notebooks for a given rendering
   */
  const reset = useCallback(() => {
    const nb = selectNotebookForPage(state, pageSlug, notebookSlug);
    busy.clearError(pageSlug, notebookSlug);
    busy.setNotebook(
      pageSlug,
      notebookSlug,
      nb.code.map((c) => c.id),
      'reset',
    );
    setTimeout(() => {
      nb.reset();
      nb.session?.kernel?.restart().finally(() => {
        busy.clearNotebook(pageSlug, notebookSlug, 'reset');
      });
    }, 300);
  }, [state]);

  const ready = context.state.pages[context.slug]?.ready;

  const notebookIsExecuting = busy.notebook(pageSlug, notebookSlug, 'execute');
  const notebookIsResetting = busy.notebook(pageSlug, notebookSlug, 'reset');
  const notebookIsBusy = notebookIsExecuting || notebookIsResetting;

  return {
    ...context,
    ready,
    start,
    clear,
    reset,
    execute,
    cellIsExecuting: cell ? busy.cell(pageSlug, notebookSlug, cell?.id, 'execute') : false,
    notebookIsExecuting,
    notebookIsResetting,
    notebookIsBusy,
    executionCount: cell?.executionCount,
  };
}

/**
 * useCellExecution a hook to govern the execute status and actions for a single cell
 *
 * @param id
 * @returns
 */
export function useCellExecution(id: IdOrKey, clearOutputsOnExecute = false) {
  const busy = useBusyScope();
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useCellExecution must be used within a ExecuteScopeProvider');
  }

  const { state, idkmap } = context;
  const target = idkmap[id] ?? {};
  const { pageSlug, notebookSlug, cellId } = target;

  let cell: IThebeCell | undefined;
  let notebook: ThebeNotebook | undefined;

  if (target && state.pages[pageSlug]) {
    notebook = selectNotebookForPage(state, pageSlug, notebookSlug);
    if (notebook) cell = notebook?.getCellById(cellId);
  }

  const ready = context.state.pages[context.slug]?.ready;
  const kind = context.state.pages[context.slug]?.kind ?? SourceFileKind.Article;

  const execute = useCallback(() => {
    if (!cell) {
      console.error('no cell found on execute', { pageSlug, notebookSlug, cellId });
      return;
    }
    // set busy
    busy.setCell(pageSlug, notebookSlug, cell.id, 'execute');
    if (clearOutputsOnExecute) cell.clear();
    // let busy state update prior to launching execute
    setTimeout(() => {
      if (!cell) throw new Error('no cell found on execute');
      cell.execute().then(() => {
        if (!cell) throw new Error('no cell found after execute');
        busy.clearCell(pageSlug, notebookSlug, cell?.id, 'execute');
      });
    }, 100);
  }, [state, cell]);

  const clear = useCallback(() => {
    if (!cell) {
      console.error('no cell found on clear', { pageSlug, notebookSlug, cellId });
      return;
    }
    cell.clear();
  }, [state, cell]);

  const notebookIsExecuting = busy.notebook(pageSlug, notebookSlug, 'execute');
  const notebookIsResetting = busy.notebook(pageSlug, notebookSlug, 'reset');
  const notebookIsBusy = notebookIsExecuting || notebookIsResetting;

  return {
    canCompute: context.canCompute,
    kind,
    ready,
    execute,
    clear,
    cellIsExecuting: cell ? busy.cell(pageSlug, notebookSlug, cell?.id, 'execute') : false,
    notebookIsExecuting,
    notebookIsResetting,
    notebookIsBusy,
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
    ready: context.state.pages[context.slug]?.ready ?? false,
  };
}

export function useReadyToExecute() {
  const context = React.useContext(ExecuteScopeContext);
  if (context === undefined) {
    throw new Error('useExecuteScope must be used within a ExecuteScopeProvider');
  }

  return context.state.pages[context.slug]?.ready ?? false;
}
