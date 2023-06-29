import { Spinner } from '../Spinner';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import MinusCircleIcon from '@heroicons/react/24/outline/MinusCircleIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import classNames from 'classnames';

export function Run({
  ready,
  executing,
  disabled,
  onClick,
}: {
  ready: boolean;
  executing: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative flex text-sm">
      <button
        className={classNames(
          'cursor-pointer text-gray-700 active:text-green-700 bg-white hover:opacity-100',
          {
            'opacity-10 hover:opacity-10': executing,
            'opacity-70': !executing,
          },
        )}
        disabled={disabled || !ready || executing}
        onClick={() => onClick()}
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
  onClick,
}: {
  ready: boolean;
  executing: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={classNames('flex text-gray-700 opacity-60 ', {
        'cursor-not-allowed': disabled || !ready || executing,
        'active:text-green-700 hover:opacity-100 cursor-pointer': !executing && !disabled,
      })}
      disabled={disabled || !ready || executing}
      onClick={() => onClick()}
    >
      <MinusCircleIcon className="inline-block w-6 h-6 align-top" title="clear all outputs" />
    </button>
  );
}

export function Restart({
  ready,
  restarting,
  disabled,
  onClick,
}: {
  ready: boolean;
  restarting: boolean;
  disabled?: boolean;
  onClick: (() => void) | (() => Promise<void>);
}) {
  return (
    <div className="relative flex text-sm">
      <button
        className="flex items-center text-gray-700 cursor-pointer active:text-green-700 opacity-60 hover:opacity-100"
        disabled={disabled || !ready || restarting}
        onClick={() => onClick()}
      >
        <ArrowPathIcon className="w-6 h-6" title="restart kernel" />
      </button>
      {restarting && (
        <span className="absolute top-0 left-0 z-10 w-[22px] h-[22px] opacity-100">
          <Spinner size={24} />
        </span>
      )}
    </div>
  );
}

export function Launch({
  ready,
  disabled,
  onClick,
}: {
  ready: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex items-center text-gray-700 cursor-pointer active:text-green-700 opacity-60 hover:opacity-100"
      disabled={disabled || !ready}
      onClick={() => onClick()}
    >
      <ArrowTopRightOnSquareIcon
        className="inline-block w-6 h-6 align-top"
        title="launch in juptyer"
      />
    </button>
  );
}
