import type { Link as SpecLink } from 'myst-spec-ext';
import classNames from 'classnames';

type Link = SpecLink & {
  kind?: 'button';
  class?: string;
};

export function LinkOrButton({
  children,
  isSecure,
  href,
  kind,
  className,
}: {
  children: React.ReactNode;
  href: string;
  isSecure?: boolean;
  kind?: Link['kind'];
  className?: Link['class'];
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel={!isSecure ? 'noopener noreferrer' : 'noreferrer'}
      className={classNames({ button: kind === 'button' }, className)}
    >
      {children}
    </a>
  );
}
