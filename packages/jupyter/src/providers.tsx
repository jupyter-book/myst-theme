import type { SourceFileKind } from 'myst-common';
import React from 'react';
import { ThebeServerProvider } from 'thebe-react';
import type { Root } from 'mdast';
import { useSiteManifest } from '@myst-theme/providers';
import { thebeFrontmatterToOptions } from './utils';

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
      canCompute: thebeFrontmatter !== undefined && thebeFrontmatter !== false,
      thebe: thebeOptions,
      githubBadgeUrl,
      binderBadgeUrl,
    };
  };

  return React.useMemo(makeOptions, [config]);
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
      {children}
    </ThebeServerProvider>
  );
}

export type PartialPage = {
  kind: SourceFileKind;
  file: string;
  sha256: string;
  slug: string;
  mdast: Root;
};
