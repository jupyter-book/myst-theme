import React from 'react';
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

type SetThemeType = (theme: Theme) => void;

type ThemeContextType = {
  theme: Theme | null;
  setTheme: SetThemeType;
  renderers?: NodeRenderersValidated;
  top?: number;
  Link?: Link;
  NavLink?: NavLink;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);
ThemeContext.displayName = 'ThemeContext';

export function ThemeProvider({
  theme,
  setTheme,
  children,
  renderers,
  Link,
  top,
  NavLink,
}: {
  theme: Theme | null;
  setTheme: SetThemeType;
  children: React.ReactNode;
  renderers?: NodeRenderers;
  Link?: Link;
  top?: number;
  NavLink?: NavLink;
}) {
  const validatedRenderers = validateRenderers(renderers);
  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, renderers: validatedRenderers, Link, NavLink, top }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSwitcher() {
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
