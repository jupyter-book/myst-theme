import { useNotebookExecution } from '../execute/hooks';
import { Reset, Run, SpinnerStatusButton } from './Buttons';

export function ArticleStatusBadge({ id }: { id: string }) {
  const { start, ready, cellIsBusy, executionCount } = useNotebookExecution(id);
  return (
    <SpinnerStatusButton
      ready={ready}
      busy={cellIsBusy && !ready}
      modified={executionCount != null}
      onClick={start}
    />
  );
}

export function ArticleRunNotebook({ id }: { id: string }) {
  const { ready, cellIsBusy, notebookIsBusy, execute } = useNotebookExecution(id);
  if (!ready) return null;
  return (
    <Run
      ready={ready}
      executing={cellIsBusy}
      disabled={notebookIsBusy}
      onClick={execute}
      title="Run the notebook that creates this figure"
    />
  );
}

export function ArticleResetNotebook({ id }: { id: string }) {
  const { ready, cellIsBusy, notebookIsBusy, reset } = useNotebookExecution(id);
  if (!ready) return null;
  return (
    <Reset
      ready={ready}
      restarting={false}
      disabled={notebookIsBusy}
      onClick={reset}
      title="Reset the figure to its original state and restart the kernel"
    />
  );
}
