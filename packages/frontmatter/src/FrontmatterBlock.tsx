import React, { useRef, useCallback } from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { SourceFileKind } from 'myst-spec-ext';
import { JupyterIcon, OpenAccessIcon, GithubIcon, TwitterIcon } from '@scienceicons/react/24/solid';
import { LicenseBadges } from './licenses.js';
import { DownloadsDropdown } from './downloads.js';
import { AuthorAndAffiliations, AuthorsList } from './Authors.js';
import * as Popover from '@radix-ui/react-popover';
import { RocketIcon, Cross2Icon } from '@radix-ui/react-icons';
import * as Tabs from '@radix-ui/react-tabs';

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

type CommonLaunchProps = {
  github: string;
  location: string;
  ref?: string;
};

type JupyterHubLaunchProps = CommonLaunchProps & {
  jupyterhub?: string;
};

type BinderLaunchProps = CommonLaunchProps & {
  binder?: string;
};

function BinderLaunchContent(props: BinderLaunchProps) {
  // Ensure Binder link ends in /
  const defaultBinderBaseURL = props.binder ?? 'https://mybinder.org';

  // Determine Git ref
  // TODO: pull this from frontmatter
  const refComponent = encodeURIComponent(props.ref ?? 'HEAD');
  const locationComponent = encodeURIComponent(props.location);

  // Parse the repo, assume it is a validated GitHub URL
  const repo = new RegExp('https://github.com/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)');
  const githubComponent = props.github.match(repo)![1];

  const binderInputRef = useRef<HTMLInputElement>(null);

  const launchOnBinder = useCallback(() => {
    // Parse input URL (or fallback)
    const parsedBinderBaseURL = new URL(binderInputRef.current?.value ?? defaultBinderBaseURL);
    // Drop any fragments
    let binderBaseURL = `${parsedBinderBaseURL.origin}${parsedBinderBaseURL.pathname}`;
    // Ensure a trailing fragment
    if (!binderBaseURL.endsWith('/')) {
      binderBaseURL = `${binderBaseURL}/`;
    }
    // Build Binder URL
    const binderURL = new URL(binderBaseURL);
    binderURL.pathname = `${binderURL.pathname}v2/gh/${githubComponent}/${refComponent}`;
    binderURL.search = `?labpath=${locationComponent}`;

    window?.open(binderURL, '_blank')?.focus();
  }, [defaultBinderBaseURL, binderInputRef, githubComponent, refComponent, locationComponent]);

  return (
    <div className="flex flex-col gap-2.5">
      <p className="mb-2.5 text-[15px] font-medium leading-[19px]">
        Launch on a BinderHub e.g. <a href="https://mybinder.org">mybinder.org</a>
      </p>
      <fieldset className="flex items-center gap-5">
        <label className="w-[75px] text-[13px]" htmlFor="width">
          Binder URL
        </label>
        <input
          ref={binderInputRef}
          className="inline-flex h-[25px] w-full flex-1 items-center justify-center rounded px-2.5 text-[13px] leading-none bg-gray-50 dark:bg-gray-700"
          id="width"
          placeholder={defaultBinderBaseURL}
        />
      </fieldset>
      <div className="mt-[25px] flex justify-end">
        <Popover.Close asChild>
          <button
            className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none bg-orange-500 outline-none text-white"
            onClick={launchOnBinder}
          >
            Launch
          </button>
        </Popover.Close>
      </div>
    </div>
  );
}
function JupyterHubLaunchContent(props: JupyterHubLaunchProps) {
  // Ensure Binder link ends in /
  const defaultHubBaseURL = props.jupyterhub ?? '';

  // Determine Git ref
  // TODO: pull this from frontmatter
  const refComponent = encodeURIComponent(props.ref ?? 'HEAD');
  const locationComponent = encodeURIComponent(props.location);

  // Parse the repo, assume it is a validated GitHub URL
  const repo = new RegExp('https://github.com/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)');
  const githubComponent = props.github.match(repo)![1];

  const hubInputRef = useRef<HTMLInputElement>(null);

  const launchOnBinder = useCallback(() => {
    // Parse input URL (or fallback)
    const rawHubBaseURL = hubInputRef.current?.value;
    if (!rawHubBaseURL) {
      return;
    }
    // Drop any fragments
    const parsedHubBaseURL = new URL(rawHubBaseURL);
    let hubBaseURL = `${parsedHubBaseURL.origin}${parsedHubBaseURL.pathname}`;
    // Ensure a trailing fragment
    if (!hubBaseURL.endsWith('/')) {
      hubBaseURL = `${hubBaseURL}/`;
    }
    // Build Binder URL
    const binderURL = new URL(hubBaseURL);
    binderURL.pathname = `${binderURL.pathname}v2/gh/${githubComponent}/${refComponent}`;
    binderURL.search = `?labpath=${locationComponent}`;

    // window?.open(binderURL, '_blank')?.focus();
  }, [defaultHubBaseURL, hubInputRef, githubComponent, refComponent, locationComponent]);

  return (
    <div className="flex flex-col gap-2.5">
      <p className="mb-2.5 text-[15px] font-medium leading-[19px]">Launch on a JupyterHub</p>
      <fieldset className="flex items-center gap-5">
        <label className="w-[75px] text-[13px]" htmlFor="width">
          Binder URL
        </label>
        <input
          ref={hubInputRef}
          className="inline-flex h-[25px] w-full flex-1 items-center justify-center rounded px-2.5 text-[13px] leading-none bg-gray-50 dark:bg-gray-700"
          id="width"
          placeholder={defaultHubBaseURL}
        />
      </fieldset>
      <div className="mt-[25px] flex justify-end">
        <Popover.Close asChild>
          <button
            className="inline-flex h-[35px] items-center justify-center rounded bg-green4 px-[15px] font-medium leading-none bg-orange-500 outline-none text-white"
            onClick={launchOnBinder}
          >
            Launch
          </button>
        </Popover.Close>
      </div>
    </div>
  );
}

export function LaunchButton(props: BinderLaunchProps | JupyterHubLaunchProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="inline-flex size-[24px] hover:text-[#E18435] items-center justify-center"
          aria-label="Launch in external computing interface"
        >
          <RocketIcon />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-30 text-gray-700 dark:text-white bg-white dark:bg-stone-800 p-5 rounded shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)]"
          sideOffset={5}
        >
          <Tabs.Root className="flex w-[300px] flex-col" defaultValue="binder">
            <Tabs.List
              className="flex shrink-0 border-b border-mauve6"
              aria-label="Launch into computing interface"
            >
              <Tabs.Trigger
                className="flex h-[45px] flex-1 cursor-default items-center justify-center bg-white px-5 text-[15px] outline-none data-[state=active]:underline"
                value="binder"
              >
                Binder
              </Tabs.Trigger>
              <Tabs.Trigger
                className="flex h-[45px] flex-1 cursor-default items-center justify-center bg-white px-5 text-[15px] outline-none data-[state=active]:underline"
                value="jupyterhub"
              >
                JupyterHub
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content
              className="grow rounded-b-md bg-white p-5 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
              value="binder"
            >
              <BinderLaunchContent {...props} />
            </Tabs.Content>
            <Tabs.Content
              className="grow rounded-b-md bg-white p-5 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
              value="jupyterhub"
            >
              <JupyterHubLaunchContent {...props} />
            </Tabs.Content>
          </Tabs.Root>
          <Popover.Close
            className="absolute right-[5px] top-[5px] inline-flex size-[25px] items-center justify-center rounded-full"
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
