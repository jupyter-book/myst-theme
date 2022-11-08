import React, { useContext } from 'react';
import type { PageFrontmatter } from 'myst-frontmatter';
import type { References } from '@curvenote/site-common';

const ReferencesContext = React.createContext<{
  frontmatter?: PageFrontmatter;
  references?: References;
  urlbase?: string;
}>({});

export function ReferencesProvider({
  references,
  frontmatter,
  urlbase,
  children,
}: {
  frontmatter?: PageFrontmatter;
  references?: References;
  urlbase?: string;
  children: React.ReactNode;
}) {
  return (
    <ReferencesContext.Provider value={{ references, frontmatter, urlbase }}>
      {children}
    </ReferencesContext.Provider>
  );
}

export function useReferences() {
  const data = useContext(ReferencesContext);
  return data?.references;
}

export function useFrontmatter() {
  const data = useContext(ReferencesContext);
  return data?.frontmatter;
}

export function useUrlbase() {
  const data = useContext(ReferencesContext);
  return data?.urlbase;
}

export function withUrlbase(url?: string, urlbase?: string) {
  if (urlbase) return urlbase + url;
  return url as string;
}
