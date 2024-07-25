import React from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { SourceFileKind } from 'myst-spec-ext';
import { JupyterIcon, OpenAccessIcon, GithubIcon, TwitterIcon } from '@scienceicons/react/24/solid';
import { LicenseBadges } from './licenses.js';
import { DownloadsDropdown } from './downloads.js';
import { AuthorAndAffiliations, AuthorsList } from './Authors.js';

function ExternalOrInternalLink({
  to,
  className,
  title,
  children,
}: {
  to: string;
  className?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={to} className={className} title={title}>
      {children}
    </a>
  );
}

export function DoiText({ doi: possibleLink, className }: { doi?: string; className?: string }) {
  if (!possibleLink) return null;
  const doi = possibleLink.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');
  const url = `https://doi.org/${doi}`;
  return (
    <a
      className={classNames('no-underline text-inherit hover:text-inherit', className)}
      target="_blank"
      rel="noopener noreferrer"
      href={url}
      title="DOI (Digital Object Identifier)"
    >
      {url}
    </a>
  );
}

export function DoiBadge({ doi: possibleLink, className }: { doi?: string; className?: string }) {
  if (!possibleLink) return null;
  const doi = possibleLink.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//, '');
  const url = `https://doi.org/${doi}`;
  return (
    <div className={classNames('flex-none', className)} title="DOI (Digital Object Identifier)">
      <a
        className="font-light no-underline hover:font-light hover:underline text-inherit hover:text-inherit"
        target="_blank"
        rel="noopener noreferrer"
        href={url}
      >
        {url}
      </a>
    </div>
  );
}

export function DateString({
  date,
  format = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  spacer,
}: {
  date?: string;
  format?: Intl.DateTimeFormatOptions;
  spacer?: boolean;
}) {
  if (!date) return null;
  const d = new Date(date); // This is in the users timezone
  const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dateString = utcDate.toLocaleDateString('en-US', format);
  return (
    <time dateTime={date} className={classNames({ 'text-spacer': spacer })}>
      {dateString}
    </time>
  );
}

export function TwitterLink({ twitter: possibleLink }: { twitter?: string }) {
  if (!possibleLink) return null;
  const twitter = possibleLink.replace(/^(https?:\/\/)?twitter\.com\//, '');
  return (
    <a
      href={`https://twitter.com/${twitter}`}
      title={`Twitter: ${twitter}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-inherit hover:text-inherit"
    >
      <TwitterIcon
        width="1.25rem"
        height="1.25rem"
        className="inline-block mr-1 opacity-60 hover:opacity-100"
      />
    </a>
  );
}

export function GitHubLink({ github: possibleLink }: { github?: string }) {
  if (!possibleLink) return null;
  const github = possibleLink.replace(/^(https?:\/\/)?github\.com\//, '');
  return (
    <a
      href={`https://github.com/${github}`}
      title={`GitHub Repository: ${github}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-inherit hover:text-inherit"
    >
      <GithubIcon
        width="1.25rem"
        height="1.25rem"
        className="inline-block mr-1 opacity-60 hover:opacity-100"
      />
    </a>
  );
}

export function OpenAccessBadge({ open_access }: { open_access?: boolean }) {
  if (!open_access) return null;
  return (
    <a
      href="https://en.wikipedia.org/wiki/Open_access"
      target="_blank"
      rel="noopener noreferrer"
      title="Open Access"
      className="text-inherit hover:text-inherit"
    >
      <OpenAccessIcon
        width="1.25rem"
        height="1.25rem"
        className="mr-1 inline-block opacity-60 hover:opacity-100 hover:text-[#E18435]"
      />
    </a>
  );
}

export function Journal({
  venue,
  biblio,
  className,
}: {
  venue?: Required<PageFrontmatter>['venue'];
  biblio?: Required<PageFrontmatter>['biblio'];
  className?: string;
}) {
  if (!venue) return null;
  const { title, url } = typeof venue === 'string' ? { title: venue, url: null } : venue;
  if (!title) return null;
  const { volume, issue } = biblio ?? {};
  return (
    <div className={classNames('flex-none mr-2', className)}>
      {url ? (
        <ExternalOrInternalLink
          className="font-semibold no-underline smallcaps"
          to={url}
          title={title}
        >
          {title}
        </ExternalOrInternalLink>
      ) : (
        <span className="font-semibold smallcaps">{title}</span>
      )}
      {volume != null && (
        <span className="pl-2 ml-2 border-l">
          Volume {volume}
          {issue != null && <>, Issue {issue}</>}
        </span>
      )}
    </div>
  );
}

export function FrontmatterBlock({
  frontmatter,
  kind = SourceFileKind.Article,
  authorStyle = 'block',
  hideBadges,
  hideExports,
  className,
}: {
  frontmatter: PageFrontmatter;
  kind?: SourceFileKind;
  authorStyle?: 'block' | 'list';
  hideBadges?: boolean;
  hideExports?: boolean;
  className?: string;
}) {
  if (!frontmatter) return null;
  const {
    title,
    subtitle,
    subject,
    doi,
    open_access,
    license,
    github,
    venue,
    biblio,
    exports,
    downloads,
    date,
    authors,
  } = frontmatter;
  const isJupyter = kind === SourceFileKind.Notebook;
  const hasExports = downloads ? downloads.length > 0 : exports && exports.length > 0;
  const hasAuthors = authors && authors.length > 0;
  const hasBadges = !!open_access || !!license || !!hasExports || !!isJupyter || !!github;
  const hasHeaders = !!subject || !!venue || !!biblio;
  const hasDateOrDoi = !!doi || !!date;
  const showHeaderBlock = hasHeaders || (hasBadges && !hideBadges) || (hasExports && !hideExports);
  if (!title && !subtitle && !showHeaderBlock && !hasAuthors && !hasDateOrDoi) {
    // Nothing to show!
    return null;
  }
  return (
    <div
      id="skip-to-frontmatter"
      aria-label="article frontmatter"
      className={classNames(className)}
    >
      {showHeaderBlock && (
        <div className="flex items-center h-6 mt-3 mb-5 text-sm font-light">
          {subject && (
            <div
              className={classNames('flex-none pr-2 smallcaps', {
                'border-r mr-2': venue,
              })}
            >
              {subject}
            </div>
          )}
          <Journal venue={venue} biblio={biblio} />
          <div className="flex-grow"></div>
          {!hideBadges && (
            <>
              <LicenseBadges license={license} />
              <OpenAccessBadge open_access={open_access} />
              <GitHubLink github={github} />
              {isJupyter && (
                <div className="inline-block mr-1">
                  <JupyterIcon
                    width="1.25rem"
                    height="1.25rem"
                    className="inline-block"
                    title="Jupyter Notebook"
                  />
                </div>
              )}
            </>
          )}
          {!hideExports && <DownloadsDropdown exports={(downloads ?? exports) as any} />}
        </div>
      )}
      {title && <h1 className="mb-0">{title}</h1>}
      {subtitle && <p className="mt-2 mb-0 lead text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
      {hasAuthors && authorStyle === 'list' && (
        <AuthorsList authors={frontmatter.authors} affiliations={frontmatter.affiliations} />
      )}
      {hasAuthors && authorStyle === 'block' && (
        <AuthorAndAffiliations
          authors={frontmatter.authors}
          affiliations={frontmatter.affiliations}
        />
      )}
      {hasDateOrDoi && (
        <div className="flex mt-2 text-sm font-light">
          <DateString date={date} spacer={!!doi} />
          <DoiBadge doi={doi} />
        </div>
      )}
    </div>
  );
}
