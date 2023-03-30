import React from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { SourceFileKind } from 'myst-common';
import {
  JupyterIcon,
  OrcidIcon,
  OpenAccessIcon,
  GithubIcon,
  EmailIcon,
  RorIcon,
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
      <header className="not-prose mb-2">
        {authors.length > 1 && <div className="font-thin text-xs uppercase pb-2">Authors</div>}
        {authors.map((author) => (
          <Author key={author.name} author={author} />
        ))}
      </header>
    );
  }
  return (
    <header className="not-prose mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
        {authors.length > 1 && (
          <>
            <div className="font-thin text-xs uppercase pb-2">Authors</div>
            <div className="font-thin text-xs uppercase pb-2">Affiliations</div>
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
        className="font-light hover:font-light no-underline text-inherit hover:text-inherit"
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
      <GithubIcon className="w-5 h-5 mr-1 inline-block opacity-60 hover:opacity-100" />
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
          className="smallcaps font-semibold no-underline"
          to={url}
          title={title}
        >
          {title}
        </ExternalOrInternalLink>
      ) : (
        <span className="smallcaps font-semibold">{title}</span>
      )}
      {volume != null && (
        <span className="ml-2 pl-2 border-l">
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
}: {
  frontmatter: PageFrontmatter;
  kind?: SourceFileKind;
  authorStyle?: 'block' | 'list';
}) {
  const { subject, doi, open_access, license, github, venue, biblio, exports, date } = frontmatter;
  const isJupyter = kind === SourceFileKind.Notebook;
  const hasExports = exports && exports.length > 0;
  const hasHeaders =
    subject || github || venue || biblio || open_access || license || hasExports || isJupyter;
  const hasDateOrDoi = doi || date;
  return (
    <>
      {hasHeaders && (
        <div className="flex mt-3 mb-5 text-sm font-light">
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
          <LicenseBadges license={license} />
          <OpenAccessBadge open_access={open_access} />
          <GitHubLink github={github} />
          {isJupyter && (
            <span>
              <JupyterIcon className="h-5 w-5 inline-block" />
            </span>
          )}
          <DownloadsDropdown exports={exports as any} />
        </div>
      )}
      {frontmatter.title && (
        <h1 className={classNames({ 'mb-2': frontmatter.subtitle })}>{frontmatter.title}</h1>
      )}
      {frontmatter.subtitle && (
        <p className="lead mt-0 text-zinc-600 dark:text-zinc-400">{frontmatter.subtitle}</p>
      )}
      {authorStyle === 'list' && <AuthorsList authors={frontmatter.authors} />}
      {authorStyle === 'block' && <AuthorAndAffiliations authors={frontmatter.authors} />}
      {hasDateOrDoi && (
        <div className="flex my-2 text-sm font-light">
          <DateString date={date} spacer={!!doi} />
          <DoiBadge doi={doi} />
        </div>
      )}
    </>
  );
}
