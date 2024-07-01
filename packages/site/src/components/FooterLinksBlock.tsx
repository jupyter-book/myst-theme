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
  return (
    <Link
      prefetch="intent"
      className="flex-1 block p-4 font-normal text-gray-600 no-underline border border-gray-200 rounded shadow-sm group hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-100 dark:border-gray-500 hover:shadow-lg dark:shadow-neutral-700"
      to={withBaseurl(url, baseurl)}
    >
      <div className="flex h-full align-middle">
        {right && (
          <ArrowLeftIcon
            width="1.5rem"
            height="1.5rem"
            className="self-center transition-transform group-hover:-translate-x-1 shrink-0"
          />
        )}
        <div className={classNames('flex-grow', { 'text-right': right })}>
          <div className="text-xs text-gray-500 dark:text-gray-400">{group || ' '}</div>
          {short_title || title}
        </div>
        {!right && (
          <ArrowRightIcon
            width="1.5rem"
            height="1.5rem"
            className="self-center transition-transform group-hover:translate-x-1 shrink-0"
          />
        )}
      </div>
    </Link>
  );
};

export function FooterLinksBlock({ links }: { links?: FooterLinks }) {
  if (!links || (!links.navigation?.prev && !links.navigation?.next)) return null;
  return (
    <div className="flex pt-10 mb-10 space-x-4">
      {links.navigation?.prev && <FooterLink {...links.navigation?.prev} right />}
      {links.navigation?.next && <FooterLink {...links.navigation?.next} />}
    </div>
  );
}
