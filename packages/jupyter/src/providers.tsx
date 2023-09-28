import type { SourceFileKind } from 'myst-spec-ext';
import React, { useContext } from 'react';
import { ThebeServerProvider } from 'thebe-react';
import { ExtendedCoreOptions, thebeFrontmatterToOptions } from './utils';
import type { GenericParent } from 'myst-common';
import { SiteManifest } from 'myst-config';
import { RepoProviderSpec } from 'thebe-core';

function makeThebeOptions(
  siteManifest: SiteManifest | undefined,
  overrides?: { thebe?: false },
): {
  options?: ExtendedCoreOptions;
  githubBadgeUrl?: string;
  binderBadgeUrl?: string;
} {
  if (!siteManifest || overrides?.thebe === false) return {};
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

  const options = thebeFrontmatter ? optionsFromFrontmatter : undefined;
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
  overrides,
  customRepoProviders,
  children,
}: React.PropsWithChildren<{
  siteManifest?: SiteManifest;
  overrides?: any;
  customRepoProviders?: RepoProviderSpec[];
}>) {
  const thebe = React.useMemo(
    () => makeThebeOptions(siteManifest, overrides),
    [siteManifest, overrides],
  );

  console.log('SITE MANIFEST', siteManifest);
  console.log('THEBE', thebe);

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
