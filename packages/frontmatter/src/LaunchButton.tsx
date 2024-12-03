import React, { useRef, useCallback, useState } from 'react';
import classNames from 'classnames';

import * as Popover from '@radix-ui/react-popover';
import { RocketIcon, Cross2Icon, ClipboardCopyIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import * as Tabs from '@radix-ui/react-tabs';
import * as Form from '@radix-ui/react-form';
import type { ExpandedThebeFrontmatter, BinderHubOptions } from 'myst-frontmatter';

const GITHUB_USERNAME_REPO_REGEX =
  /^(?:https?:\/\/github.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:.git)?\/?$/;
const GITLAB_USERNAME_REPO_REGEX =
  /^(?:https?:\/\/gitlab.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:.git)?\/?$/;
const GIST_USERNAME_REPO_REGEX =
  /^(?:https?:\/\/gist.github.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:.git)?\/?$/;

type CopyButtonProps = {
  defaultMessage: string;
  alternateMessage?: string;
  timeout?: number;
  buildLink: () => string | undefined;
  className?: string;
};

function CopyButton(props: CopyButtonProps) {
  const { className, defaultMessage, alternateMessage, buildLink, timeout } = props;
  const [message, setMessage] = useState(defaultMessage);

  const copyLink = useCallback(() => {
    // Build the link for the clipboard
    const link = props.buildLink();
    // In secure links, we can copy it!
    if (window.isSecureContext) {
      // Write to clipboard
      window.navigator.clipboard.writeText(link ?? '<invalid link>');
      // Update UI
      setMessage(alternateMessage ?? defaultMessage);

      // Set callback to restore message
      setTimeout(() => {
        setMessage(defaultMessage);
      }, timeout ?? 1000);
    }
  }, [defaultMessage, alternateMessage, buildLink, timeout, setMessage]);

  return (
    <button
      type="button"
      className={classNames(className, 'flex flex-row items-center gap-1')}
      onClick={copyLink}
    >
      {message} <ClipboardCopyIcon className="inline-block" />
    </button>
  );
}

export type LaunchProps = {
  thebe: ExpandedThebeFrontmatter;
  location: string;
};
type ModalLaunchProps = LaunchProps & {
  onLaunch?: () => void;
};

/**
 * Ensure URL of for http://foo.com/bar?baz
 * has the form      http://foo.com/bar/
 *
 * @param url - URL to parse
 */
function ensureBasename(url: string): string {
  // Parse input URL (or fallback)
  const parsedURL = new URL(url);
  // Drop any fragments
  let baseURL = `${parsedURL.origin}${parsedURL.pathname}`;
  // Ensure a trailing fragment
  if (!baseURL.endsWith('/')) {
    baseURL = `${baseURL}/`;
  }
  return baseURL;
}

/**
 * Equivalent to Python's `urllib.parse.urlencode` function
 *
 * @param params - mapping from parameter name to string value
 */
function encodeURLParams(params: Record<string, string | undefined>): string {
  return Object.entries(params)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
    .join('&');
}

/**
 * Make a binder url for supported providers
 *
 * - trim gitlab.com from repo
 * - trim trailing or leading '/' on repo
 * - convert to URL acceptable string. Required for gitlab
 * - trailing / on binderUrl
 *
 * Copied from thebe-core
 *
 * @param opts BinderOptions
 * @returns  a binder compatible url
 */
function makeBinderURL(
  options: BinderHubOptions,
  location: string,
  version: string = 'v2',
): string | undefined {
  let stub: string;

  if (!options.repo || !options.url) {
    return undefined;
  }

  switch (options.provider) {
    case 'git': {
      const encodedRepo = encodeURIComponent(options.repo);
      const encodedRef = encodeURIComponent(options.ref ?? 'HEAD');
      stub = `git/${encodedRepo}/${encodedRef}`;
      break;
    }
    case 'gitlab': {
      const [, org, repo] = options.repo.match(GITLAB_USERNAME_REPO_REGEX) ?? [];
      if (!org) {
        return undefined;
      }
      const encodedRef = encodeURIComponent(options.ref ?? 'HEAD');
      stub = `gl/${org}/${repo}/${encodedRef}`;
      break;
    }
    case 'github': {
      const [, org, repo] = options.repo.match(GITHUB_USERNAME_REPO_REGEX) ?? [];
      if (!org) {
        return undefined;
      }
      const encodedRef = encodeURIComponent(options.ref ?? 'HEAD');
      stub = `gh/${org}/${repo}/${encodedRef}`;
      break;
    }
    case 'gist': {
      const [, org, repo] = options.repo.match(GIST_USERNAME_REPO_REGEX) ?? [];
      if (!org) {
        return undefined;
      }
      const encodedRef = encodeURIComponent(options.ref ?? 'HEAD');
      stub = `gist/${org}/${repo}/${encodedRef}`;
      break;
    }
    default: {
      return undefined;
    }
  }
  // Build binder URL path
  const query = encodeURLParams({ urlpath: `/lab/tree/${location}` });

  const binderURL = ensureBasename(options.url);
  return `${binderURL}${version}/${stub}?${query}`;
}

function cloneNameFromRepo(repo: string) {
  const url = new URL(repo);
  const parts = url.pathname.slice(1).split('/');
  return parts[parts.length - 1] || url.hostname;
}

/**
 * Make an nbgitpuller url for supported providers
 *
 * - trim gitlab.com from repo
 * - trim trailing or leading '/' on repo
 * - convert to URL acceptable string. Required for gitlab
 * - trailing / on binderUrl
 *
 * Copied from thebe-core
 *
 * @param opts BinderOptions
 * @returns  a binder compatible url
 */
function makeNbgitpullerURL(options: BinderHubOptions, location: string): string | undefined {
  if (!options.repo || !options.url) {
    return undefined;
  }
  const { ref } = options;

  let repo: string;
  let cloneName: string;

  switch (options.provider) {
    case 'git': {
      repo = options.repo;
      cloneName = cloneNameFromRepo(repo);
      break;
    }
    case 'gitlab': {
      const [, org, name] = options.repo.match(GITLAB_USERNAME_REPO_REGEX) ?? [];
      repo = `https://gitlab.com/${org}/${name}`;
      cloneName = name;
      break;
    }
    case 'github': {
      const [, org, name] = options.repo.match(GITHUB_USERNAME_REPO_REGEX) ?? [];
      repo = `https://github.com/${org}/${name}`;
      cloneName = name;
      break;
    }
    case 'gist': {
      const [, , rev] = options.repo.match(GIST_USERNAME_REPO_REGEX) ?? [];
      repo = `https://gist.github.com/${rev}`;
      cloneName = rev;
      break;
    }
    default: {
      return undefined;
    }
  }

  // Build binder URL path
  const query = encodeURLParams({
    repo,
    // Need a valid branch name, not a rev
    // branch: ref,
    urlpath: `/lab/tree/${cloneName}${location}`,
  });

  return `git-pull?${query}`;
}

function BinderLaunchContent(props: ModalLaunchProps) {
  const { thebe, location, onLaunch } = props;
  const { binder } = thebe;
  const defaultBinderBaseURL = binder?.url ?? 'https://mybinder.org';

  const formRef = useRef<HTMLFormElement>(null);
  const buildLink = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const data = Object.fromEntries(new FormData(form) as any);
    return makeBinderURL({ ...(binder ?? {}), url: data.url || defaultBinderBaseURL }, location);
  }, [formRef, location, binder]);

  // FIXME: use ValidityState from radix-ui once passing-by-name is fixed
  const urlRef = useRef<HTMLInputElement>(null);
  const buildValidLink = useCallback(() => {
    if (urlRef.current?.dataset.invalid === 'true') {
      return;
    } else {
      return buildLink();
    }
  }, [buildLink, urlRef]);

  const handleSubmit = useCallback(
    (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      const link = buildLink();

      // Link should exist, but guard anyway
      if (link) {
        window?.open(link, '_blank')?.focus();
      }
      onLaunch?.();
    },
    [defaultBinderBaseURL, buildLink, onLaunch],
  );
  return (
    <Form.Root className="w-[260px]" onSubmit={handleSubmit} ref={formRef}>
      <p className="mb-2.5 text-[15px] font-medium leading-[19px]">
        Launch on a BinderHub e.g. <a href="https://mybinder.org">mybinder.org</a>
      </p>
      <Form.Field className="mb-2.5 grid" name="url">
        <div className="flex items-baseline justify-between">
          <Form.Label className="text-[15px] font-medium leading-[35px]">BinderHub URL</Form.Label>
          <Form.Message className="text-[13px] opacity-80" match="typeMismatch">
            Please provide a valid URL that starts with http(s).
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input
            className="box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded px-2.5 text-[15px] leading-none shadow-[0_0_0_1px] shadow-slate-400 outline-none bg-gray-50 dark:bg-gray-700 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
            type="url"
            placeholder={defaultBinderBaseURL}
            ref={urlRef}
          />
        </Form.Control>
      </Form.Field>
      <div className="flex flex-row justify-between">
        <Form.Submit asChild>
          <button className="inline-flex flex-row gap-1 h-[35px] items-center justify-center rounded px-[15px] font-medium leading-none bg-orange-500 hover:bg-orange-600 outline-none text-white focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
            <span>Launch</span> <ExternalLinkIcon className="inline-block" />
          </button>
        </Form.Submit>
        <CopyButton
          className="inline-flex h-[35px] items-center justify-center rounded px-[15px] font-medium leading-none bg-gray-400 hover:bg-gray-500 outline-none text-white focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none"
          defaultMessage="Copy Link"
          alternateMessage="Copied Link"
          buildLink={buildValidLink}
        />
      </div>
    </Form.Root>
  );
}

