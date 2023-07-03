import { useThebeServer } from 'thebe-react';
import { useNotebookExecution } from '../execute/hooks';
import { Reset, Run, SpinnerStatusButton } from './Buttons';

import { selectAreExecutionScopesBuilding } from '../execute';

export function ArticleStatusBadge({ id }: { id: string }) {
  const { connect, connecting } = useThebeServer();
  const { slug, state, start, ready, executionCount } = useNotebookExecution(id);

  const building = selectAreExecutionScopesBuilding(state, slug);

  const handleStart = () => {
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
    <Reset
      ready={ready}
      resetting={notebookIsResetting}
      disabled={notebookIsBusy}
      onClick={reset}
      title="Reset the figure to its original state and restart the kernel"
    />
  );
}
