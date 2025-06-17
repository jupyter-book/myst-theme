import React, { useEffect } from 'react';
import classNames from 'classnames';
import * as Collapsible from '@radix-ui/react-collapsible';
import type { Heading } from '@myst-theme/common';
import {
  useBaseurl,
  useLinkProvider,
  useNavLinkProvider,
  useNavOpen,
  withBaseurl,
} from '@myst-theme/providers';
import { useLocation, useNavigation } from '@remix-run/react';
import { ChevronRightIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

type NestedHeading = Heading & { id: string; children: NestedHeading[] };

function nestToc(toc: Heading[]): NestedHeading[] {
  const items: NestedHeading[] = [];
  const stack: (Omit<NestedHeading, 'level'> & { level: number })[] = [];

  toc.forEach((tocItem, id) => {
    const item = tocItem as NestedHeading;
    item.children = [];
    item.id = String(id);
    if (item.level === 'index') {
      while (stack.length) stack.pop();
      items.push(item);
      return;
    }
    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    const top = stack[stack.length - 1];
    if (top) {
      top.children.push(item);
    } else {
      items.push(item);
    }
    stack.push(item as any);
  });
  return items;
}

function pathnameMatchesHeading(pathname: string, heading: Heading, baseurl?: string) {
  const headingPath = withBaseurl(heading.path, baseurl);
  if (pathname && headingPath === `${pathname}/index`) return true;
  return headingPath === pathname;
}

function childrenOpen(headings: NestedHeading[], pathname: string, baseurl?: string): string[] {
  return headings
    .map((heading) => {
      if (pathnameMatchesHeading(pathname, heading, baseurl)) return [heading.id];
      const open = childrenOpen(heading.children, pathname, baseurl);
      if (open.length === 0) return [];
      return [heading.id, ...open];
    })
    .flat();
}

export const Toc = ({
  headings,
  open_urls_in_new_tab,
}: {
  headings: Heading[];
  open_urls_in_new_tab?: boolean;
}) => {
  const nested = nestToc(headings);
  return (
    <div className="w-full px-1 dark:text-white">
      {nested.map((item) => (
        <NestedToc heading={item} key={item.id} open_urls_in_new_tab={open_urls_in_new_tab} />
      ))}
    </div>
  );
};

function LinkItem({
  className,
  heading,
  onClick,
  target,
}: {
  className?: string;
  heading: NestedHeading;
  onClick?: () => void;
  target?: string;
}) {
  const Link = useLinkProvider();
  const NavLink = useNavLinkProvider();
  const baseurl = useBaseurl();
  const [, setOpen] = useNavOpen();
  // Render external URL
  if (heading.url) {
    return (
      <Link
        title={`${heading.enumerator ? `${heading.enumerator} ` : ''}${heading.title}`}
        className={classNames(
          'block break-words focus:outline outline-blue-200 outline-2 rounded',
          className,
        )}
        to={heading.url}
        onClick={() => {
          onClick?.();
          setOpen(false);
        }}
        target={target}
      >
        {`${heading.enumerator ? `${heading.enumerator} ` : ''}${heading.title}`}
        <ArrowTopRightOnSquareIcon className="inline h-4 w-4 align-baseline ml-[0.2rem]" />
      </Link>
    );
  }
  if (!heading.path) {
    return (
      <div
        title={`${heading.enumerator ? `${heading.enumerator} ` : ''}${heading.title}`}
        className={classNames('block break-words rounded', className)}
        onClick={() => {
          onClick?.();
        }}
      >
        {`${heading.enumerator ? `${heading.enumerator} ` : ''}${
          heading.short_title || heading.title
        }`}
      </div>
    );
  }
  return (
    <NavLink
      prefetch="intent"
      title={`${heading.enumerator ? `${heading.enumerator} ` : ''}${heading.title}`}
      className={classNames(
        'block break-words focus:outline outline-blue-200 outline-2 rounded',
        className,
      )}
      to={withBaseurl(heading.path, baseurl)}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {`${heading.enumerator ? `${heading.enumerator} ` : ''}${
        heading.short_title || heading.title
      }`}
    </NavLink>
  );
}

const NestedToc = ({
  heading,
  open_urls_in_new_tab,
}: {
  heading: NestedHeading;
  open_urls_in_new_tab?: boolean;
}) => {
  const { pathname } = useLocation();
  const baseurl = useBaseurl();
  const startOpen = childrenOpen([heading], pathname, baseurl).includes(heading.id);
  const nav = useNavigation();
  const [open, setOpen] = React.useState(startOpen);
  useEffect(() => {
    if (nav.state === 'idle') setOpen(startOpen);
  }, [nav.state]);
  const exact = pathnameMatchesHeading(pathname, heading, baseurl);
  if (!heading.children || heading.children.length === 0) {
    return (
      <LinkItem
        className={classNames('p-2 my-1 rounded-lg', {
          'bg-blue-300/30': exact,
          'hover:bg-slate-300/30': !exact,
          'font-bold': heading.level === 'index',
        })}
        heading={heading}
        target={open_urls_in_new_tab ? '_blank' : '_self'}
      />
    );
  }
  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <div
        className={classNames(
          'flex flex-row w-full gap-2 px-2 my-1 text-left rounded-lg outline-none',
          {
            'bg-blue-300/30': exact,
            'hover:bg-slate-300/30': !exact,
          },
        )}
      >
        <LinkItem
          className={classNames('py-2 grow', {
            'font-semibold text-blue-800 dark:text-blue-200': startOpen,
            'cursor-pointer': !heading.path,
          })}
          heading={heading}
          onClick={() => setOpen(heading.path ? true : !open)}
        />
        <Collapsible.Trigger asChild>
          <button
            className="self-center flex-none rounded-md group hover:bg-slate-300/30 focus:outline outline-blue-200 outline-2"
            aria-label="Open Folder"
          >
            <ChevronRightIcon
              className="transition-transform duration-300 group-data-[state=open]:rotate-90 text-text-slate-700 dark:text-slate-100"
              height="1.5rem"
              width="1.5rem"
            />
          </button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content className="pl-3 pr-[2px] collapsible-content">
        {heading.children.map((item) => (
          <NestedToc heading={item} key={item.id} open_urls_in_new_tab={open_urls_in_new_tab} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
