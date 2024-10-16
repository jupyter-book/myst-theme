import React, { useContext } from 'react';
import type { References } from 'myst-common';
import type { PageLoader } from '@myst-theme/common';

const ReferencesContext = React.createContext<{
  frontmatter?: PageLoader['frontmatter'];
  references?: References;
}>({});

export function ReferencesProvider({
  references,
  frontmatter,
  children,
}: {
  frontmatter?: PageLoader['frontmatter'];
  references?: References;
  children: React.ReactNode;
}) {
  return (
    <ReferencesContext.Provider value={{ references, frontmatter }}>
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
