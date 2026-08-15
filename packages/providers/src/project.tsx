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
  return <ProjectContext.Provider value={project}>{children}</ProjectContext.Provider>;
}

export function useProjectManifest() {
  const config = useSiteManifest();
  const project = useContext(ProjectContext);
  return project ?? config?.projects?.[0];
}
