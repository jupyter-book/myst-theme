import React, { useContext } from 'react';
import type { ISearch } from '@myst-theme/search';

const SearchContext = React.createContext<ISearch | undefined>(undefined);

export function SearchProvider({
  search,
  children,
}: {
  search?: ISearch;
  children: React.ReactNode;
}) {
  return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const config = useContext(SearchContext);
  return config;
}
