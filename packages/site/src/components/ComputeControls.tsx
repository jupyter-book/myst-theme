import { Spinner } from './Spinner';
import { PlayCircleIcon, ArrowPathIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { NotebookExecuteOptions } from 'thebe-react';
import type { IThebeCellExecuteReturn } from 'thebe-core';
import { useMDASTNotebook, useNotebookCellExecution } from '@myst-theme/jupyter';

export function Run({
  ready,
  executing,
  disabled,
  execute,
}: {
  ready: boolean;
  executing: boolean;
  disabled?: boolean;
  execute: (
    options?: NotebookExecuteOptions | undefined,
  ) => Promise<(IThebeCellExecuteReturn | null)[]>;
}) {
  return (
    <div className="inline-block relative text-sm">
      <button
        className={classNames(
          'cursor-pointer text-gray-700 active:text-green-700 hover:opacity-100',
          {
            'opacity-10 hover:opacity-10': executing,
            'opacity-60': !executing,
          },
        )}
        disabled={disabled || !ready || executing}
        onClick={() => execute()}
      >
        <PlayCircleIcon className="h-6 w-6 inline-block align-top" title="run all cells" />
      </button>
      {executing && (
        <span className="absolute top-0 left-0 z-10 w-[22px] h-[22px] opacity-100">
          <Spinner size={24} />
        </span>
      )}
    </div>
  );
}

export function Clear({
  ready,
  executing,
  disabled,
  clear,
}: {
  ready: boolean;
  executing: boolean;
  disabled?: boolean;
  clear: () => void;
}) {
  return (
    <button
      className="cursor-pointer text-gray-700 active:text-green-700 opacity-60 hover:opacity-100"
      disabled={!ready || executing}
      onClick={() => clear()}
    >
      <MinusCircleIcon className="h-6 w-6 inline-block align-top" title="clear all outputs" />
    </button>
  );
}

export function RunCell({ id }: { id: string }) {
  const { ready, executing, notebookIsExecuting, execute } = useNotebookCellExecution(id);
  if (!ready) return null;
  return (
    <Run ready={ready} executing={executing} disabled={notebookIsExecuting} execute={execute} />
  );
}

export function ClearCell({ id }: { id: string }) {
  const { ready, executing, notebookIsExecuting, clear } = useNotebookCellExecution(id);
  if (!ready) return null;
  return <Clear ready={ready} executing={executing} disabled={notebookIsExecuting} clear={clear} />;
}

export function NotebookRunAll() {
  const { ready, executing, executeAll, restart, clear } = useMDASTNotebook();

  return (
    <div className="inline-block">
      <div className="group flex relative space-x-1">
        <Run ready={ready} executing={executing} execute={executeAll} />
        <button
          className="cursor-pointer text-gray-700 active:text-green-700 opacity-60 hover:opacity-100"
          disabled={!ready || executing}
          onClick={() => restart()}
        >
          <ArrowPathIcon className="h-6 w-6 inline-block align-top" title="restart kernel" />
        </button>
        <Clear ready={ready} executing={executing} clear={clear} />
      </div>
    </div>
  );
}
