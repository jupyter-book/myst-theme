import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useNavigation } from '@remix-run/react';
import {
  useNavOpen,
  useSiteManifest,
  useGridSystemProvider,
  useThemeTop,
  useIsWide,
} from '@myst-theme/providers';
import type { Heading } from '@myst-theme/common';
import { Toc } from './TableOfContentsItems.js';
import { ExternalOrInternalLink } from './Link.js';
import type { SiteManifest, SiteNavItem } from 'myst-config';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export function SidebarNavItem({ item }: { item: SiteNavItem }) {
  if (!item.children?.length) {
    return (
      <ExternalOrInternalLink
        nav
        to={item.url ?? ''}
        className={classNames(
          'p-2 my-1 rounded-lg',
          'hover:bg-slate-300/30',
          'block break-words focus:outline outline-blue-200 outline-2 rounded',
        )}
      >
        {item.title}
      </ExternalOrInternalLink>
    );
  }
  const [open, setOpen] = React.useState(false);
  return (
    <Collapsible.Root className="w-full" open={open} onOpenChange={setOpen}>
      <div
        className={classNames(
          'flex flex-row w-full gap-2 px-2 my-1 text-left rounded-lg outline-none',
          'hover:bg-slate-300/30',
        )}
      >
        <ExternalOrInternalLink
          nav
          to={item.url ?? ''}
          className={classNames('py-2 grow', {})}
          onClick={() => setOpen(!open)}
        >
          {item.title}
        </ExternalOrInternalLink>
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
        {item.children.map((action) => (
          <ExternalOrInternalLink
            nav
            key={action.url}
            to={action.url || ''}
            className={classNames(
              'p-2 my-1 rounded-lg',
              'hover:bg-slate-300/30',
              'block break-words focus:outline outline-blue-200 outline-2 rounded',
            )}
          >
            {action.title}
          </ExternalOrInternalLink>
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function SidebarNav({ nav }: { nav?: SiteManifest['nav'] }) {
  if (!nav) return null;
  return (
    <div className="w-full px-1 dark:text-white">
      {nav.map((item) => {
        return <SidebarNavItem key={'url' in item ? item.url : item.title} item={item} />;
      })}
    </div>
  );
}

export function useSidebarHeight<T extends HTMLElement = HTMLElement>(top = 0, inset = 0) {
  const container = useRef<T>(null);
  const toc = useRef<HTMLDivElement>(null);
  const transitionState = useNavigation().state;
  const wide = useIsWide();
  const setHeight = () => {
    if (!container.current || !toc.current) return;
    const height = container.current.offsetHeight - window.scrollY;
    const div = toc.current.firstChild as HTMLDivElement;
    if (div)
      div.style.height = wide
        ? `min(calc(100vh - ${top}px), ${height + inset}px)`
        : `calc(100vh - ${top}px)`;
    if (div) div.style.height = `min(calc(100vh - ${top}px), ${height + inset}px)`;
    const nav = toc.current.querySelector('nav');
    if (nav) nav.style.opacity = height > 150 ? '1' : '0';
  };
  useEffect(() => {
    setHeight();
    setTimeout(setHeight, 100); // Some lag sometimes
    const handleScroll = () => setHeight();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [container, toc, transitionState, wide]);
  return { container, toc };
}

export const PrimarySidebar = ({
  sidebarRef,
  nav,
  footer,
  headings,
  mobileOnly,
}: {
  sidebarRef?: React.RefObject<HTMLElement>;
  nav?: SiteManifest['nav'];
  headings?: Heading[];
  footer?: React.ReactNode;
  mobileOnly?: boolean;
}) => {
  const top = useThemeTop();
  const grid = useGridSystemProvider();
  const footerRef = useRef<HTMLDivElement>(null);
  const [open] = useNavOpen();
  const config = useSiteManifest();

  useEffect(() => {
    setTimeout(() => {
      if (!footerRef.current) return;
      footerRef.current.style.opacity = '1';
      footerRef.current.style.transform = 'none';
    }, 500);
  }, [footerRef]);
  if (!config) return null;

  return (
    <div
      ref={sidebarRef as any}
      className={classNames(
        'fixed',
        `xl:${grid}`, // for example, xl:article-grid
        'grid-gap xl:w-screen xl:pointer-events-none overflow-auto max-xl:min-w-[300px]',
        { hidden: !open, 'z-30': open, 'z-10': !open },
      )}
      style={{ top }}
    >
      <div
        className={classNames(
          'pointer-events-auto',
          'xl:col-margin-left flex-col',
          'overflow-hidden',
          {
            flex: open,
            'bg-white dark:bg-stone-900': open, // just apply when open, so that theme can transition
            'hidden xl:flex': !open && !mobileOnly,
            hidden: !open && mobileOnly,
            'lg:hidden': mobileOnly && !headings,
          },
        )}
      >
        <div className="flex-grow py-6 overflow-y-auto no-scrollbar">
          {nav && (
            <nav
              aria-label="Navigation"
              className="overflow-y-hidden transition-opacity ml-3 xl:ml-0 mr-3 max-w-[350px] lg:hidden"
            >
              <SidebarNav nav={nav} />
            </nav>
          )}
          {nav && headings && <div className="my-3 border-b-2 lg:hidden" />}
          {headings && (
            <nav
              aria-label="Table of Contents"
              className="flex-grow overflow-y-hidden transition-opacity ml-3 xl:ml-0 mr-3 max-w-[350px]"
            >
              <Toc headings={headings} />
            </nav>
          )}
        </div>
        {footer && (
          <div
            className="flex-none py-6 transition-all duration-700 translate-y-6 opacity-0"
            ref={footerRef}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
