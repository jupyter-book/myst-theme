import React from 'react';

type Options = {
  gridSystem?: string;
};

const Context = React.createContext<Options | undefined>(undefined);
Context.displayName = 'GridSystemContext';

export function GridSystemProvider({
  children,
  gridSystem,
}: {
  children: React.ReactNode;
  gridSystem?: string;
}) {
  return <Context.Provider value={{ gridSystem }}>{children}</Context.Provider>;
}

export function useGridSystemProvider(): string {
  const context = React.useContext(Context);
  const { gridSystem } = context ?? {};
  return gridSystem || 'article-grid';
}
