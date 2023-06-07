import classNames from 'classnames';
import ArrowLeftIcon from '@heroicons/react/24/outline/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import type { FooterLinks, NavigationLink } from '../types';
import { useLinkProvider, useBaseurl, withBaseurl } from '@myst-theme/providers';

const FooterLink = ({
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
      className="group flex-1 p-4 block border font-normal hover:border-blue-600 dark:hover:border-blue-400 no-underline hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-100 border-gray-200 dark:border-gray-500 rounded shadow-sm hover:shadow-lg dark:shadow-neutral-700"
      to={withBaseurl(url, baseurl)}
    >
      <div className="flex align-middle h-full">
        {right && (
          <ArrowLeftIcon className="w-6 h-6 self-center transition-transform group-hover:-translate-x-1 shrink-0" />
        )}
        <div className={classNames('flex-grow', { 'text-right': right })}>
          <div className="text-xs text-gray-500 dark:text-gray-400">{group || ' '}</div>
          {short_title || title}
        </div>
        {!right && (
          <ArrowRightIcon className="w-6 h-6 self-center transition-transform group-hover:translate-x-1 shrink-0" />
        )}
      </div>
    </Link>
  );
};

export function FooterLinksBlock({ links }: { links?: FooterLinks }) {
  if (!links) return null;
  return (
    <div className="flex space-x-4 pt-10 mb-10">
      {links.navigation?.prev && <FooterLink {...links.navigation?.prev} right />}
      {links.navigation?.next && <FooterLink {...links.navigation?.next} />}
    </div>
  );
}
