import { useSiteManifest } from '@myst-theme/providers';
import { ThebeServerProvider } from 'thebe-react';

function ConfiguredThebeServerProvider({ children }: React.PropsWithChildren) {
  const config = useSiteManifest();
  const mainProject = config?.projects?.[0];
  const options = mainProject?.thebe ?? {};
  return (
    <ThebeServerProvider connect={false} options={options}>
      {children}
    </ThebeServerProvider>
  );
}

export default ConfiguredThebeServerProvider;
