import { useSiteManifest } from '@myst-theme/providers';
import { useMemo } from 'react';
import { ThebeServerProvider } from 'thebe-react';

function ConfiguredThebeServerProvider({ children }: React.PropsWithChildren) {
  const config = useSiteManifest();
  // TODO configure [default] server connection from the SiteManifest?
  const options = useMemo(
    () => ({
      useBinder: false,
      kernelOptions: {
        name: 'Python 3',
      },
      savedSessionOptions: {
        enabled: true,
      },
    }),
    [],
  );

  return (
    <ThebeServerProvider connect={false} options={options}>
      {children}
    </ThebeServerProvider>
  );
}

export default ConfiguredThebeServerProvider;
