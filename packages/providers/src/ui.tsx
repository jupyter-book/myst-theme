import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMediaQuery } from './hooks.js';

type UiState = {
  isNavOpen?: boolean;
  isWide?: boolean;
};

type UiContextType = [UiState, (state: UiState) => void];

export const UiContext = createContext<UiContextType | undefined>(undefined);

// Create a provider for components to consume and subscribe to changes
export function UiStateProvider({ children }: { children: React.ReactNode }) {
  // Close the nav
  const wide = useMediaQuery('(min-width: 1280px)');
  const [state, setState] = useState<UiState>({ isNavOpen: false });
  useEffect(() => {
    if (wide) setState({ ...state, isNavOpen: false, isWide: wide });
  }, [wide]);
  return <UiContext.Provider value={[state, setState]}>{children}</UiContext.Provider>;
}

export function useNavOpen(): [boolean, (open: boolean) => void] {
  const [state, setState] = useContext(UiContext) ?? [];
  const setOpen = (open: boolean) => {
    if (open === state?.isNavOpen) return;
    setState?.({ ...state, isNavOpen: open });
  };
  return [state?.isNavOpen ?? false, setOpen];
}

export function isWide(): boolean {
  const [state, _] = useContext(UiContext) ?? [];
  return state?.isWide ?? false;
}
