import React, { useMemo, useCallback } from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { SourceFileKind } from 'myst-spec-ext';
import { JupyterIcon, OpenAccessIcon, GithubIcon, TwitterIcon } from '@scienceicons/react/24/solid';
import { LicenseBadges } from './licenses.js';
import { DownloadsDropdown } from './downloads.js';
import { AuthorAndAffiliations, AuthorsList } from './Authors.js';
import * as Popover from '@radix-ui/react-popover';
import { RocketIcon, Cross2Icon } from '@radix-ui/react-icons';

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
  // Parse the date
  // As this is a YYYY-MM-DD form, the parser interprets this as a UTC date
  // (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date)
  const utcDate = new Date(date);

  // Now cast our UTC-date into the local timezone
  const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());

  // Then format as human-readable in the local timezone.
  const dateString = localDate.toLocaleDateString('en-US', format);
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
  volume,
  issue,
  className,
}: {
  venue?: Required<PageFrontmatter>['venue'];
  volume?: Required<PageFrontmatter>['volume'];
  issue?: Required<PageFrontmatter>['issue'];
  className?: string;
}) {
  if (!venue) return null;
  const { title, url } = typeof venue === 'string' ? { title: venue, url: null } : venue;
  if (!title) return null;
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
          Volume {volume.title}
          {issue != null && <>, Issue {issue.title}</>}
        </span>
      )}
    </div>
  );
}

function LaunchButton(props: { github: string; location: string; binder?: string }) {
  const binder = props.binder ?? 'https://mybinder.org';

  const repoExpr = new RegExp('(?:https?://github.com/)([^/]+/[^/]+).*');
  const github = props.github.match(repoExpr)![1];

  const launchOnBinder = useCallback(() => {
    const url = new URL(binder);

    if (!url.pathname.endsWith('/')) {
      url.pathname = `${url.pathname}/`;
    }
    url.pathname = `${url.pathname}v2/gh/${github}/HEAD`; // TODO: SHA
    const component = encodeURIComponent(props.location);
    url.search = `?labpath=${component}`;
    window?.open(url, '_blank')?.focus();
  }, [binder]);
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="ml-2 inline-flex size-[24px] cursor-default items-center justify-center rounded-full bg-white text-violet11 shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
          aria-label="Update dimensions"
        >
          <RocketIcon />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-[260px] rounded bg-white p-5 shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] will-change-[transform,opacity] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
          sideOffset={5}
        >
          <div className="flex flex-col gap-2.5">
            <p className="mb-2.5 text-[15px] font-medium leading-[19px] text-mauve12">
              Launch Externally
            </p>
            <fieldset className="flex items-center gap-5">
              <label className="w-[75px] text-[13px] text-violet11" htmlFor="width">
                Binder URL
              </label>
              <input
                className="inline-flex h-[25px] w-full flex-1 items-center justify-center rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-violet8"
                id="width"
                defaultValue={props.binder ?? 'https://mybinder.org'}
              />
            </fieldset>
            <div className="mt-[25px] flex justify-end">
              <Popover.Close asChild>
                <button
                  className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none text-green11 hover:bg-green5 focus:shadow-[0_0_0_2px] focus:shadow-green7 focus:outline-none"
                  onClick={launchOnBinder}
                >
                  Launch on Binder
                </button>
              </Popover.Close>
            </div>
          </div>
          <Popover.Close
            className="absolute right-[5px] top-[5px] inline-flex size-[25px] cursor-default items-center justify-center rounded-full text-violet11 outline-none hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7"
            aria-label="Close"
          >
            <Cross2Icon />
          </Popover.Close>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function FrontmatterBlock({
  frontmatter,
  kind = SourceFileKind.Article,
  authorStyle = 'block',
  hideBadges,
  hideExports,
  className,
  location,
}: {
  frontmatter: Omit<PageFrontmatter, 'parts'>;
  kind?: SourceFileKind;
  authorStyle?: 'block' | 'list';
  hideBadges?: boolean;
  hideExports?: boolean;
  className?: string;
  location?: string;
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
    volume,
    issue,
    exports,
    downloads,
    date,
    authors,
  } = frontmatter;
  const isJupyter = kind === SourceFileKind.Notebook;
  const hasExports = downloads ? downloads.length > 0 : exports && exports.length > 0;
  const hasAuthors = authors && authors.length > 0;
  const hasBadges = !!open_access || !!license || !!hasExports || !!isJupyter || !!github;
  const hasHeaders = !!subject || !!venue || !!volume || !!issue;
  const hasDateOrDoi = !!doi || !!date;
  const showHeaderBlock = hasHeaders || (hasBadges && !hideBadges) || (hasExports && !hideExports);
  const hideLaunch: boolean = false;

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
        <div className="flex items-center h-6 mb-5 text-sm font-light">
          {subject && (
            <div
              className={classNames('flex-none pr-2 smallcaps', {
                'border-r mr-2': venue,
              })}
            >
              {subject}
            </div>
          )}
          <Journal venue={venue} volume={volume} issue={issue} />
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
          {!hideLaunch && frontmatter.github && location && (
            <LaunchButton
              github={frontmatter.github}
              location={location}
              binder={frontmatter.binder}
            />
          )}
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
