import { useThebeServer } from 'thebe-react';
import { useNotebookExecution } from '../execute/hooks';
import { Reset, Run, SpinnerStatusButton } from './Buttons';
import Bolt from '@heroicons/react/24/outline/BoltIcon';
import PowerIcon from '@heroicons/react/24/outline/PowerIcon';
import { selectAreExecutionScopesBuilding } from '../execute';

export function ArticleStatusBadge({ id }: { id: string }) {
  const { connect, connecting } = useThebeServer();
  const { slug, state, start, ready, executionCount } = useNotebookExecution(id);
  const icon = ready ? <Bolt className="w-6 h-6" /> : <PowerIcon className="w-6 h-6" />;

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
      icon={icon}
      onClick={handleStart}
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
