import React, { useContext } from 'react';
import { useSiteManifest } from './site.js';
import type { SiteManifest } from 'myst-config';

type ManifestProject = Required<SiteManifest>['projects'][0];

const ProjectContext = React.createContext<ManifestProject | undefined>(undefined);

export function ProjectProvider({
  project,
  children,
}: {
  project?: ManifestProject;
  children: React.ReactNode;
}) {
  const config = useSiteManifest();
  return (
    <ProjectContext.Provider value={project ?? config?.projects?.[0]}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectManifest() {
  const config = useContext(ProjectContext);
  return config;
}
