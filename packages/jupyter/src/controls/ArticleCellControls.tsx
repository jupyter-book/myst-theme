import { useThebeServer } from 'thebe-react';
import { useNotebookExecution } from '../execute/hooks.js';
import { Restart, Run, SpinnerStatusButton } from './Buttons.js';

import { selectAreExecutionScopesBuilding } from '../execute/index.js';

export function ArticleStatusBadge({ id }: { id: string }) {
  const { connect, connecting } = useThebeServer();
  const { slug, state, start, ready, executionCount } = useNotebookExecution(id);

  const building = selectAreExecutionScopesBuilding(state, slug);

  const handleStart = () => {
    if (!connect) {
      console.debug("ArticleStatusBadge: Trying to start a connection but connect() isn't defined");
      return;
    }
    connect();
    start();
  };

  return (
    <SpinnerStatusButton
      ready={ready}
      busy={building || connecting}
      modified={executionCount != null}
      onClick={handleStart}
    />
  );
}

export function ArticleRunNotebook({ id }: { id: string }) {
  const { ready, cellIsExecuting, notebookIsBusy, execute } = useNotebookExecution(id);
  if (!ready) return null;
  return (
    <Run
      ready={ready}
      executing={cellIsExecuting}
      disabled={notebookIsBusy}
      onClick={execute}
      title="Run the notebook that creates this figure"
    />
  );
}

export function ArticleResetNotebook({ id }: { id: string }) {
  const { ready, notebookIsResetting, notebookIsBusy, reset } = useNotebookExecution(id);
  if (!ready) return null;
  return (
    <Restart
      ready={ready}
      resetting={notebookIsResetting}
      disabled={notebookIsBusy}
      onClick={reset}
      title="Reset the figure to its original state and restart the kernel"
    />
  );
}
