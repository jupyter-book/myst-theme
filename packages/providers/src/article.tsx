import React, { useContext } from 'react';
import type { References } from 'myst-common';
import type { PageLoader } from '@myst-theme/common';
import { SourceFileKind } from 'myst-spec-ext';

const ArticleContext = React.createContext<{
  kind?: SourceFileKind;
  frontmatter?: PageLoader['frontmatter'];
  references?: References;
}>({});

export function ArticleProvider({
  kind,
  references,
  frontmatter,
  children,
}: {
  kind: SourceFileKind;
  frontmatter?: PageLoader['frontmatter'];
  references?: References;
  children: React.ReactNode;
}) {
  return (
    <ArticleContext.Provider value={{ kind, references, frontmatter }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useReferences() {
  const data = useContext(ArticleContext);
  return data?.references;
}

export function useFrontmatter() {
  const data = useContext(ArticleContext);
  return data?.frontmatter;
}

export function usePageKind() {
  const data = useContext(ArticleContext);
  return data?.kind ?? SourceFileKind.Article;
}

export { ArticleProvider as ReferencesProvider };
