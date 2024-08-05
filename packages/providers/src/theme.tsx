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

const prefersLightMQ = '(prefers-color-scheme: light)';

/**
 * Return the theme preference indicated by the system
 */
function getPreferredTheme() {
  return window.matchMedia(prefersLightMQ).matches ? Theme.light : Theme.dark;
}

const clientThemeSource = `
  const theme = window.matchMedia(${JSON.stringify(prefersLightMQ)}).matches ? 'light' : 'dark';
  const classes = document.documentElement.classList;
  const hasAnyTheme = classes.contains('light') || classes.contains('dark');
  if (hasAnyTheme) {
    console.warn("Document already has theme at load. Set by cookie perhaps?");
  } else {
    classes.add(theme);
  }
`;

/**
 * A blocking element that runs before hydration to update the <html> preferred class
 */
export function BlockingThemeLoader() {
  return <script dangerouslySetInnerHTML={{ __html: clientThemeSource }} />;
}

export function ThemeProvider({
  children,
  theme: startingTheme,
  renderers,
  Link,
  top,
  NavLink,
}: {
  children: React.ReactNode;
  theme?: Theme;
  renderers?: NodeRenderers;
  Link?: Link;
  top?: number;
  NavLink?: NavLink;
}) {
  const [theme, setTheme] = React.useState<Theme | null>(() => {
    // Allow hard-coded theme ignoring system preferences (not recommended)
    if (startingTheme) {
      return isTheme(startingTheme) ? startingTheme : null;
    }
    if (typeof window !== 'object') {
      return null;
    }

    // Interrogate the sytstem for a preferred theme
    return getPreferredTheme();
  });

  const validatedRenderers = validateRenderers(renderers);
  // Listen for system-updates that change the preferred theme
  useEffect(() => {
    const mediaQuery = window.matchMedia(prefersLightMQ);
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
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/api/theme');
    xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xmlhttp.send(JSON.stringify({ theme }));
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
