import React, { useContext } from 'react';
import type { ISearch, MystSearchIndex } from '@myst-theme/search';

type SearchFactory = (index: MystSearchIndex) => ISearch;
const SearchFactoryContext = React.createContext<SearchFactory | undefined>(undefined);

export function SearchFactoryProvider({
  factory,
  children,
}: {
  factory?: SearchFactory;
  children: React.ReactNode;
}) {
  return <SearchFactoryContext.Provider value={factory}>{children}</SearchFactoryContext.Provider>;
}

export function useSearchFactory() {
  const config = useContext(SearchFactoryContext);
  return config;
}
