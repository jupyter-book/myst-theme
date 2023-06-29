import { Spinner } from './Spinner';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import MinusCircleIcon from '@heroicons/react/24/outline/MinusCircleIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import classNames from 'classnames';
import type { NotebookExecuteOptions } from 'thebe-react';
import { useThebeServer } from 'thebe-react';
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
    <div className="relative flex text-sm">
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
        <PlayCircleIcon className="inline-block w-6 h-6 align-top" title="run all cells" />
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
      className="flex text-gray-700 cursor-pointer active:text-green-700 opacity-60 hover:opacity-100"
      disabled={disabled || !ready || executing}
      onClick={() => clear()}
    >
      <MinusCircleIcon className="inline-block w-6 h-6 align-top" title="clear all outputs" />
    </button>
  );
}

export function RunCell({ id }: { id: string }) {
  const exec = useNotebookCellExecution(id);
  if (!exec?.ready) return null;
  const { ready, executing, notebookIsExecuting, execute } = exec;
  return (
    <Run ready={ready} executing={executing} disabled={notebookIsExecuting} execute={execute} />
  );
}

export function ClearCell({ id }: { id: string }) {
  const exec = useNotebookCellExecution(id);
  if (!exec?.ready) return null;
  const { ready, executing, notebookIsExecuting, clear } = exec;
  return <Clear ready={ready} executing={executing} disabled={notebookIsExecuting} clear={clear} />;
}

export function NotebookRunAll() {
  const { ready: serverReady, server } = useThebeServer();
  const exec = useMDASTNotebook();

  if (!exec?.ready) return null;
  const { ready, executing, executeAll, restart, clear } = exec;

  const clickLaunchInJupyter = () => {
    if (!serverReady || !server?.settings) return;
    window.open(server.settings.baseUrl, '_blank');
  };

  return (
    <div className="flex">
      <div className="relative flex space-x-1 group">
        <Run
          ready={ready}
          executing={executing}
          execute={(options) => {
            clear();
            return executeAll(options);
          }}
        />
        <button
          className="flex items-center text-gray-700 cursor-pointer active:text-green-700 opacity-60 hover:opacity-100"
          disabled={!ready || executing}
          onClick={() => restart()}
        >
          <ArrowPathIcon className="w-6 h-6" title="restart kernel" />
        </button>
        <Clear ready={ready} executing={executing} clear={clear} />
        <button
          className="flex items-center text-gray-700 cursor-pointer active:text-green-700 opacity-60 hover:opacity-100"
          disabled={!ready}
          onClick={clickLaunchInJupyter}
        >
          <ArrowTopRightOnSquareIcon
            className="inline-block w-6 h-6 align-top"
            title="launch in juptyer"
          />
        </button>
      </div>
    </div>
  );
}
