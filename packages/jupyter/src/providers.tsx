import type { SourceFileKind } from 'myst-spec-ext';
import React, { useContext } from 'react';
import { ThebeServerProvider } from 'thebe-react';
import { type ExtendedCoreOptions, thebeFrontmatterToOptions } from './utils.js';
import type { GenericParent } from 'myst-common';
import type { SiteManifest } from 'myst-config';
import type { RepoProviderSpec } from 'thebe-core';

function makeThebeOptions(
  project: Required<SiteManifest>['projects'][0],
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
  project,
  optionOverrideFn,
  customRepoProviders,
  children,
}: React.PropsWithChildren<{
  project?: Required<SiteManifest>['project'][0];
  optionOverrideFn?: (opts?: ExtendedCoreOptions) => ExtendedCoreOptions | undefined;
  customRepoProviders?: RepoProviderSpec[];
}>) {
  const thebe = React.useMemo(
    () => makeThebeOptions(project, optionOverrideFn),
    [project, optionOverrideFn],
  );

  if (!project) return <>{children}</>;

  return (
    <ThebeOptionsContext.Provider value={thebe}>
      <ThebeServerProvider
        connect={false}
        options={thebe.options}
        useBinder={thebe.options?.useBinder ?? false}
        useJupyterLite={thebe.options?.useJupyterLite ?? false}
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
