import React from 'react';
import classNames from 'classnames';
import { NavLink, useParams, useLocation } from '@remix-run/react';
import type { SiteManifest } from 'myst-config';
import { useNavOpen, useSiteManifest, useUrlbase, withUrlbase } from '@myst-theme/providers';
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
  const exact = pathname === path;
  const urlbase = useUrlbase();
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
            !isActive,
        })
      }
      to={withUrlbase(path, urlbase)}
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
                <h5 className="mb-3 lg:mt-8 font-semibold break-words dark:text-white">
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

export const TableOfContents = ({
  projectSlug,
  top,
  height,
  footer,
}: {
  top?: number;
  height?: number;
  projectSlug?: string;
  footer?: React.ReactNode;
}) => {
  const [open] = useNavOpen();
  const config = useSiteManifest();
  const { folder, project } = useParams();
  const resolvedProjectSlug = projectSlug || (folder ?? project);
  if (!config) return null;
  const headings = getProjectHeadings(config, resolvedProjectSlug, {
    addGroups: false,
  });
  if (!headings) return null;
  return (
    <div
      className="fixed xl:article-grid article-grid-gap xl:w-screen z-30 xl:pointer-events-none overflow-auto max-xl:min-w-[300px]"
      style={{
        top: top ?? 0,
        height: `min(calc(100vh - ${top ?? 0}px), ${height}px)`,
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
          className="flex-grow overflow-y-auto transition-opacity mt-6 mb-3 ml-3 xl:ml-0 mr-3"
          style={{ opacity: height && height > 150 ? undefined : 0 }}
        >
          <Headings folder={resolvedProjectSlug} headings={headings} sections={config?.projects} />
        </nav>
        {footer && <div className="flex-none py-4">{footer}</div>}
      </div>
    </div>
  );
};
