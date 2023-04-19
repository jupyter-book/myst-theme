import { useThebeCore, useThebeServer, useThebeSession } from 'thebe-react';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useHasNotebookProvider } from '@myst-theme/jupyter';

export function EnableCompute({
  canCompute,
  children,
}: React.PropsWithChildren<{ canCompute: boolean }>) {
  const { load, loading, core, error: loadError } = useThebeCore();
  const { connect, connecting, ready: serverReady, error: serverError } = useThebeServer();
  const { start, starting, ready: sessionReady, error: sessionError } = useThebeSession();
  const hasNotebookProvider = useHasNotebookProvider();
  const busy = loading || connecting || starting;

  const startSetup = () => {
    if (loading || connecting || starting || loadError || serverError || sessionError) return;
    if (!core) load();
    if (!serverReady) connect();
    if (!sessionReady) start();
  };

  if (!canCompute || !hasNotebookProvider) return null;
  let classes = 'text-center mr-1 cursor-pointer rounded-full';
  const idleClasses = 'text-blue-700 hover:opacity-100 opacity-60';
  const busyClasses = 'bg-yellow-700 text-yellow-700 opacity-100 font-semibold';
  const readyClasses = 'bg-green-700 text-green-700 opacity-100 font-semibold';
  const errorClasses = 'bg-red-700 text-red-700 opacity-100';

  if (loading || connecting || starting) classes += busyClasses;
  else if (serverReady && sessionReady) classes += readyClasses;
  else if (serverError || sessionError) classes += errorClasses;
  else classes += idleClasses;

  return (
    <div className="flex mx-1 items-bottom">
      <button
        className={classes}
        onClick={startSetup}
        disabled={busy || serverReady || sessionReady}
      >
        <PowerIcon className="h-6 w-6 mx-1 inline-block align-top" title="enable compute" />
      </button>
      {serverReady && sessionReady && <>{children}</>}
    </div>
  );
}
