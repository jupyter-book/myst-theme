import React, { useContext } from 'react';
import type { SiteManifest } from 'myst-config';

const SiteContext = React.createContext<SiteManifest | undefined>(undefined);

export function SiteProvider({
  config,
  children,
}: {
  config?: SiteManifest;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
}

export function useSiteManifest() {
  const config = useContext(SiteContext);
  return config;
}

export function useComputeOptions() {
  const config = useSiteManifest();
  // TODO there may be multiple projects?
  // useProjectManifest?
  const mainProject = config?.projects?.[0];
  const options = mainProject?.thebe;

  return {
    canCompute: options !== undefined,
    thebe: options,
    binderUrl: mainProject?.binder,
    binderLink: true,
  };
}
