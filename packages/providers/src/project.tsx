import React, { useContext } from 'react';
import type { SiteManifest } from 'myst-config';
import { useSiteManifest } from './site.js';

export type ManifestProject = Required<SiteManifest>['projects'][0];

const ProjectContext = React.createContext<ManifestProject | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const config = useSiteManifest();
  return (
    <ProjectContext.Provider value={config?.projects?.[0]}>{children}</ProjectContext.Provider>
  );
}

export function useProjectManifest() {
  const config = useContext(ProjectContext);
  return config;
}
