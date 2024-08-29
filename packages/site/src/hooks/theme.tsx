import React, { useEffect, useRef } from 'react';
import { Theme } from '@myst-theme/common';
import { isTheme } from '@myst-theme/providers';
import { postThemeToAPI } from '../actions/theme.js';

export const PREFERS_LIGHT_MQ = '(prefers-color-scheme: light)';
export const THEME_LOCALSTORAGE_KEY = 'myst:theme';

export function getPreferredTheme() {
  if (typeof window !== 'object') {
    return null;
  }
  const mediaQuery = window.matchMedia(PREFERS_LIGHT_MQ);
  return mediaQuery.matches ? Theme.light : Theme.dark;
}

/**
 * Hook that changes theme to follow changes to system preference.
 */
export function usePreferredTheme({ setTheme }: { setTheme: (theme: Theme | null) => void }) {
  // Listen for system-updates that change the preferred theme
  // This will modify the saved theme
  useEffect(() => {
    const mediaQuery = window.matchMedia(PREFERS_LIGHT_MQ);
    const handleChange = () => {
      setTheme(mediaQuery.matches ? Theme.light : Theme.dark);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
}

export function useTheme({
  ssrTheme,
  useLocalStorage,
}: {
  ssrTheme: Theme | null;
  useLocalStorage?: boolean;
}) {
  // Here, the initial state on the server without any set cookies will be null.
  // The client will then load the initial state as non-null.
  // Thus, we must mutate the DOM *pre-hydration* to ensure that the initial state is
  // identical to that of the hydrated state, i.e. perform out-of-react DOM updates
  // This is handled by the BlockingThemeLoader component.
  const [theme, setTheme] = React.useState<Theme | null>(() => {
    if (isTheme(ssrTheme)) {
      return ssrTheme;
    }
    // On the server we can't know what the preferred theme is, so leave it up to client
    if (typeof window !== 'object') {
      return null;
    }
    // System preferred theme
    const preferredTheme = getPreferredTheme();

    // Local storage preferred theme
    const savedTheme = localStorage.getItem(THEME_LOCALSTORAGE_KEY);
    return useLocalStorage && isTheme(savedTheme) ? savedTheme : preferredTheme;
  });

  // Listen for system-updates that change the preferred theme
  usePreferredTheme({ setTheme });

  // Listen for changes to theme, and propagate to server
  // This should be unidirectional; updates to the cookie do not trigger document rerenders
  const mountRun = useRef(false);
  useEffect(() => {
    // Only update after the component is mounted (i.e. don't send initial state)
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!isTheme(theme)) {
      return;
    }
    if (useLocalStorage) {
      localStorage.setItem(THEME_LOCALSTORAGE_KEY, theme);
    } else {
      postThemeToAPI(theme);
    }
  }, [theme]);

  return [theme, setTheme];
}
