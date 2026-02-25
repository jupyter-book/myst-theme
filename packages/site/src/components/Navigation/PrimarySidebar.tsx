import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useNavigation } from '@remix-run/react';
import {
  useNavOpen,
  useSiteManifest,
  useGridSystemProvider,
  useThemeTop,
  useIsWide,
  useBaseurl,
  withBaseurl,
  useBannerState,
} from '@myst-theme/providers';
import type { Heading } from '@myst-theme/common';
import { Toc } from './TableOfContentsItems.js';
import { ExternalOrInternalLink } from './Link.js';
import type { SiteManifest, SiteNavItem } from 'myst-config';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export function SidebarNavItem({ item }: { item: SiteNavItem }) {
  const baseurl = useBaseurl();
  if (!item.children?.length) {
    return (
      <ExternalOrInternalLink
        nav
        to={withBaseurl(item.url, baseurl) ?? ''}
        className={classNames(
          'myst-primary-sidebar-item-short',
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
          'myst-primary-sidebar-item',
          'flex flex-row w-full gap-2 px-2 my-1 text-left rounded-lg outline-none',
          'hover:bg-slate-300/30',
        )}
      >
        <ExternalOrInternalLink
          nav
          to={withBaseurl(item.url, baseurl) ?? ''}
          className={classNames('myst-primary-sidebar-item-title py-2 grow', {})}
          onClick={() => setOpen(!open)}
        >
          {item.title}
        </ExternalOrInternalLink>
        <Collapsible.Trigger asChild>
          <button
            className="myst-primary-sidebar-item-child self-center flex-none rounded-md group hover:bg-slate-300/30 focus:outline outline-blue-200 outline-2"
            aria-label="Open Folder"
          >
            <ChevronRightIcon
              className="myst-primary-sidebar-item-icon transition-transform duration-300 group-data-[state=open]:rotate-90 text-text-slate-700 dark:text-slate-100"
              height="1.5rem"
              width="1.5rem"
            />
          </button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content className="myst-primary-sidebar-item-content pl-3 pr-[2px] collapsible-content">
        {item.children.map((action) => (
          <ExternalOrInternalLink
            nav
            key={action.url}
            to={withBaseurl(action.url, baseurl) || ''}
            className={classNames(
              'myst-primary-sidebar-item-link',
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
    <div className="w-full px-1 dark:text-white font-medium">
      {nav.map((item) => {
        return <SidebarNavItem key={'url' in item ? item.url : item.title} item={item} />;
      })}
    </div>
  );
}

/**
 * Manages the sidebar's position and height on scroll.
 *
 * On wide screen, the sidebar is position:fixed and needs JS to
 *  grow/shrink/move based on other elements as we scroll
 *
 * On non-wide, the sidebar is a full-screen overlay — CSS handles everything.
 */
export function useSidebarHeight<T extends HTMLElement = HTMLElement>(top = 0, inset = 0) {
  const container = useRef<T>(null);
  const toc = useRef<HTMLDivElement>(null);
  const transitionState = useNavigation().state;
  const wide = useIsWide();
  const { bannerState } = useBannerState();
  const setHeight = () => {
    if (!container.current || !toc.current) return;
    const div = toc.current.firstChild as HTMLDivElement;
    const nav = toc.current.querySelector('nav');
    if (!wide) {
      // On mobile, clear any stale inline styles so CSS can handle sizing.
      if (div) div.style.height = '';
      if (nav) nav.style.opacity = '';
      return;
    }
    // As the banner scrolls out of view, slide the sidebar up to stay
    // just below the sticky TopNav.
    const effectiveBannerHeight = Math.max(0, bannerState.height - window.scrollY);
    const effectiveTop = top + effectiveBannerHeight;
    toc.current.style.top = `${effectiveTop}px`;
    // Sidebar height: fill the viewport but don't extend past the article.
    const height = Math.max(0, container.current.offsetHeight - window.scrollY);
    if (div) div.style.height = `min(calc(100vh - ${effectiveTop}px), ${height + inset}px)`;
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
  }, [container, toc, transitionState, wide, top, bannerState.height]);
  return { container, toc };
}

export const PrimarySidebar = ({
  sidebarRef,
  nav,
  footer,
  headings,
  hide_toc,
  mobileOnly,
}: {
  sidebarRef?: React.RefObject<HTMLElement>;
  nav?: SiteManifest['nav'];
  headings?: Heading[];
  footer?: React.ReactNode;
  hide_toc?: boolean;
  mobileOnly?: boolean;
}) => {
  const top = useThemeTop();
  const { bannerState } = useBannerState();
  const grid = useGridSystemProvider();
  const footerRef = useRef<HTMLDivElement>(null);
  const [open] = useNavOpen();
  const config = useSiteManifest();
  // Applies layout and whitespacing to a few sidebar sections
  const sidebarSectionInsetClass = 'ml-3 xl:ml-0 mr-3 max-w-[350px]';

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
        'myst-primary-sidebar',
        'fixed',
        `xl:${grid}`, // for example, xl:article-grid
        // Base sidebar layout and scrolling behavior
        'grid-gap xl:w-full xl:pointer-events-none overflow-auto',
        // Mobile modal behavior: cap width, pin to top, and fill viewport height
        'max-xl:w-[75vw] max-xl:max-w-[350px] max-xl:!top-0 max-xl:h-screen',
        { 'lg:hidden': nav && hide_toc },
        // raise sidebar above content when open
        { hidden: !open, 'max-xl:z-40 xl:z-30': open, 'z-10': !open },
      )}
      style={{ top: top + bannerState.height }}
    >
      <div
        className={classNames(
          'myst-primary-sidebar-pointer',
          'pointer-events-auto',
          'xl:col-margin-left flex-col',
          'overflow-hidden max-xl:h-full',
          {
            flex: open,
            'bg-white dark:bg-stone-900': open, // just apply when open, so that theme can transition
            'hidden xl:flex': !open && !mobileOnly,
            hidden: !open && mobileOnly,
            'lg:hidden': mobileOnly && !headings,
          },
        )}
      >
        <div className="myst-primary-sidebar-nav flex-grow py-6 overflow-y-auto primary-scrollbar">
          {nav && (
            <nav
              aria-label="Navigation"
              className={classNames(
                'myst-primary-sidebar-topnav overflow-y-hidden transition-opacity lg:hidden',
                sidebarSectionInsetClass,
              )}
            >
              <SidebarNav nav={nav} />
            </nav>
          )}
          {nav && headings && <div className="my-3 border-b-2 lg:hidden" />}
          {headings && (
            <nav
              aria-label="Table of Contents"
              className={classNames(
                'myst-primary-sidebar-toc flex-grow overflow-y-hidden transition-opacity',
                sidebarSectionInsetClass,
              )}
            >
              <Toc headings={headings} />
            </nav>
          )}
        </div>
        {footer && (
          <div
            className={classNames(
              'myst-primary-sidebar-footer flex-none py-6 transition-all duration-700 translate-y-6 opacity-0',
              sidebarSectionInsetClass,
            )}
            ref={footerRef}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
