import classNames from 'classnames';
import type { BreadcrumbItem } from '@myst-theme/common';
import { useBaseurl, useLinkProvider, withBaseurl } from '@myst-theme/providers';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

/** Render a breadcrumb trail. `items` comes from `getBreadcrumbs()` */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const baseurl = useBaseurl();
  const Link = useLinkProvider();
  return (
    <nav aria-label="Breadcrumb" className="myst-breadcrumbs not-prose min-w-0 mr-2">
      <ol className="flex flex-wrap items-center gap-1 pl-0 my-0 list-none text-myst-text-secondary">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const label = isFirst ? (
            <>
              <HomeIcon className="w-4 h-4" />
              <span className="sr-only">{item.title}</span>
            </>
          ) : (
            <span className="truncate max-w-[12rem]">{item.title}</span>
          );
          return (
            <li key={index} className="flex items-center gap-1">
              {!isFirst && (
                <ChevronRightIcon aria-hidden className="flex-none w-3 h-3 opacity-60" />
              )}
              {item.path && !isLast ? (
                <Link
                  prefetch="intent"
                  to={withBaseurl(item.path, baseurl)}
                  className="myst-breadcrumbs-link flex items-center gap-1 no-underline text-inherit hover:text-myst-active"
                >
                  {label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={classNames('flex items-center', { 'text-myst-text': isLast })}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
