import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMediaQuery } from './hooks.js';

type UiState = {
  isNavOpen?: boolean;
  isWide?: boolean;
};

type UiContextType = [UiState, (state: UiState) => void];

export const UiContext = createContext<UiContextType | undefined>(undefined);

// Tracks viewport width and mobile nav open state.
export function UiStateProvider({ children }: { children: React.ReactNode }) {
  const wide = useMediaQuery('(min-width: 1280px)');
  const [state, setState] = useState<UiState>({ isNavOpen: false });
  useEffect(() => {
    setState((prev) => ({
      isWide: wide,
      // Close the mobile nav when switching to wide viewport (e.g. if user goes full-screen)
      isNavOpen: wide ? false : prev.isNavOpen,
    }));
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

export function useIsWide(): boolean {
  const [state] = useContext(UiContext) ?? [];
  return state?.isWide ?? false;
}
