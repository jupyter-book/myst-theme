import React, { useContext } from 'react';
import type { SourceFileKind } from 'myst-spec-ext';

const PageKindContext = React.createContext<SourceFileKind | undefined>(undefined);

export function PageKindProvider({
  pageKind,
  children,
}: {
  pageKind: SourceFileKind;
  children: React.ReactNode;
}) {
  return <PageKindContext.Provider value={pageKind}>{children}</PageKindContext.Provider>;
}

export function usePageKindProvider() {
  const config = useContext(PageKindContext);
  return config;
}