function JupyterHubLaunchContent(props: ModalLaunchProps) {
  const { onLaunch, location, thebe } = props;
  const { binder } = thebe;

  const defaultHubBaseURL = '';

  const formRef = useRef<HTMLFormElement>(null);
  const buildLink = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const data = Object.fromEntries(new FormData(form) as any);
    const rawHubBaseURL = data.url;
    if (!rawHubBaseURL) {
      return;
    }
    const gitPullURL = makeNbgitpullerURL(binder ?? {}, location);
    const hubURL = ensureBasename(rawHubBaseURL);
    return `${hubURL}hub/user-redirect/${gitPullURL}`;
  }, [formRef, location, binder]);

  // FIXME: use ValidityState from radix-ui once passing-by-name is fixed
  const urlRef = useRef<HTMLInputElement>(null);
  const buildValidLink = useCallback(() => {
    if (urlRef.current?.dataset.invalid === 'true') {
      return;
    } else {
      return buildLink();
    }
  }, [buildLink, urlRef]);

  const handleSubmit = useCallback(
    (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      const link = buildLink();

      // Link should exist, but guard anyway
      if (link) {
        window?.open(link, '_blank')?.focus();
      }
      onLaunch?.();
    },
    [defaultHubBaseURL, buildLink, onLaunch],
  );

  return (
    <Form.Root className="w-[260px]" onSubmit={handleSubmit} ref={formRef}>
      <p className="mb-2.5 text-[15px] font-medium leading-[19px]">Launch on a JupyterHub</p>
      <Form.Field className="mb-2.5 grid" name="url">
        <div className="flex items-baseline justify-between">
          <Form.Label className="text-[15px] font-medium leading-[35px]">JupyterHub URL</Form.Label>
          <Form.Message className="text-[13px] opacity-80" match="valueMissing">
            Please provide a URL.
          </Form.Message>

          <Form.Message className="text-[13px] opacity-80" match="typeMismatch">
            Please provide a valid URL that starts with http(s).
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input
            className="box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded px-2.5 text-[15px] leading-none shadow-[0_0_0_1px] shadow-slate-400 outline-none bg-gray-50 dark:bg-gray-700 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
            type="url"
            required
            ref={urlRef}
          />
        </Form.Control>
      </Form.Field>

      <div className="flex flex-row justify-between">
        <Form.Submit asChild>
          <button className="inline-flex flex-row gap-1 h-[35px] items-center justify-center rounded px-[15px] font-medium leading-none bg-orange-500 hover:bg-orange-600 outline-none text-white focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
            <span>Launch</span> <ExternalLinkIcon className="inline-block" />
          </button>
        </Form.Submit>
        <CopyButton
          className="inline-flex h-[35px] items-center justify-center rounded px-[15px] font-medium leading-none bg-gray-400 hover:bg-gray-500 outline-none text-white focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none"
          defaultMessage="Copy Link"
          alternateMessage="Copied Link"
          buildLink={buildValidLink}
        />
      </div>
    </Form.Root>
  );
}

