import { useThebeCore, useThebeServer, useThebeSession } from 'thebe-react';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useHasNotebookProvider } from '@myst-theme/jupyter';
import { useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';

export function EnableCompute({
  canCompute,
  children,
}: React.PropsWithChildren<{ canCompute: boolean }>) {
  const { load, loading, core } = useThebeCore();
  const { connect, connecting, ready: serverReady, error: serverError } = useThebeServer();
  const { start, starting, shutdown, ready: sessionReady, error: sessionError } = useThebeSession();
  const hasNotebookProvider = useHasNotebookProvider();
  const navigation = useNavigation();
  const [enabling, setEnabling] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const busy = enabling || loading || connecting || starting;

  useEffect(() => {
    if (!enabling) return;
    if (!core) load();
    if (!serverReady) connect();
    if (!sessionReady) start();
    if (sessionReady) {
      setEnabled(true);
      setEnabling(false);
    }
  }, [enabling, core, serverReady, sessionReady]);

  if (!canCompute || !hasNotebookProvider) return null;
  let classes = 'flex text-center mr-1 cursor-pointer rounded-full';
  const idleClasses = 'text-blue-700 hover:opacity-100 opacity-60';
  const busyClasses = 'bg-yellow-700 text-yellow-700 opacity-100 font-semibold';
  const readyClasses = 'bg-green-700 text-green-700 opacity-100 font-semibold';
  const errorClasses = 'bg-red-700 text-red-700 opacity-100';

  if (busy) classes += busyClasses;
  else if (serverReady && sessionReady) classes += readyClasses;
  else if (serverError || sessionError) classes += errorClasses;
  else classes += idleClasses;

  useEffect(() => {
    if (navigation.state === 'loading') {
      shutdown();
    }
  }, [shutdown, navigation]);

  return (
    <div className="flex flex-col">
      <div className="flex mx-1 items-center">
        <button
          className={classes}
          onClick={() => setEnabling(true)}
          disabled={enabling || enabled}
        >
          <PowerIcon className="h-6 w-6 mx-1 inline-block align-top" title="enable compute" />
        </button>
        {enabled && <>{children}</>}
      </div>
      <div className="flex flex-col my-1">
        <div>serverReady: {serverReady ? 'ready' : 'not-ready'}</div>
        <div>sessionReady: {sessionReady ? 'ready' : 'not-ready'}</div>
      </div>
    </div>
  );
}
