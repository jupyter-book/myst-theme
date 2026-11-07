import React, { useEffect } from 'react';
import classNames from 'classnames';
import * as Collapsible from '@radix-ui/react-collapsible';
import type { Heading } from '@myst-theme/common';
import {
  isExternalUrl,
  useBaseurl,
  useIsStaticBuild,
  useLinkProvider,
  useNavLinkProvider,
  useNavOpen,
  useSiteManifest,
} from '@myst-theme/providers';
import { useLocation, useNavigation } from 'react-router';
import { createHtmlId } from 'myst-common';
import { ChevronRightIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

type NestedHeading = Heading & {
  key: string;
  children: NestedHeading[];
  /** For title-only entries: the `toc` query parameter that selects the entry */
  tocId?: string;
  /** For title-only entries: path of the nearest ancestor page */
  tocParentPath?: string;
};

function nestToc(toc: Heading[]): NestedHeading[] {
  const items: NestedHeading[] = [];
  const stack: (Omit<NestedHeading, 'level'> & { level: number })[] = [];
  const tocIds = new Set<string>();
  let indexPath: string | undefined;

  toc.forEach((tocItem, index) => {
    const item = { ...tocItem, key: String(index), children: [] } as NestedHeading;
    if (item.level === 'index') {
      while (stack.length) stack.pop();
      indexPath = item.path;
      items.push(item);
      return;
    }
    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    if (!item.path && !item.url) {
      const base = item.id ?? createHtmlId(item.title);
      let tocId = base;
      for (let n = 1; tocId && tocIds.has(tocId); n++) tocId = `${base}-${n}`;
      if (tocId) {
        tocIds.add(tocId);
        item.tocId = tocId;
        item.tocParentPath = [...stack].reverse().find((h) => h.path)?.path ?? indexPath;
      }
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

function pathnameMatchesPath(pathname: string, path: string | undefined, baseurl?: string) {
  // Normalize `pathname` to be comparable to the unprefixed `path`.
  //
  // During SSR in `myst build --html` static builds, `useLocation().pathname`
  // does not include the site's `baseurl`; on the client it does (Remix does
  // not strip the basename here).
  //
  // Also strip any trailing slash, since static builds end up with one and
  // `path` needs to be without.
  let normed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (baseurl && normed.startsWith(baseurl)) normed = normed.slice(baseurl.length);
  if (normed && path === `${normed}/index`) return true;
  return path === normed;
}

function findTocEntry(
  headings: NestedHeading[],
  match: (heading: NestedHeading) => boolean,
): NestedHeading | undefined {
  for (const heading of headings) {
    if (match(heading)) return heading;
    const found = findTocEntry(heading.children, match);
    if (found) return found;
  }
}

/** Keys of the current entry and its ancestors */
function childrenOpen(
  headings: NestedHeading[],
  isCurrent: (heading: NestedHeading) => boolean,
): string[] {
  return headings
    .map((heading) => {
      if (isCurrent(heading)) return [heading.key];
      const open = childrenOpen(heading.children, isCurrent);
      if (open.length === 0) return [];
      return [heading.key, ...open];
    })
    .flat();
}

/**
 * The `toc` query parameter of the URL.
 * Static builds pre-render without a query, so the parameter applies after hydration.
 */
function useTocParam(): string | null {
  const { search } = useLocation();
  const isStaticBuild = useIsStaticBuild();
  const [hydrated, setHydrated] = React.useState(!isStaticBuild);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;
  return new URLSearchParams(search).get('toc');
}

export const Toc = ({ headings }: { headings: Heading[] }) => {
  const nested = nestToc(headings);
  const { pathname } = useLocation();
  const baseurl = useBaseurl();
  const tocParam = useTocParam();
  // A title-only entry is current when the URL has its parent path and its `toc` parameter
  const currentGroup = tocParam
    ? findTocEntry(
        nested,
        (h) =>
          h.tocId === tocParam &&
          // The normalized pathname of the site root is empty
          pathnameMatchesPath(pathname, h.tocParentPath === '/' ? '' : h.tocParentPath, baseurl),
      )
    : undefined;
  return (
    <div className="myst-toc w-full px-1 text-myst-text">
      {nested.map((item) => (
        <NestedToc heading={item} key={item.key} currentGroupKey={currentGroup?.key} />
      ))}
    </div>
  );
};

function LinkItem({
  className,
  heading,
  current,
  onClick,
}: {
  className?: string;
  heading: NestedHeading;
  current?: boolean;
  onClick?: () => void;
}) {
  const Link = useLinkProvider();
  const NavLink = useNavLinkProvider();
  const [, setOpen] = useNavOpen();
  // Render external URL
  const config = useSiteManifest();
  // In case the URL part of our "treat as internal" domain list
  const treatAsInternal = !isExternalUrl(heading.url, config?.options?.internal_domains);
  if (heading.url) {
    const target = heading.open_in_same_tab || treatAsInternal ? '_self' : '_blank';
    return (
      <Link
        title={`${heading.enumerator ? `${heading.enumerator} ` : ''}${heading.title}`}
        className={classNames(
          'myst-toc-heading block break-words focus:outline outline-myst-focus-outline outline-2 rounded',
          className,
        )}
        to={heading.url}
        onClick={() => {
          onClick?.();
          setOpen(false);
        }}
        target={target}
      >
        <span className="inline align-middle">
          {`${heading.enumerator ? `${heading.enumerator} ` : ''}${heading.title}`}
        </span>
        {!treatAsInternal && (
          <ArrowTopRightOnSquareIcon className="inline h-4 w-4 align-middle ml-[0.2rem]" />
        )}
      </Link>
    );
  }
  if (!heading.path && heading.tocParentPath !== undefined) {
    const label = `${heading.enumerator ? `${heading.enumerator} ` : ''}${
      heading.short_title || heading.title
    }`;
    return (
      <Link
        title={`${heading.enumerator ? `${heading.enumerator} ` : ''}${heading.title}`}
        className={classNames(
          'block break-words focus:outline outline-myst-focus-outline outline-2 rounded',
          className,
        )}
        to={`${heading.tocParentPath}?toc=${encodeURIComponent(heading.tocId!)}`}
        aria-current={current ? 'page' : undefined}
        onClick={() => {
          onClick?.();
          setOpen(false);
        }}
      >
        {label}
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
        'block break-words focus:outline outline-myst-focus-outline outline-2 rounded',
        className,
      )}
      to={heading.path}
      // NavLink matches the pathname only, so `current` overrides it when a title-only entry is current
      aria-current={current === undefined ? undefined : current ? 'page' : false}
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
  currentGroupKey,
}: {
  heading: NestedHeading;
  currentGroupKey?: string;
}) => {
  const { pathname } = useLocation();
  const baseurl = useBaseurl();
  const isStaticBuild = useIsStaticBuild();
  const isCurrent = (h: NestedHeading) =>
    currentGroupKey ? h.key === currentGroupKey : pathnameMatchesPath(pathname, h.path, baseurl);
  const startOpen = childrenOpen([heading], isCurrent).includes(heading.key);
  const nav = useNavigation();
  const [open, setOpen] = React.useState(startOpen || !!heading.open);
  useEffect(() => {
    // On pathname update, derive open state
    // We don't need heading and baseurl in dependencies, since they're fixed
    if (nav.state !== 'idle') return;
    // Entries marked `open` keep the reader's expand/collapse choice across navigation
    const active = childrenOpen([heading], isCurrent).includes(heading.key);
    setOpen((prev) => active || (!!heading.open && prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.state, pathname, currentGroupKey]);
  const exact = isCurrent(heading);
  const current = currentGroupKey ? exact : undefined;
  if (!heading.children || heading.children.length === 0) {
    return (
      <LinkItem
        className={classNames('myst-toc-item p-2 my-1 rounded-lg', {
          'myst-toc-item-exact bg-myst-active-bg': exact,
          'hover:bg-myst-surface': !exact,
          'font-bold': heading.level === 'index',
        })}
        heading={heading}
        current={current}
      />
    );
  }
  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <div
        className={classNames(
          'myst-toc-item flex flex-row w-full gap-2 pl-2 my-1 text-left rounded-lg outline-none',
          {
            'myst-toc-item-exact bg-myst-active-bg': exact,
            'hover:bg-myst-surface': !exact,
          },
        )}
      >
        <LinkItem
          className={classNames('py-2 grow', {
            'font-semibold text-myst-accent-text': startOpen,
            'cursor-pointer': !heading.path,
          })}
          heading={heading}
          current={current}
          onClick={() => {
            if (heading.path || heading.tocParentPath !== undefined) {
              // Clicking a header with its own page navigates away.
              // We don't want to animate before doing so, since after the reload there will be an animation anyway.
              // So, only perform the open for non-static build.
              if (!isStaticBuild) setOpen(true);
              return;
            }
            setOpen(!open);
          }}
        />
        <Collapsible.Trigger asChild>
          <button
            className="self-stretch flex items-center flex-none px-1 rounded-l-md group hover:bg-myst-surface focus-visible:outline outline-myst-focus-outline outline-2"
            aria-label="Open Folder"
          >
            <ChevronRightIcon
              className="transition-transform duration-300 group-data-[state=open]:rotate-90 text-myst-text-secondary"
              height="1.5rem"
              width="1.5rem"
            />
          </button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content
        className="pl-3 pr-[2px] collapsible-content"
        style={isStaticBuild ? { animation: 'none' } : undefined}
      >
        {heading.children.map((item) => (
          <NestedToc heading={item} key={item.key} currentGroupKey={currentGroupKey} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
