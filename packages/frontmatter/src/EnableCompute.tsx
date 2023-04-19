import { useThebeCore, useThebeServer, useThebeSession } from 'thebe-react';

export function EnableCompute({ canCompute }: { canCompute: boolean }) {
  const { load, loading, core, error: loadError } = useThebeCore();
  const { connect, connecting, ready: serverReady, error: serverError } = useThebeServer();
  const { start, starting, ready: sessionReady, error: sessionError } = useThebeSession();
  const busy = loading || connecting || starting;

  const startSetup = () => {
    if (loading || connecting || starting || loadError || serverError || sessionError) return;
    if (!core) load();
    if (!serverReady) connect();
    if (!sessionReady) start();
  };

  if (!canCompute) return null;
  let classes =
    'h-[1.5em] w-[1.5em] rounded-full border text-sm text-center align-center mr-1 cursor-pointer opacity-90';
  const idleClasses = ' border-blue-700 bg-blue-200 text-blue-700 hover:opacity-100';
  const busyClasses = ' border-yellow-700 bg-yellow-200 text-yellow-700';
  const readyClasses = ' border-green-700 bg-green-200 text-green-700';
  const errorClasses = ' border-red-700 bg-red-200 text-red-700';

  if (loading || connecting || starting) classes += busyClasses;
  else if (serverReady && sessionReady) classes += readyClasses;
  else if (serverError || sessionError) classes += errorClasses;
  else classes += idleClasses;

  return (
    <div className="inline-block mx-1">
      <button
        className={classes}
        onClick={startSetup}
        disabled={busy || serverReady || sessionReady}
      ></button>
    </div>
  );
}
