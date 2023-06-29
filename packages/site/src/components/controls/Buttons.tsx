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
  title,
  onClick,
}: {
  ready: boolean;
  executing: boolean;
  disabled?: boolean;
  title?: string;
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
        title={title ?? 'run all cells'}
        aria-label={title ?? 'run all cells'}
      >
        <PlayCircleIcon className="inline-block w-6 h-6 align-top" />
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
  disabled,
  title,
  onClick,
}: {
  ready: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={classNames('flex text-gray-700 opacity-60 ', {
        'cursor-not-allowed': disabled || !ready,
        'active:text-green-700 hover:opacity-100 cursor-pointer': !disabled,
      })}
      disabled={disabled || !ready}
      onClick={() => onClick()}
      title={title ?? 'clear'}
      aria-label={title ?? 'clear'}
    >
      <MinusCircleIcon className="inline-block w-6 h-6 align-top" />
    </button>
  );
}

export function Restart({
  ready,
  restarting,
  disabled,
  title,
  onClick,
}: {
  ready: boolean;
  restarting: boolean;
  disabled?: boolean;
  title?: string;
  onClick: (() => void) | (() => Promise<void>);
}) {
  return (
    <div className="relative flex text-sm">
      <button
        className="flex items-center text-gray-700 cursor-pointer active:text-green-700 opacity-60 hover:opacity-100"
        disabled={disabled || !ready || restarting}
        onClick={() => onClick()}
        title={title ?? 'restart kernel'}
        aria-label={title ?? 'restart kernel'}
      >
        <ArrowPathIcon className="w-6 h-6" />
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
  title,
  onClick,
}: {
  ready: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex items-center text-gray-700 cursor-pointer active:text-green-700 opacity-60 hover:opacity-100"
      disabled={disabled || !ready}
      onClick={() => onClick()}
      title={title ?? 'launch in jupyter'}
      aria-label={title ?? 'launch in jupyter'}
    >
      <ArrowTopRightOnSquareIcon className="inline-block w-6 h-6 align-top" />
    </button>
  );
}