export function LaunchButton(props: LaunchProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const closePopover = useCallback(() => {
    closeRef.current?.click?.();
  }, []);
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
              className="flex shrink-0 border-b divide-x border-gray-200 dark:border-gray-400"
              aria-label="Launch into computing interface"
            >
              <Tabs.Trigger
                className="flex h-[45px] flex-1 cursor-default items-center justify-center px-5 text-[15px] outline-none data-[state=active]:underline"
                value="binder"
              >
                Binder
              </Tabs.Trigger>
              <Tabs.Trigger
                className="flex h-[45px] flex-1 cursor-default items-center justify-center px-5 text-[15px] outline-none data-[state=active]:underline"
                value="jupyterhub"
              >
                JupyterHub
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content className="grow rounded-b-md p-5 outline-none" value="binder">
              <BinderLaunchContent {...props} onLaunch={closePopover} />
            </Tabs.Content>
            <Tabs.Content className="grow rounded-b-md p-5 outline-none" value="jupyterhub">
              <JupyterHubLaunchContent {...props} onLaunch={closePopover} />
            </Tabs.Content>
          </Tabs.Root>
          <Popover.Close
            className="absolute right-[5px] top-[5px] inline-flex size-[25px] items-center justify-center rounded-full"
            aria-label="Close"
            ref={closeRef}
          >
            <Cross2Icon />
          </Popover.Close>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
