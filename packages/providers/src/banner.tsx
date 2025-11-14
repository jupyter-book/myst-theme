// Context to provide the visibility and height of the top banner,
// and a mechanism to set it from within the Banner upon redraw.

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react';

type BannerState = {
  visible?: boolean;
  height: number;
};

type BannerContextValue = {
  bannerState: BannerState;
  setBannerState: Dispatch<SetStateAction<BannerState>>;
};

const BannerStateContext = createContext<BannerContextValue | undefined>(undefined);

export function BannerStateProvider({ children }: { children: React.ReactNode }) {
  const [bannerState, setBannerState] = useState<BannerState>({ visible: undefined, height: 0 });

  const value = useMemo(() => ({ bannerState, setBannerState }), [bannerState]);

  return <BannerStateContext.Provider value={value}>{children}</BannerStateContext.Provider>;
}

export function useBannerState() {
  const ctx = useContext(BannerStateContext);
  if (!ctx) {
    throw new Error('useBannerState must be used from within BannerStateProvider');
  }
  return ctx;
}
