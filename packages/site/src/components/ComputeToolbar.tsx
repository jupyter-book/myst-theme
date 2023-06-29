import {
  useExecuteScope,
  selectIsComputable,
  selectAreExecutionScopesReady,
  selectAreExecutionScopesBuilding,
  selectExecutionScopeStatus,
  useBusyScope,
} from '@myst-theme/jupyter';
import { useThebeServer } from 'thebe-react';
import PowerIcon from '@heroicons/react/24/outline/PowerIcon';

export function ComputeToolbar({ slug, autorun }: { slug: string; autorun?: boolean }) {
  const { ready, state, start, resetAll, clearAll, execute } = useExecuteScope();
  const busy = useBusyScope();
  const { connect } = useThebeServer();
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

  if (computable)
    return (
      <div className="sticky top-[60px] flex justify-end w-full z-20">
        <div className="flex p-1 space-x-1 shadow bg-white/80 rounded-b-md dark:bg-stone-900/80 backdrop-blur">
          {!started && (
            <button
              className="flex mr-1 text-center rounded-full cursor-pointer text-stone-800 hover:opacity-100 opacity-60"
              onClick={handleStart}
              disabled={building}
              aria-label="start compute environment"
            >
              <PowerIcon className="inline-block w-6 h-6 mx-1 align-top" title="enable compute" />
            </button>
          )}
          {idle && (
            <button
              className="px-2 text-xs text-green-500 border border-green-500 rounded"
              onClick={handleStart}
              aria-label="start compute environment"
            >
              start
            </button>
          )}
          {building && (
            <div className="px-2 text-xs text-white bg-yellow-500 rounded-md">{status}</div>
          )}
          {started && !autorun && (
            <button
              className="px-2 text-xs text-green-500 border border-green-500 rounded"
              onClick={handleRun}
            >
              run
            </button>
          )}
          {busy.any(slug) && <div className="px-2 text-xs">~BUSY~</div>}
          {started && (
            <button
              className="px-2 text-xs text-red-500 border border-red-500 rounded"
              onClick={handleReset}
              aria-label="reset the notebook and restart the compute session"
            >
              reset
            </button>
          )}
          {started && (
            <button
              className="px-2 text-xs text-red-500 border border-red-500 rounded"
              onClick={handleClear}
              aria-label="reset the notebook and restart the compute session"
            >
              clear
            </button>
          )}
        </div>
      </div>
    );
  return null;
}
