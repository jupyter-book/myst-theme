import { useNotebook, useThebeCore, useThebeServer, useThebeSession } from 'thebe-react';
import PowerIcon from '@heroicons/react/24/outline/PowerIcon';
import { useHasNotebookProvider, useComputeOptions, useNotebookLoader } from '@myst-theme/jupyter';
import { useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { LiteLogo } from './liteLogo';

export function EnableCompute({
  canCompute,
  children,
}: React.PropsWithChildren<{ canCompute: boolean }>) {
  const { load, loading, core } = useThebeCore();
  const { connect, connecting, ready: serverReady, error: serverError } = useThebeServer();
  const { thebe } = useComputeOptions();
  const {
    start,
    starting,
    shutdown,
    session,
    ready: sessionReady,
    error: sessionError,
  } = useThebeSession();
  const hasNotebookProvider = useHasNotebookProvider();
  const loader = useNotebookLoader();
  const navigation = useNavigation();
  const [enabling, setEnabling] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const busy = enabling || loading || connecting || starting;

  useEffect(() => {
    if (!enabling) return;
    if (!core) load();
    else if (!serverReady) connect();
    else if (!sessionReady) start();
    else if (sessionReady && loader?.ready) {
      setEnabled(true);
      setEnabling(false);
    }
  }, [enabling, core, serverReady, sessionReady, loader]);

  if (!canCompute || !hasNotebookProvider) return null;
  let classes = 'flex text-center mr-1 cursor-pointer rounded-full';
  const idleClasses = 'text-blue-700 hover:opacity-100 opacity-90 animate-pulse';
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
      loader?.resetNotebook();
    }
  }, [shutdown, navigation, loader]);

  return (
    <div className="flex mx-1 items-center">
      {thebe?.useJupyterLite && (
        <span className={enabled || enabling ? 'animate-pulse' : ''}>
          <LiteLogo />
        </span>
      )}
      <button className={classes} onClick={() => setEnabling(true)} disabled={enabling || enabled}>
        <PowerIcon className="h-6 w-6 mx-1 inline-block align-top" title="enable compute" />
      </button>
      {enabled && <>{children}</>}
    </div>
  );
}
