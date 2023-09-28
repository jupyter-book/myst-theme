import type { SourceFileKind } from 'myst-spec-ext';
import React from 'react';
import { ThebeServerProvider } from 'thebe-react';
import { useSiteManifest } from '@myst-theme/providers';
import { thebeFrontmatterToOptions } from './utils';
import type { GenericParent } from 'myst-common';

export function useComputeOptions() {
  const config = useSiteManifest();
  const makeOptions = () => {
    if (!config) return { canCompute: false };
    // TODO there may be multiple projects?
    // useProjectManifest?
    const mainProject = config?.projects?.[0];
    const thebeFrontmatter = mainProject?.thebe;
    const githubBadgeUrl = mainProject?.github;
    const binderBadgeUrl = mainProject?.binder;
    const thebeOptions = thebeFrontmatterToOptions(
      thebeFrontmatter,
      githubBadgeUrl,
      binderBadgeUrl,
    );
    return {
      thebe: thebeFrontmatter ? thebeOptions : undefined,
      githubBadgeUrl,
      binderBadgeUrl,
    };
  };

  return React.useMemo(makeOptions, [config]);
}

export function useCanCompute(article: { frontmatter: { thebe?: boolean | Record<string, any> } }) {
  const { thebe } = useComputeOptions();
  return !!thebe && (article.frontmatter as any)?.thebe !== false;
}

export function ConfiguredThebeServerProvider({ children }: React.PropsWithChildren) {
  const { thebe } = useComputeOptions();

  return (
    <ThebeServerProvider
      connect={false}
      options={thebe}
      useBinder={thebe?.useBinder}
      useJupyterLite={thebe?.useJupyterLite}
    >
      <>{children}</>
    </ThebeServerProvider>
  );
}

export type PartialPage = {
  kind: SourceFileKind;
  file: string;
  sha256: string;
  slug: string;
  mdast: GenericParent;
};
