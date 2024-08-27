import React, { useEffect, useRef } from 'react';
import { validateRenderers, type NodeRenderers, type NodeRenderersValidated } from './renderers.js';
import { Theme } from '@myst-theme/common';

export { Theme };

export type LinkProps = {
  to: string;
  prefetch?: 'intent' | 'render' | 'none';
  title?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  suppressHydrationWarning?: boolean;
};

export type NavLinkProps = Omit<LinkProps, 'className'> & {
  className?: string | ((opts: { isActive: boolean }) => string);
};

export type Link = (props: LinkProps) => JSX.Element;
export type NavLink = (props: NavLinkProps) => JSX.Element;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HtmlLink({ to, className, children, prefetch, ...props }: LinkProps) {
  return (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HtmlNavLink({ to, className, children, prefetch, ...props }: NavLinkProps) {
  const staticClass = typeof className === 'function' ? className({ isActive: false }) : className;
  return (
    <a href={to} className={staticClass} {...props}>
      {children}
    </a>
  );
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && Object.values(Theme).includes(value as Theme);
}

type ThemeContextType = {
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  renderers?: NodeRenderersValidated;
  top?: number;
  Link?: Link;
  NavLink?: NavLink;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);
ThemeContext.displayName = 'ThemeContext';

const PREFERS_LIGHT_MQ = '(prefers-color-scheme: light)';

const THEME_KEY = 'myst:theme';

/**
 * A blocking element that runs on the client before hydration to update the <html> preferred class
 * This ensures that the hydrated state matches the non-hydrated state (by updating the DOM on the
 * client between SSR on the server and hydration on the client)
 */
export function BlockingThemeLoader({ useLocalStorage }: { useLocalStorage: boolean }) {
  const LOCAL_STORAGE_SOURCE = `localStorage.getItem(${JSON.stringify(THEME_KEY)})`;
  const CLIENT_THEME_SOURCE = `
  const savedTheme = ${useLocalStorage ? LOCAL_STORAGE_SOURCE : 'null'};
  const theme = window.matchMedia(${JSON.stringify(PREFERS_LIGHT_MQ)}).matches ? 'light' : 'dark';
  const classes = document.documentElement.classList;
  const hasAnyTheme = classes.contains('light') || classes.contains('dark');
  if (!hasAnyTheme) classes.add(savedTheme ?? theme);
`;

  return <script dangerouslySetInnerHTML={{ __html: CLIENT_THEME_SOURCE }} />;
}

export function ThemeProvider({
  children,
  theme: ssrTheme,
  renderers,
  Link,
  top,
  NavLink,
  useLocalStorageForDarkMode,
}: {
  children: React.ReactNode;
  theme?: Theme;
  renderers?: NodeRenderers;
  Link?: Link;
  top?: number;
  NavLink?: NavLink;
  useLocalStorageForDarkMode?: boolean;
}) {
  const [theme, setTheme] = React.useState<Theme | null>(() => {
    if (isTheme(ssrTheme)) {
      return ssrTheme;
    }
    // On the server we can't know what the preferred theme is, so leave it up to client
    if (typeof window !== 'object') {
      return null;
    }
    // System preferred theme
    const mediaQuery = window.matchMedia(PREFERS_LIGHT_MQ);
    const preferredTheme = mediaQuery.matches ? Theme.light : Theme.dark;

    // Local storage preferred theme
    const savedTheme = localStorage.getItem(THEME_KEY);
    return useLocalStorageForDarkMode && isTheme(savedTheme) ? savedTheme : preferredTheme;
  });

  const validatedRenderers = validateRenderers(renderers);
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
    if (useLocalStorageForDarkMode) {
      localStorage.setItem(THEME_KEY, theme);
    } else {
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open('POST', '/api/theme');
      xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xmlhttp.send(JSON.stringify({ theme }));
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, renderers: validatedRenderers, Link, NavLink, top }}
    >
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

export function useNodeRenderers(): NodeRenderersValidated {
  const context = React.useContext(ThemeContext);
  const { renderers } = context ?? {};
  return renderers ?? {};
}

export function useLinkProvider(): Link {
  const context = React.useContext(ThemeContext);
  const { Link } = context ?? {};
  return Link ?? HtmlLink;
}

export function useNavLinkProvider(): NavLink {
  const context = React.useContext(ThemeContext);
  const { NavLink } = context ?? {};
  return NavLink ?? HtmlNavLink;
}

export function useThemeTop(): number {
  const context = React.useContext(ThemeContext);
  const { top } = context ?? {};
  return top || 0;
}
