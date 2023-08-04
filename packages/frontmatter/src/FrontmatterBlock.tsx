import React from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { SourceFileKind } from 'myst-spec-ext';
import {
  JupyterIcon,
  OrcidIcon,
  OpenAccessIcon,
  GithubIcon,
  EmailIcon,
  RorIcon,
  TwitterIcon,
} from '@scienceicons/react/24/solid';
import { LicenseBadges } from './licenses';
import { DownloadsDropdown } from './downloads';

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

export function Author({
  author,
  className,
}: {
  author: Required<PageFrontmatter>['authors'][0];
  className?: string;
}) {
  return (
    <span className={classNames('font-semibold text-sm', className)}>
      {author.name}
      {author.email && author.corresponding && (
        <a
          className="ml-1"
          href={`mailto:${author.email}`}
          title={`${author.name} <${author.email}>`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <EmailIcon className="w-4 h-4 inline-block text-gray-400 hover:text-blue-400 -translate-y-[0.1em]" />
        </a>
      )}
      {author.orcid && (
        <a
          className="ml-1"
          href={`https://orcid.org/${author.orcid}`}
          target="_blank"
          rel="noopener noreferrer"
          title="ORCID (Open Researcher and Contributor ID)"
        >
          <OrcidIcon className="w-4 h-4 inline-block text-gray-400 hover:text-[#A9C751] -translate-y-[0.1em]" />
        </a>
      )}
      {author.twitter && (
        <a
          className="ml-1"
          href={`https://twitter.com/${author.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Twitter: ${author.twitter}`}
        >
          <TwitterIcon className="w-4 h-4 inline-block text-gray-400 hover:text-[#1DA1F2] -translate-y-[0.1em]" />
        </a>
    </span>
  );
}

export function AuthorsList({ authors }: { authors: PageFrontmatter['authors'] }) {
  if (!authors || authors.length === 0) return null;
  return (
    <div>
      {authors.map((a, i) => (
        <span key={a.name}>
          <Author
            author={a}
            className={classNames('inline-block', {
              'text-comma': i < authors.length - 1,
            })}
          />
        </span>
      ))}
    </div>
  );
}

export function AuthorAndAffiliations({ authors }: { authors: PageFrontmatter['authors'] }) {
  if (!authors || authors.length === 0) return null;
  const hasAffliations = authors.reduce(
    (r, { affiliations: a }) => r || (!!a && a?.length > 0),
    false,
  );
  if (!hasAffliations) {
    return (
      <header className="mt-4 not-prose">
        <AuthorsList authors={authors} />
      </header>
    );
  }
  return (
    <header className="mt-4 not-prose">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
        {authors.length > 1 && (
          <>
            <div className="pb-2 text-xs font-thin uppercase">Authors</div>
            <div className="pb-2 text-xs font-thin uppercase">Affiliations</div>
          </>
        )}
        {authors.map((author) => (
          <React.Fragment key={author.name}>
            <div>
              <Author author={author} />
            </div>
            <div className="text-sm">
              {author.affiliations?.map((affil, i) => {
                if (typeof affil === 'string') {
                  return <div key={i}>{affil}</div>;
                }
                const { name, ror } = affil as unknown as {
                  name: string;
                  ror?: string;
                };
                if (ror) {
                  return (
                    <div key={i}>
                      {name}
                      <a
                        href={`https://ror.org/${ror}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="ROR (Research Organization Registry)"
                        className="text-inherit hover:text-inherit"
                      >
                        <RorIcon className="ml-2 inline-block h-[2em] w-[2em] grayscale hover:grayscale-0 -translate-y-[1px]" />
                      </a>
                    </div>
                  );
                }
                return <div key={i}>{name}</div>;
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </header>
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
  const dateString = new Date(date).toLocaleDateString('en-US', format);
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
      <TwitterIcon className="inline-block w-5 h-5 mr-1 opacity-60 hover:opacity-100" />
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
      <GithubIcon className="inline-block w-5 h-5 mr-1 opacity-60 hover:opacity-100" />
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
      <OpenAccessIcon className="w-5 h-5 mr-1 inline-block opacity-60 hover:opacity-100 hover:text-[#E18435]" />
    </a>
  );
}

export function Journal({
  venue,
  biblio,
}: {
  venue?: Required<PageFrontmatter>['venue'];
  biblio?: Required<PageFrontmatter>['biblio'];
}) {
  if (!venue) return null;
  const { title, url } = typeof venue === 'string' ? { title: venue, url: null } : venue;
  if (!title) return null;
  const { volume, issue } = biblio ?? {};
  return (
    <div className="flex-none mr-2">
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
    date,
    authors,
  } = frontmatter;
  const isJupyter = kind === SourceFileKind.Notebook;
  const hasExports = exports && exports.length > 0;
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
    <div className={classNames(className)}>
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
                  <JupyterIcon className="inline-block w-5 h-5" />
                </div>
              )}
            </>
          )}
          {!hideExports && <DownloadsDropdown exports={exports as any} />}
        </div>
      )}
      {title && <h1 className="mb-0">{title}</h1>}
      {subtitle && <p className="mt-2 mb-0 lead text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
      {hasAuthors && authorStyle === 'list' && <AuthorsList authors={frontmatter.authors} />}
      {hasAuthors && authorStyle === 'block' && (
        <AuthorAndAffiliations authors={frontmatter.authors} />
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
