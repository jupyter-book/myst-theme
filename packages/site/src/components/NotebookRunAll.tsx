import { Spinner } from './Spinner';
import { useMDASTNotebook } from '../pages/NotebookProvider';

export function NotebookRunAll() {
  const { ready, attached, notebook, executing, executeAll, restart, clear } = useMDASTNotebook();

  return (
    <div className="inline-block">
      <div className="group flex relative space-x-1">
        <div className="inline-block relative text-sm">
          <button
            className="text-sm border border-1 cursor-pointer px-1 rounded border-green-700 text-green-700 opacity-80 hover:opacity-100"
            disabled={!ready || !attached || executing}
            onClick={() => executeAll()}
          >
            run
          </button>
          {executing && (
            <span className="absolute top-0 left-0 translate-x-1/4 z-10 w-[22px] h-[22px]">
              <Spinner size={22} />
            </span>
          )}
        </div>
        <button
          className="text-sm border border-1 cursor-pointer px-1 rounded border-green-700 text-green-700 opacity-80 hover:opacity-100"
          disabled={!ready || !attached || executing}
          onClick={() => restart()}
        >
          restart
        </button>
        <button
          className="text-sm border border-1 cursor-pointer px-1 rounded border-green-700 text-green-700 opacity-80 hover:opacity-100"
          disabled={!ready || !attached || executing}
          onClick={() => clear()}
        >
          clear
        </button>
        <div
          className="
          z-[11] group-hover:opacity-100 group-hover:delay-700 bg-white border transition-opacity 
          px-1 text-sm rounded-md absolute left-0 bottom-0 translate-x-[0px] translate-y-full 
          opacity-0 -m-2 w-[160px]"
        >
          <div>session: {attached ? 'attached' : 'no session'}</div>
          <div>notebook: {ready ? 'ready' : 'not ready'}</div>
          <div># cells: {notebook?.cells.length ?? 'unknown'}</div>
        </div>
      </div>
    </div>
  );
}
