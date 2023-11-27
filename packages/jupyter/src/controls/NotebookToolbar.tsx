import {
  useExecutionScope,
  selectIsComputable,
  selectAreExecutionScopesBuilding,
  selectExecutionScopeStatus,
  useBusyScope,
} from '../execute/index.js';
import { useThebeServer } from 'thebe-react';
import { PowerIcon } from '@heroicons/react/24/outline';
import { Spinner } from './Spinner.js';
import { Clear, Launch, Restart, Run } from './Buttons.js';
import classNames from 'classnames';

export function NotebookToolbar({ showLaunch = false }: { showLaunch?: boolean }) {
  const { slug, ready, state, start, resetAll, clearAll, execute } = useExecutionScope();
  const busy = useBusyScope();
  const { connecting, connect, ready: serverReady, server, error: serverError } = useThebeServer();
  const computable = selectIsComputable(state, slug);
  const handleStart = () => {
    if (!connect) {
      console.debug("NotebookToolbar: Trying to start a connection but connect() isn't defined");
      return;
    }
    connect();
    start(slug);
  };
  const handleReset = () => resetAll(slug);
  const handleClear = () => clearAll(slug);
  const handleRun = () => execute(slug);
  const handleLaunch = () => {
    if (!serverReady || !server?.settings) return;
    window.open(`${server.settings.baseUrl}?token=${server.settings.token}`, '_blank');
  };

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
      <div className="sticky top-[60px] flex justify-end w-full z-20 pointer-events-none">
        <div className="flex p-1 m-1 space-x-1 border rounded-full shadow pointer-events-auto border-stone-300 bg-white/80 dark:bg-stone-900/80 backdrop-blur">
          {!ready && (
            <div className="rounded">
              <button
                className={classNames(
                  'flex text-center rounded-full cursor-pointer text-stone-800 dark:text-white hover:opacity-100 opacity-60',
                  {
                    'opacity-10 text-stone-100 dark:text-stone-700': connecting || building,
                  },
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
              executing={busy.page(slug, 'execute')}
              onClick={handleRun}
              title="Run all cells"
            />
          )}
          {ready && (
            <Restart
              ready={ready}
              resetting={busy.page(slug, 'reset')}
              onClick={handleReset}
              disabled={busy.page(slug, 'execute')}
              title="Reset notebook and restart kernel"
            />
          )}
          {ready && (
            <Clear
              ready={ready}
              disabled={busy.page(slug, 'execute') || busy.page(slug, 'reset')}
              onClick={handleClear}
              title="Clear all cells"
            />
          )}
          {showLaunch && ready && (
            <Launch
              ready={ready}
              disabled={false}
              onClick={handleLaunch}
              title="Launch notebook in Jupyter"
            />
          )}
        </div>
      </div>
    );
  return null;
}
