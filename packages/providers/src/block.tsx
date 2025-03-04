import React, { createContext, useContext } from 'react';

type BlockDepth = {
  depth: number;
};
const BlockDepthContext = createContext<BlockDepth | undefined>(undefined);

export function BlockDepthProvider({
  children,
  depth,
}: {
  children: React.ReactNode;
  depth: number;
}) {
  return <BlockDepthContext.Provider value={{ depth }}>{children}</BlockDepthContext.Provider>;
}

export function useBlockDepth(): number {
  const context = useContext(BlockDepthContext);
  const { depth } = context ?? { depth: 0 };
  return depth;
}
