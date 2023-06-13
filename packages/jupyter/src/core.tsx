import React, { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type ThebeCore = typeof import('thebe-core');

// Don't know how to get rid of the undefined here in the case of an async provider
const ThebeCoreContext = React.createContext<
  { core?: ThebeCore; error?: string; loading: boolean; load: () => void } | undefined
>(undefined);

export function ThebeCoreBundleProvider({
  start,
  loadThebeLite,
  children,
}: React.PropsWithChildren<{ start?: boolean; loadThebeLite: boolean }>) {
  const [startLoad, setStartLoad] = useState(start);
  const [loading, setLoading] = useState(false);
  const [core, setCore] = useState<ThebeCore | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    // if already loaded do nothing
    if (!startLoad || core) return;
    setLoading(true);
    console.debug('importing thebe-core...');

    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      try {
        if (!window.thebeCore) {
          const script = document.createElement('script');
          script.setAttribute('src', '/thebe-core.min.js');
          script.setAttribute('async', 'true');
          script.setAttribute('type', 'text/javascript');
          document.head.appendChild(script);

          const styles = document.createElement('link');
          styles.setAttribute('rel', 'stylesheet');
          styles.setAttribute('href', '/thebe-core.css');
          document.head.appendChild(styles);
        }

        if (loadThebeLite) {
          const liteScript = document.createElement('script');
          liteScript.setAttribute('src', '/thebe-lite.min.js');
          liteScript.setAttribute('async', 'true');
          liteScript.setAttribute('type', 'text/javascript');
          document.head.appendChild(liteScript);
        }

        let attempts = 0;
        const timer = setInterval(() => {
          if (window.thebeCore && (window.thebeLite || !loadThebeLite)) {
            setLoading(false);
            setCore((window as any).thebeCore?.module);
            clearInterval(timer);
          }
          if (attempts > 10) {
            setError('thebe-core load failed');
            setLoading(false);
            clearInterval(timer);
          }
          attempts += 1;
        }, 300);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    }
  }, [startLoad]);

  return (
    <ThebeCoreContext.Provider value={{ core, error, loading, load: () => setStartLoad(true) }}>
      <>{children}</>
    </ThebeCoreContext.Provider>
  );
}

export function useThebeCoreBundle() {
  const context = React.useContext(ThebeCoreContext);
  if (context === undefined) {
    throw new Error('useThebeCoreBundle must be used inside a ThebeCoreBundleProvider');
  }
  return context;
}
