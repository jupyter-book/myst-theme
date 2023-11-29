import type { SourceFileKind } from 'myst-spec-ext';
import React, { useContext } from 'react';
import { type ExtendedCoreOptions, thebeFrontmatterToOptions } from './utils.js';
import type { GenericParent } from 'myst-common';
import { useProjectManifest } from '@myst-theme/providers';

type ComputeOptionsContextType = {
  enabled: boolean;
  thebe?: ExtendedCoreOptions;
  features: {
    notebookCompute: boolean;
    figureCompute: boolean;
    launchBinder: boolean;
  };
};

const ComputeOptionsContext = React.createContext<ComputeOptionsContextType | undefined>(undefined);

export function ComputeOptionsProvider({
  features,
  thebeOptionOverrideFn,
  children,
}: React.PropsWithChildren<{
  features: {
    notebookCompute: boolean;
    figureCompute: boolean;
    launchBinder: boolean;
  };
  thebeOptionOverrideFn?: (opts?: ExtendedCoreOptions) => ExtendedCoreOptions | undefined;
}>) {
  const project = useProjectManifest();

  const options = React.useMemo(() => {
    if (!project) return;
    const thebeFrontmatter = project?.thebe;
    const githubBadgeUrl = project?.github;
    const binderBadgeUrl = project?.binder;
    const optionsFromFrontmatter = thebeFrontmatterToOptions(thebeFrontmatter);

    const optionsWithOverrides = thebeOptionOverrideFn
      ? thebeOptionOverrideFn(optionsFromFrontmatter)
      : optionsFromFrontmatter;

    return {
      enabled: !!optionsWithOverrides,
      thebe: optionsWithOverrides,
      githubBadgeUrl,
      binderBadgeUrl,
      features,
    };
  }, [project, thebeOptionOverrideFn]);

  return (
    <ComputeOptionsContext.Provider value={options}>{children}</ComputeOptionsContext.Provider>
  );
}

export function useCanCompute() {
  const context = useContext(ComputeOptionsContext);
  return context?.enabled;
}

export function useComputeOptions() {
  return useContext(ComputeOptionsContext);
}

export type PartialPage = {
  kind: SourceFileKind;
  file: string;
  location: string;
  sha256: string;
  slug: string;
  mdast: GenericParent;
};
