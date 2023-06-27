import { useThebeLoader, useThebeServer, useThebeSession } from 'thebe-react';
import PowerIcon from '@heroicons/react/24/outline/PowerIcon';
import { useHasNotebookProvider } from '@myst-theme/jupyter';
import { useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Spinner } from './Spinner';

export function EnableCompute({
  canCompute,
  children,
}: React.PropsWithChildren<{ canCompute: boolean }>) {
  const { load, loading, core } = useThebeLoader();
  const { connect, connecting, ready: serverReady, error: serverError } = useThebeServer();
  const { start, starting, shutdown, ready: sessionReady, error: sessionError } = useThebeSession();
  const hasNotebookProvider = useHasNotebookProvider();
  const navigation = useNavigation();
  const [enabling, setEnabling] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const busy = enabling || loading || connecting || starting;

  useEffect(() => {
    if (!enabling) return;
    if (!core) return load();
    if (!serverReady) return connect();
    if (!sessionReady) start();
    if (sessionReady) {
      setEnabled(true);
      setEnabling(false);
    }
  }, [enabling, core, serverReady, sessionReady]);

  if (!canCompute || !hasNotebookProvider) return null;
  let classes =
    'flex text-center mr-1 cursor-pointer rounded-full disabled:opacity-10 text-gray-700';

  let title = 'Connect to a compute server';
  const error = !!sessionError || !!serverError;
  const errorClasses = ' text-red-600 opacity-100';
  if (serverError || sessionError) {
    classes += errorClasses;
    title = 'Error connecting to compute server';
  }
  if (busy) {
    title = 'Connecting...';
  }

  useEffect(() => {
    if (navigation.state === 'loading') {
      shutdown();
    }
  }, [shutdown, navigation]);

  return (
    <div className="relative flex items-center mx-1 mb-2">
      {!enabled && (
        <button
          className={classes}
          onClick={() => setEnabling(true)}
          disabled={connecting || starting}
          title={title}
        >
          <PowerIcon className="inline-block w-6 h-6 mx-1 align-top" />
        </button>
      )}
      {(connecting || starting) && !error && (
        <span className="absolute top-0 left-1 z-10 w-[22px] h-[22px] opacity-100" title={title}>
          <Spinner size={24} />
        </span>
      )}
      {enabled && <>{children}</>}
    </div>
  );
}
