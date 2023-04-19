import React, { useContext } from 'react';
import type { KINDS } from './types';

type BlockContextType = {
  parent: string;
  context: KINDS;
};

const BlockContext = React.createContext<BlockContextType | undefined>(undefined);

export function BlockContextProvider({
  id,
  pageKind,
  children,
}: React.PropsWithChildren<{ id: string; pageKind: KINDS }>) {
  return (
    <BlockContext.Provider value={{ parent: id, context: pageKind }}>
      {children}
    </BlockContext.Provider>
  );
}

export function useBlockContext() {
  const context = useContext(BlockContext);
  if (!context) console.debug('useBlockContext used outside of a BlockContextProvider');
  return context;
}
