import classNames from 'classnames';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { FooterLinks, NavigationLink } from '@myst-theme/common';
import { useLinkProvider, useBaseurl, withBaseurl } from '@myst-theme/providers';

export const FooterLink = ({
  title,
  short_title,
  url,
  group,
  right,
}: NavigationLink & { right?: boolean }) => {
  const baseurl = useBaseurl();
  const Link = useLinkProvider();
  const linkText = short_title || title;
  return (
    <Link
      prefetch="intent"
      className={classNames(
        'myst-footer-link flex-1 block p-4 font-normal text-myst-text-secondary no-underline border border-myst-border rounded shadow-sm group hover:border-myst-active hover:text-myst-active hover:shadow-lg dark:shadow-neutral-700',
        { 'myst-footer-link-prev': right, 'myst-footer-link-next': !right },
      )}
      to={withBaseurl(url, baseurl)}
      aria-label={`${right ? 'Previous: ' : 'Next: '}${linkText}`}
    >
      <div className="flex h-full align-middle">
        {right && (
          <ArrowLeftIcon
            width="1.5rem"
            height="1.5rem"
            className="myst-footer-link-icon self-center transition-transform group-hover:-translate-x-1 shrink-0"
          />
        )}
        <div className={classNames('flex-grow', { 'text-right': right })}>
          <div className="myst-footer-link-group text-xs text-myst-text-tertiary">
            {group || ' '}
          </div>
          {linkText}
        </div>
        {!right && (
          <ArrowRightIcon
            width="1.5rem"
            height="1.5rem"
            className="myst-footer-link-icon self-center transition-transform group-hover:translate-x-1 shrink-0"
          />
        )}
      </div>
    </Link>
  );
};

export function FooterLinksBlock({ links }: { links?: FooterLinks }) {
  if (!links || (!links.navigation?.prev && !links.navigation?.next)) return null;
  return (
    <div className="myst-footer-links flex pt-10 mb-10 space-x-4">
      {links.navigation?.prev && <FooterLink {...links.navigation?.prev} right />}
      {links.navigation?.next && <FooterLink {...links.navigation?.next} />}
    </div>
  );
}
