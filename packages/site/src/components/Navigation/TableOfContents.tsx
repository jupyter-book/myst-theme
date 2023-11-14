import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useNavigation } from '@remix-run/react';
import {
  useNavOpen,
  useSiteManifest,
  useGridSystemProvider,
  useThemeTop,
} from '@myst-theme/providers';
import { getProjectHeadings } from '@myst-theme/common';
import { Toc } from './TableOfContentsItems.js';

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
  tocRef,
  footer,
}: {
  tocRef?: React.RefObject<HTMLElement>;
  projectSlug?: string;
  footer?: React.ReactNode;
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
  const headings = getProjectHeadings(config, projectSlug, {
    addGroups: false,
  });
  if (!headings) return null;
  return (
    <div
      ref={tocRef as any}
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
          <Toc headings={headings} />
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

export const InlineTableOfContents = ({
  projectSlug,
  tocRef,
  className = 'flex-grow overflow-y-auto max-w-[350px]',
}: {
  projectSlug?: string;
  className?: string;
  tocRef?: React.RefObject<HTMLElement>;
}) => {
  const config = useSiteManifest();
  if (!config) return null;
  const headings = getProjectHeadings(config, projectSlug, {
    addGroups: false,
  });
  if (!headings) return null;
  return (
    <nav aria-label="Table of Contents" className={className} ref={tocRef}>
      <Toc headings={headings} />
    </nav>
  );
};
