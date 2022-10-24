import { Link } from '@remix-run/react';

export function ExternalOrInternalLink({
  to,
  className,
  isStatic,
  prefetch = 'intent',
  title,
  children,
}: {
  to: string;
  className?: string;
  isStatic?: boolean;
  prefetch?: 'intent' | 'render' | 'none';
  title?: string;
  children: React.ReactNode;
}) {
  if (to.startsWith('http') || isStatic) {
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer" title={title}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className} prefetch={prefetch} title={title}>
      {children}
    </Link>
  );
}
