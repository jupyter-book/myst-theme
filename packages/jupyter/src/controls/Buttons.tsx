import {
  PlayCircleIcon,
  ArrowPathIcon,
  MinusCircleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  BoltIcon,
  PowerIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { BoltIcon as BoltIconSolid } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { Spinner } from './Spinner.js';
import { useLaunchBinder } from '../hooks.js';

function BinderButton({
  icon,
  label,
  title,
  busy,
  error,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  onClick: (e: React.UIEvent) => void;
  busy?: boolean;
  error?: boolean;
  className?: string;
}) {
  let iconToShow = icon;
  if (error) {
    iconToShow = (
      <ExclamationCircleIcon
        className="inline pr-2 text-red-600 text-semibold"
        width="1.5rem"
        height="1.5rem"
        title={title}
      />
    );
  } else if (busy) {
    iconToShow = <Spinner size={16} />;
  }

  return (
    <button className={className} disabled={busy} onClick={onClick} title={title}>
      <div className="flex items-center h-full">
        {iconToShow}
        <span>{label}</span>
      </div>
    </button>
  );
}

export function LaunchBinder({ type, location }: { type: 'link' | 'button'; location?: string }) {
  const { connecting, ready, error, autoClickRef, handleStart, getUserServerUrl } =
    useLaunchBinder();

  let btnStyles =
    'flex gap-1 px-2 py-1 font-normal no-underline border rounded bg-slate-200 border-slate-600 hover:bg-slate-800 hover:text-white hover:border-transparent';
  let icon = (
    <ArrowTopRightOnSquareIcon
      width="1rem"
      height="1rem"
      className="self-center mr-2 transition-transform group-hover:-translate-x-1 shrink-0"
    />
  );
  if (type === 'link') {
    icon = <ArrowTopRightOnSquareIcon width="1.5rem" height="1.5rem" className="inline h-5 pr-2" />;
    btnStyles =
      'inline-flex items-center mr-2 font-medium no-underline text-gray-900 lg:mr-0 lg:flex';
  }

  if (ready) {
    // we expect ?token= to be in the url
    const userServerUrl = getUserServerUrl(location);

    return (
      <a
        ref={autoClickRef}
        className={btnStyles}
        href={userServerUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Binder server is available, click to open in a new tab"
      >
        <div className="flex items-center h-full">
          {icon}
          <span>Open in Jupyter</span>
        </div>
      </a>
    );
  }

  let label = 'Launch Jupyter';
  let title = 'Click to start a new compute session';
  if (error) {
    label = 'Launch Error';
    title = error;
  } else if (connecting) {
    label = 'Launching...';
    title = 'Starting a jupyter server, please wait';
  }

  return (
    <BinderButton
      className={btnStyles}
      icon={icon}
      label={label}
      title={title}
      busy={connecting}
      error={!!error}
      onClick={handleStart}
    />
  );
}

export function SpinnerStatusButton({
  ready,
  busy,
  modified,
  onClick,
}: {
  ready: boolean;
  modified: boolean;
  busy: boolean;
  onClick?: () => void;
}) {
  let title = 'Enable compute to make this figure interactive';
  if (ready) {
    title = modified ? 'The figure has been modified' : 'The figure is in its original state';
  }

  let icon = <PowerIcon width="1.5rem" height="1.5rem" />;
  if (ready) {
    if (modified) {
      icon = <BoltIcon width="1.5rem" height="1.5rem" className="text-green-600" />;
    } else {
      icon = <BoltIconSolid width="1.5rem" height="1.5rem" className="text-green-600" />;
    }
  }

  return (
    <div className="relative flex text-sm">
      <button
        className={classNames(
          'cursor-pointer text-gray-700 dark:text-white active:text-green-700 hover:opacity-100',
          {
            'opacity-10': busy,
            'opacity-70': !busy,
          },
        )}
        disabled={ready}
        title={title}
        aria-label={`status`}
        onClick={onClick ?? (() => ({}))}
      >
        {icon}
      </button>
      {busy && (
        <span className="absolute top-0 left-0 z-10 opacity-100">
          <Spinner size={24} />
        </span>
      )}
    </div>
  );
}

function SpinnerButton({
  ready,
  icon,
  busy,
  disabled,
  title,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  ready: boolean;
  busy: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative flex text-sm">
      <button
        className={classNames(' text-gray-700 dark:text-white active:text-green-700 ', {
          'opacity-10 hover:opacity-10': busy,
          'opacity-70': !busy && !disabled,
          'cursor-pointer hover:opacity-100': !disabled,
          'cursor-not-allowed opacity-10 hover:opacity-10': disabled,
        })}
        disabled={disabled || !ready || busy}
        onClick={() => onClick()}
        title={title ?? 'run all cells'}
        aria-label={title ?? 'run all cells'}
      >
        {icon}
      </button>
      {busy && (
        <span className="absolute top-0 left-0 z-10 opacity-100">
          <Spinner size={24} />
        </span>
      )}
    </div>
  );
}

export function Run({
  ready,
  executing,
  disabled,
  title,
  onClick,
}: {
  ready: boolean;
  executing: boolean;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <SpinnerButton
      ready={ready}
      busy={executing}
      disabled={disabled}
      title={title ?? 'run all cells'}
      onClick={onClick}
      icon={<PlayCircleIcon width="1.5rem" height="1.5rem" className="inline-block align-top" />}
    />
  );
}

export function Power({
  ready,
  executing,
  disabled,
  title,
  onClick,
}: {
  ready: boolean;
  executing: boolean;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <SpinnerButton
      ready={ready}
      busy={executing}
      disabled={disabled}
      title={title ?? 'enable compute'}
      onClick={onClick}
      icon={
        <PowerIcon
          width="1.5rem"
          height="1.5rem"
          className="inline-block align-top dark:text-white"
        />
      }
    />
  );
}

export function ReRun({
  ready,
  executing,
  disabled,
  title,
  onClick,
}: {
  ready: boolean;
  executing: boolean;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <SpinnerButton
      ready={ready}
      busy={executing}
      disabled={disabled}
      title={title ?? 'run all cells'}
      onClick={onClick}
      icon={<ArrowPathIcon width="1.5rem" height="1.5rem" className="inline-block align-top" />}
    />
  );
}

export function Restart({
  ready,
  resetting,
  disabled,
  title,
  onClick,
}: {
  ready: boolean;
  resetting: boolean;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <SpinnerButton
      ready={ready}
      busy={resetting}
      disabled={disabled}
      title={title ?? 'reset notebook'}
      onClick={onClick}
      icon={
        <ArrowUturnLeftIcon width="1.5rem" height="1.5rem" className="inline-block align-top" />
      }
    />
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
      className={classNames('flex text-gray-700 dark:text-white', {
        'cursor-not-allowed opacity-10': disabled || !ready,
        'active:text-green-700 opacity-70 hover:opacity-100 cursor-pointer': !disabled,
      })}
      disabled={disabled || !ready}
      onClick={() => onClick()}
      title={title ?? 'clear'}
      aria-label={title ?? 'clear'}
    >
      <MinusCircleIcon width="1.5rem" height="1.5rem" className="inline-block align-top" />
    </button>
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
      className="flex items-center text-gray-700 cursor-pointer dark:text-white active:text-green-700 opacity-70 hover:opacity-100"
      disabled={disabled || !ready}
      onClick={() => onClick()}
      title={title ?? 'launch in jupyter'}
      aria-label={title ?? 'launch in jupyter'}
    >
      <ArrowTopRightOnSquareIcon
        width="1.5rem"
        height="1.5rem"
        className="inline-block align-top"
      />
    </button>
  );
}
