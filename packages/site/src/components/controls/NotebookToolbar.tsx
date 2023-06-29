import {
  useExecuteScope,
  selectIsComputable,
  selectAreExecutionScopesReady,
  selectAreExecutionScopesBuilding,
  selectExecutionScopeStatus,
  useBusyScope,
  useMDASTNotebook,
} from '@myst-theme/jupyter';
import { useThebeServer } from 'thebe-react';
import PowerIcon from '@heroicons/react/24/outline/PowerIcon';
import { Spinner } from '../Spinner';
import { Clear, Launch, Restart, Run } from './Buttons';

export function NotebookRunAll() {
  const { ready: serverReady, server } = useThebeServer();
  const exec = useMDASTNotebook();

  if (!exec?.ready) return null;
  const { ready, executing, executeAll, restart, clear } = exec;

  const clickLaunchInJupyter = () => {
    if (!serverReady || !server?.settings) return;
    window.open(server.settings.baseUrl, '_blank');
  };

  // TODO restrarting flag
  return (
    <div className="flex">
      <div className="relative flex space-x-1 group">
        <Run
          ready={ready}
          executing={executing}
          onClick={() => {
            clear();
            return executeAll();
          }}
        />
        <Restart ready={ready} restarting={false} onClick={restart} />
        <Clear ready={ready} executing={executing} onClick={clear} />
        <Launch ready={ready} onClick={clickLaunchInJupyter} />
      </div>
    </div>
  );
}

export function NotebookToolbar({ autorun }: { autorun?: boolean }) {
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

  const started = selectAreExecutionScopesReady(state, slug) && ready;
  const building = selectAreExecutionScopesBuilding(state, slug);
  const status = selectExecutionScopeStatus(state, slug);
  const idle = !started && !building;

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
          {!started && (
            <div className="rounded">
              <button
                className="flex text-center rounded-full cursor-pointer text-stone-800 hover:opacity-100 opacity-60"
                onClick={handleStart}
                disabled={building}
                aria-label="start compute environment"
              >
                <PowerIcon className="inline-block w-6 h-6 align-top" title="enable compute" />
              </button>
              {(connecting || building) && !error && (
                <span
                  className="absolute top-0 left-1 z-10 w-[22px] h-[22px] opacity-100"
                  title={title}
                >
                  <Spinner size={24} />
                </span>
              )}
            </div>
          )}
          {started && <Run ready={ready} executing={busy.any(slug)} onClick={handleRun} />}
          {started && <Restart ready={ready} restarting={false} onClick={handleReset} />}
          {started && <Clear ready={ready} executing={busy.any(slug)} onClick={handleClear} />}
        </div>
      </div>
    );
  return null;
}
