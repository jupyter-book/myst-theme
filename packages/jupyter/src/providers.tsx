import type { SourceFileKind } from 'myst-spec-ext';
import React, { useContext } from 'react';
import { ThebeServerProvider } from 'thebe-react';
import { type ExtendedCoreOptions, thebeFrontmatterToOptions } from './utils.js';
import type { GenericParent } from 'myst-common';
import type { SiteManifest } from 'myst-config';
import type { RepoProviderSpec } from 'thebe-core';

function makeThebeOptions(
  siteManifest: SiteManifest | undefined,
  optionsOverrideFn = (opts: ExtendedCoreOptions) => opts,
): {
  options?: ExtendedCoreOptions;
  githubBadgeUrl?: string;
  binderBadgeUrl?: string;
} {
  if (!siteManifest) return {};
  // TODO there may be multiple projects?
  // useProjectManifest?
  const mainProject = siteManifest?.projects?.[0];
  const thebeFrontmatter = mainProject?.thebe;
  const githubBadgeUrl = mainProject?.github;
  const binderBadgeUrl = mainProject?.binder;
  const optionsFromFrontmatter = thebeFrontmatterToOptions(
    thebeFrontmatter,
    githubBadgeUrl,
    binderBadgeUrl,
  );

  let options = optionsFromFrontmatter;
  if (options) options = optionsOverrideFn(options);

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

const ThebeOptionsContext = React.createContext<ThebeOptionsContextType>({});

export function ConfiguredThebeServerProvider({
  siteManifest,
  optionOverrideFn,
  customRepoProviders,
  children,
}: React.PropsWithChildren<{
  siteManifest?: SiteManifest;
  optionOverrideFn?: (opts: ExtendedCoreOptions) => ExtendedCoreOptions;
  customRepoProviders?: RepoProviderSpec[];
}>) {
  const thebe = React.useMemo(
    () => makeThebeOptions(siteManifest, optionOverrideFn),
    [siteManifest, optionOverrideFn],
  );

  if (!siteManifest) return <>{children}</>;

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

export function useCanCompute(article: { frontmatter: { thebe?: boolean | Record<string, any> } }) {
  const thebe = useContext(ThebeOptionsContext);
  return !!thebe && (article.frontmatter as any)?.thebe !== false;
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
