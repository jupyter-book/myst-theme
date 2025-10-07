import type { SourceFileKind } from 'myst-spec-ext';
import React, { useContext } from 'react';
import { type ExtendedCoreOptions, thebeFrontmatterToOptions } from './utils.js';
import type { GenericParent } from 'myst-common';
import { useProjectManifest } from '@myst-theme/providers';
import type { RepoProviderSpec } from 'thebe-core';
import { ThebeBundleLoaderProvider, ThebeServerProvider } from 'thebe-react';
import type { IdOrKey } from './execute/types.js';

type ComputeOptionsContextType = {
  enabled: boolean;
  features: {
    notebookCompute: boolean;
    figureCompute: boolean;
    launchBinder: boolean;
  };
  thebe?: ExtendedCoreOptions;
  customRepoProviders?: RepoProviderSpec[];
};

const ComputeOptionsContext = React.createContext<ComputeOptionsContextType | undefined>(undefined);

export function ComputeOptionsProvider({
  features,
  optionOverrideFn,
  customRepoProviders,
  children,
}: React.PropsWithChildren<{
  features: {
    notebookCompute: boolean;
    figureCompute: boolean;
    launchBinder: boolean;
  };
  optionOverrideFn?: (opts?: ExtendedCoreOptions) => ExtendedCoreOptions | undefined;
  customRepoProviders?: RepoProviderSpec[];
}>) {
  const project = useProjectManifest();

  const options = React.useMemo(() => {
    if (!project) return;
    const thebeFrontmatter = project?.thebe;
    const githubBadgeUrl = project?.github;
    const binderBadgeUrl = project?.binder;
    const optionsFromFrontmatter = thebeFrontmatterToOptions(thebeFrontmatter);

    const optionsWithOverrides = optionOverrideFn
      ? optionOverrideFn(optionsFromFrontmatter)
      : optionsFromFrontmatter;

    return {
      enabled: !!optionsWithOverrides,
      thebe: optionsWithOverrides,
      githubBadgeUrl,
      binderBadgeUrl,
      features,
      customRepoProviders,
    };
  }, [project, optionOverrideFn]);

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

/**
 *
 * @param baseurl - as a prop allows for flexibility in themes
 * @returns
 */
export function ThebeLoaderAndServer({
  baseurl,
  connect,
  children,
}: React.PropsWithChildren<{ connect?: boolean; baseurl?: string }>) {
  const compute = useComputeOptions();
  return (
    <ThebeBundleLoaderProvider
      loadThebeLite={compute?.thebe?.useJupyterLite ?? false}
      publicPath={baseurl}
    >
      <ThebeServerProvider
        connect={connect ?? false}
        options={compute?.thebe}
        useBinder={compute?.thebe?.useBinder ?? false}
        useJupyterLite={compute?.thebe?.useJupyterLite ?? false}
        customRepoProviders={compute?.customRepoProviders ?? []}
      >
        {children}
      </ThebeServerProvider>
    </ThebeBundleLoaderProvider>
  );
}

type OutputsContextType = {
  outputsId: IdOrKey;
};
const OutputsContext = React.createContext<OutputsContextType | null>(null);

export function useOutputsContext() {
  const context = useContext(OutputsContext);
  if (context === null) {
    throw new Error('useOutputsContext must be used within a OutputsContextProvider');
  }
  return context;
}
export function OutputsContextProvider({
  outputsId,
  children,
}: {
  children: React.ReactNode;
  outputsId: IdOrKey;
}) {
  return <OutputsContext.Provider value={{ outputsId }}>{children}</OutputsContext.Provider>;
}
