import * as React from 'react';
import type { NodeRenderer } from './types';

export enum Theme {
  light = 'light',
  dark = 'dark',
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && Object.values(Theme).includes(value as Theme);
}

type ThemeContextType = {
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  renderers?: Record<string, NodeRenderer>;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);
ThemeContext.displayName = 'ThemeContext';

const prefersLightMQ = '(prefers-color-scheme: light)';

export function ThemeProvider({
  children,
  theme: startingTheme,
  renderers,
}: {
  children: React.ReactNode;
  theme: Theme | null;
  renderers?: Record<string, NodeRenderer>;
}) {
  const [theme, setTheme] = React.useState<Theme | null>(() => {
    if (startingTheme) {
      if (isTheme(startingTheme)) return startingTheme;
      else return null;
    }
    if (typeof document === 'undefined') return null;
    return window.matchMedia(prefersLightMQ).matches ? Theme.light : Theme.dark;
  });

  const nextTheme = React.useCallback(
    (next: Theme) => {
      if (!next || next === theme || !isTheme(next)) return;
      if (typeof document !== 'undefined') {
        document.getElementsByTagName('html')[0].className = next;
      }
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST', '/api/theme');
      xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xmlhttp.send(JSON.stringify({ theme: next }));
      setTheme(next);
    },
    [theme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme: nextTheme, renderers }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    const error = 'useTheme should be used within a ThemeProvider';
    const throwError = () => {
      throw new Error(error);
    };
    // Just log an error if the theme is asked for
    console.error(error);
    return {
      theme: Theme.light,
      isLight: true,
      isDark: false,
      setTheme: throwError,
      nextTheme: throwError,
    };
  }
  const { theme, setTheme } = context;
  const isDark = theme === Theme.dark;
  const isLight = theme === Theme.light;
  const nextTheme = React.useCallback(() => {
    const next = theme === Theme.light ? Theme.dark : Theme.light;
    setTheme(next);
  }, [theme]);
  return { theme, isLight, isDark, setTheme, nextTheme };
}

export function useNodeRenderers(): Record<string, NodeRenderer> | undefined {
  const context = React.useContext(ThemeContext);
  const { renderers } = context ?? {};
  return renderers;
}
