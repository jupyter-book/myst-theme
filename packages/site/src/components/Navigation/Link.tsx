import React from 'react';
import { useLinkProvider, useNavLinkProvider } from '@myst-theme/providers';

export function ExternalOrInternalLink({
  to,
  className,
  children,
  nav,
  onClick,
  prefetch = 'intent',
}: {
  to: string;
  className?: string | ((props: { isActive: boolean }) => string);
  children: React.ReactNode;
  nav?: boolean;
  onClick?: () => void;
  prefetch?: 'intent' | 'render' | 'none';
}) {
  const Link = useLinkProvider();
  const NavLink = useNavLinkProvider();
  const staticClass = typeof className === 'function' ? className({ isActive: false }) : className;
  if (to.startsWith('http') || to.startsWith('mailto:')) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={staticClass}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  if (nav) {
    return (
      <NavLink prefetch={prefetch} to={to} className={className} onClick={onClick}>
        {children}
      </NavLink>
    );
  }
  return (
    <Link prefetch={prefetch} to={to} className={staticClass} onClick={onClick}>
      {children}
    </Link>
  );
}
