import React, { createContext, useContext, useState } from 'react';

const TabContext = createContext<[string, (state: string) => void] | undefined>(undefined);

// Create a provider for components to consume and subscribe to changes
export function TabStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<string>('');
  return <TabContext.Provider value={[state, setState]}>{children}</TabContext.Provider>;
}

export function useTabSet(): [string, (key: string) => void] | undefined {
  return useContext(TabContext);
}
