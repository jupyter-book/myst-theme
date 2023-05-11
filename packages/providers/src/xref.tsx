import React, { createContext, useContext } from 'react';

interface RemoteXRefState {
  inCrossRef: boolean;
  remote: boolean;
  url?: string;
  dataUrl?: string;
}

const XRefContext = createContext<RemoteXRefState | undefined>(undefined);

export function useXRefState(): RemoteXRefState {
  const state = useContext(XRefContext) ?? { inCrossRef: false, remote: false, url: undefined };
  return state;
}

// Create a provider for components to consume and subscribe to changes
export function XRefProvider({
  remote,
  url,
  dataUrl,
  children,
}: {
  remote?: boolean;
  url?: string;
  dataUrl?: string;
  children: React.ReactNode;
}) {
  const parent = useXRefState();
  const value: RemoteXRefState = {
    inCrossRef: true,
    remote: remote ?? parent.remote,
    url: url ?? parent.url,
    dataUrl: dataUrl ?? parent.dataUrl,
  };
  if (value.remote && !value.url) {
    value.remote = false;
  }
  return <XRefContext.Provider value={value}>{children}</XRefContext.Provider>;
}
