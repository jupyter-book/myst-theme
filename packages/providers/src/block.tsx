import type { SourceFileKind } from 'myst-common';
import React, { useContext } from 'react';

type BlockContextType = {
  parent: string;
  context: SourceFileKind;
};

const BlockContext = React.createContext<BlockContextType | undefined>(undefined);

export function BlockContextProvider({
  id,
  kind,
  children,
}: React.PropsWithChildren<{ id: string; kind: SourceFileKind }>) {
  return (
    <BlockContext.Provider value={{ parent: id, context: kind }}>{children}</BlockContext.Provider>
  );
}

export function useBlockContext() {
  const context = useContext(BlockContext);
  if (!context) console.debug('useBlockContext used outside of a BlockContextProvider');
  return context;
}
