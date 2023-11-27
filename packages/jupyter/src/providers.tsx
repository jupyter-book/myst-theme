import type { SourceFileKind } from 'myst-spec-ext';
import React, { useContext } from 'react';
import { ThebeServerProvider } from 'thebe-react';
import { type ExtendedCoreOptions, thebeFrontmatterToOptions } from './utils.js';
import type { GenericParent } from 'myst-common';
import type { RepoProviderSpec } from 'thebe-core';
import type { ManifestProject } from '@myst-theme/providers';
import { useProjectManifest } from '@myst-theme/providers';

function makeThebeOptions(
  project: ManifestProject,
  optionsOverrideFn = (opts?: ExtendedCoreOptions) => opts,
): {
  options?: ExtendedCoreOptions;
  githubBadgeUrl?: string;
  binderBadgeUrl?: string;
} {
  if (!project) return {};
  const thebeFrontmatter = project?.thebe;
  const githubBadgeUrl = project?.github;
  const binderBadgeUrl = project?.binder;
  const optionsFromFrontmatter = thebeFrontmatterToOptions(
    thebeFrontmatter,
    githubBadgeUrl,
    binderBadgeUrl,
  );

  const options = optionsOverrideFn(optionsFromFrontmatter);

  return {
    options,
    githubBadgeUrl,
    binderBadgeUrl,
  };
}

type ThebeOptionsContextType = {
  options?: ExtendedCoreOptions;
  githubBadgeUrl?: string;
  binderBadgeUrl?: string;
};

const ThebeOptionsContext = React.createContext<ThebeOptionsContextType | undefined>(undefined);

export function ConfiguredThebeServerProvider({
  optionOverrideFn,
  customRepoProviders,
  children,
}: React.PropsWithChildren<{
  optionOverrideFn?: (opts?: ExtendedCoreOptions) => ExtendedCoreOptions | undefined;
  customRepoProviders?: RepoProviderSpec[];
}>) {
  const project = useProjectManifest();
  const thebe = React.useMemo(
    () => (project ? makeThebeOptions(project, optionOverrideFn) : undefined),
    [project, optionOverrideFn],
  );

  return (
    <ThebeOptionsContext.Provider value={thebe}>
      <ThebeServerProvider
        connect={false}
        options={thebe?.options}
        useBinder={thebe?.options?.useBinder ?? false}
        useJupyterLite={thebe?.options?.useJupyterLite ?? false}
        customRepoProviders={customRepoProviders}
      >
        <>{children}</>
      </ThebeServerProvider>
    </ThebeOptionsContext.Provider>
  );
}

export function useCanCompute() {
  const thebe = useContext(ThebeOptionsContext);
  return !!thebe?.options;
}

export function useThebeOptions() {
  return useContext(ThebeOptionsContext);
}

export type PartialPage = {
  kind: SourceFileKind;
  file: string;
  location: string;
  sha256: string;
  slug: string;
  mdast: GenericParent;
};
