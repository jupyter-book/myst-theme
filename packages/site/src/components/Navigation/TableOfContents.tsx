import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useLocation, useNavigation } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import {
  useNavLinkProvider,
  useNavOpen,
  useSiteManifest,
  useBaseurl,
  withBaseurl,
} from '@myst-theme/providers';
import { getProjectHeadings } from '../../loaders';
import type { Heading } from '../../types';

type Props = {
  folder?: string;
  headings: Heading[];
  sections?: ManifestProject[];
};

type ManifestProject = Required<SiteManifest>['projects'][0];

const HeadingLink = ({
  path,
  isIndex,
  title,
  children,
}: {
  path: string;
  isIndex?: boolean;
  title?: string;
  children: React.ReactNode;
}) => {
  const { pathname } = useLocation();
  const NavLink = useNavLinkProvider();
  const exact = pathname === path;
  const baseurl = useBaseurl();
  const [, setOpen] = useNavOpen();
  return (
    <NavLink
      prefetch="intent"
      title={title}
      className={({ isActive }: { isActive: boolean }) =>
        classNames('block break-words', {
          'mb-8 lg:mb-3 font-semibold': isIndex,
          'text-slate-900 dark:text-slate-200': isIndex && !exact,
          'text-blue-500 dark:text-blue-400': isIndex && exact,
          'border-l pl-4 text-blue-500 border-current dark:text-blue-400': !isIndex && isActive,
          'font-semibold': isActive,
          'border-l pl-4 border-transparent hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300':
            !isIndex && !isActive,
        })
      }
      to={withBaseurl(path, baseurl)}
      suppressHydrationWarning // The pathname is not defined on the server always.
      onClick={() => {
        // Close the nav panel if it is open
        setOpen(false);
      }}
    >
      {children}
    </NavLink>
  );
};

const HEADING_CLASSES = 'text-slate-900 leading-5 dark:text-slate-100';
const Headings = ({ folder, headings, sections }: Props) => {
  const secs = sections || [];
  return (
    <ul className="space-y-6 lg:space-y-2">
      {secs.map((sec) => {
        if (sec.slug === folder) {
          return headings.map((heading, index) => (
            <li
              key={heading.slug || index}
              className={classNames('', {
                [HEADING_CLASSES]: heading.level === 'index',
                'font-semibold': heading.level === 'index',
                // 'pl-4': heading.level === 2,
                // 'pl-6': heading.level === 3,
                // 'pl-8': heading.level === 4,
                // 'pl-10': heading.level === 5,
                // 'pl-12': heading.level === 6,
              })}
            >
              {heading.path ? (
                <HeadingLink
                  title={heading.title}
                  path={heading.path}
                  isIndex={heading.level === 'index'}
                >
                  {heading.short_title || heading.title}
                </HeadingLink>
              ) : (
                <h5 className="mb-3 font-semibold break-words lg:mt-8 dark:text-white">
                  {heading.short_title || heading.title}
                </h5>
              )}
            </li>
          ));
        }
        return (
          <li key={sec.slug} className={classNames('p-1 my-2 lg:hidden', HEADING_CLASSES)}>
            <HeadingLink path={`/${sec.slug}`}>{sec.short_title || sec.title}</HeadingLink>
          </li>
        );
      })}
    </ul>
  );
};

export function useTocHeight<T extends HTMLElement = HTMLElement>(top = 0, inset = 0) {
  const container = useRef<T>(null);
  const toc = useRef<HTMLDivElement>(null);
  const transitionState = useNavigation().state;
  const setHeight = () => {
    if (!container.current || !toc.current) return;
    const height = container.current.offsetHeight - window.scrollY;
    const div = toc.current.firstChild as HTMLDivElement;
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
  }, [container, toc, transitionState]);
  return { container, toc };
}

export const TableOfContents = ({
  projectSlug,
  top,
  tocRef,
  footer,
}: {
  top?: number;
  tocRef?: React.RefObject<HTMLDivElement>;
  projectSlug?: string;
  footer?: React.ReactNode;
}) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [open] = useNavOpen();
  const config = useSiteManifest();
  if (!config) return null;
  const headings = getProjectHeadings(config, projectSlug, {
    addGroups: false,
  });
  useEffect(() => {
    setTimeout(() => {
      if (!footerRef.current) return;
      footerRef.current.style.opacity = '1';
      footerRef.current.style.transform = 'none';
    }, 500);
  }, [footerRef]);
  if (!headings) return null;
  return (
    <div
      ref={tocRef}
      className={classNames(
        'fixed xl:article-grid article-grid-gap xl:w-screen xl:pointer-events-none overflow-auto max-xl:min-w-[300px] z-20',
        { hidden: !open },
      )}
      style={{
        top: top ?? 0,
      }}
    >
      <div
        className={classNames(
          'pointer-events-auto',
          'xl:col-margin-left flex-col',
          'overflow-hidden',
          // 'border-r border-stone-200 dark:border-stone-700',
          {
            flex: open,
            'bg-white dark:bg-stone-900': open, // just apply when open, so that theme can transition
            'hidden xl:flex': !open,
          },
        )}
      >
        <nav
          aria-label="Table of Contents"
          className="flex-grow overflow-y-auto transition-opacity mt-6 pb-3 ml-3 xl:ml-0 mr-3 max-w-[350px]"
        >
          <Headings folder={projectSlug} headings={headings} sections={config?.projects} />
        </nav>
        {footer && (
          <div
            className="flex-none py-4 transition-all duration-700 translate-y-6 opacity-0"
            ref={footerRef}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
