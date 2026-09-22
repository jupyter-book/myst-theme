import React, { useEffect, useState } from 'react';
import version from './version.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ThebeCore = typeof import('thebe-core');

// Don't know how to get rid of the undefined here in the case of an async provider
const ThebeLoaderContext = React.createContext<
  { core?: ThebeCore; error?: string; loading: boolean; load: () => void } | undefined
>(undefined);

export function ThebeLoaderProvider({
  start,
  loadThebeLite,
  children,
}: React.PropsWithChildren<{ start?: boolean; loadThebeLite?: boolean }>) {
  const [startLoad, setStartLoad] = useState(start);
  const [loading, setLoading] = useState(false);
  const [core, setCore] = useState<ThebeCore | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!startLoad || core) return;
    async function startLoading() {
      // if already loaded do nothing
      setLoading(true);
      console.debug(`thebe-react (v${version}) importing thebe-core...`);

      if (loadThebeLite) {
        let thebeLite;

        try {
          thebeLite = await import('thebe-lite');
        } catch (err) {
          const { message } = err as any;
          console.debug(`thebe-lite load failed ${message}`);
          setError(message);
          setLoading(false);
          return;
        }
        thebeLite.setupThebeLite();
      }
      let thebeCore;
      try {
        thebeCore = await import('thebe-core');
      } catch (err) {
        const { message } = err as any;
        console.debug(`thebe-core load failed ${message}`);
        setError(message);
        setLoading(false);
        return;
      }

      console.debug(`thebe-core (v${thebeCore.version}) loaded`);
      setCore(thebeCore);
      setLoading(false);
    }
    startLoading();
  }, [startLoad]);

  return (
    <ThebeLoaderContext.Provider value={{ core, error, loading, load: () => setStartLoad(true) }}>
      <>{children}</>
    </ThebeLoaderContext.Provider>
  );
}

export function useThebeLoader() {
  const context = React.useContext(ThebeLoaderContext);
  return context ?? { loading: false, load: () => ({}) };
}
