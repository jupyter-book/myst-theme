import {
  useExecuteScope,
  selectIsComputable,
  selectAreExecutionScopesBuilding,
  selectExecutionScopeStatus,
  useBusyScope,
} from '@myst-theme/jupyter';
import { useThebeServer } from 'thebe-react';
import PowerIcon from '@heroicons/react/24/outline/PowerIcon';
import { Spinner } from '../Spinner';
import { Clear, Restart, Run } from './Buttons';
import classNames from 'classnames';

export function NotebookToolbar() {
  const { slug, ready, state, start, resetAll, clearAll, execute } = useExecuteScope();
  const busy = useBusyScope();
  const { connecting, connect, error: serverError } = useThebeServer();
  const computable = selectIsComputable(state, slug);
  const handleStart = () => {
    connect();
    start(slug);
  };
  const handleReset = () => resetAll(slug);
  const handleClear = () => clearAll(slug);
  const handleRun = () => execute(slug);

  const building = selectAreExecutionScopesBuilding(state, slug);
  const status = selectExecutionScopeStatus(state, slug);

  const error = !!serverError; // TODO broader build & session errors
  let title = 'Connect to a compute server';
  if (error) {
    title = 'Error connecting to compute server';
  } else if (building) {
    title = status;
  }

  if (computable)
    return (
      <div className="sticky top-[60px] flex justify-end w-full z-20">
        <div className="flex p-1 m-1 space-x-1 border rounded-full shadow border-stone-300 bg-white/80 dark:bg-stone-900/80 backdrop-blur">
          {!ready && (
            <div className="rounded">
              <button
                className={classNames(
                  'flex text-center rounded-full cursor-pointer text-stone-800 hover:opacity-100 opacity-60',
                  { 'opacity-30': connecting || building },
                )}
                onClick={handleStart}
                disabled={building}
                aria-label="start compute environment"
              >
                <PowerIcon className="inline-block w-6 h-6 align-top" title="enable compute" />
              </button>
              {(connecting || building) && !error && (
                <span
                  className="absolute top-1 left-1 z-10 w-[22px] h-[22px] opacity-100"
                  title={title}
                >
                  <Spinner size={24} />
                </span>
              )}
            </div>
          )}
          {ready && (
            <Run
              ready={ready}
              executing={busy.any(slug)}
              onClick={handleRun}
              title="Run all cells"
            />
          )}
          {ready && (
            <Restart
              ready={ready}
              restarting={false}
              onClick={handleReset}
              title="Reset notebook and restart kernel"
            />
          )}
          {ready && (
            <Clear
              ready={ready}
              disabled={busy.any(slug)}
              onClick={handleClear}
              title="Clear all cells"
            />
          )}
        </div>
      </div>
    );
  return null;
}
