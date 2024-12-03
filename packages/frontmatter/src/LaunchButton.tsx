import React, { useRef, useCallback, useState } from 'react';
import classNames from 'classnames';

import * as Popover from '@radix-ui/react-popover';
import { RocketIcon, Cross2Icon, ClipboardCopyIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import * as Tabs from '@radix-ui/react-tabs';
import * as Form from '@radix-ui/react-form';

export type CommonLaunchProps = {
  repo: string;
  location: string;
  ref?: string;
  onLaunch?: () => void;
};

export type JupyterHubLaunchProps = CommonLaunchProps & {
  jupyterhub?: string;
};

export type BinderLaunchProps = CommonLaunchProps & {
  binder?: string;
};

const GITHUB_PATTERN = /https:\/\/github.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/;

type GitResource = {
  // Provider
  provider: 'github';
  // Per-provider info
  org: string;
  repo: string;
};

/**
 * Parse a Git source URL into a Git "resource" consisting of a provider and provider info
 *
 * @param git - git URL
 */
function parseKnownGitProvider(git: string): GitResource | undefined {
  let match;
  if ((match = git.match(GITHUB_PATTERN))) {
    return {
      provider: 'github',
      org: match[1],
      repo: match[2],
    };
  }
  return undefined;
}

/**
 * Ensure URL of for http://foo.com/bar?baz
 * has the form      http://foo.com/bar/
 *
 * @param url - URL to parse
 */
function ensureBasename(url: string): URL {
  // Parse input URL (or fallback)
  const parsedURL = new URL(url);
  // Drop any fragments
  let baseURL = `${parsedURL.origin}${parsedURL.pathname}`;
  // Ensure a trailing fragment
  if (!baseURL.endsWith('/')) {
    baseURL = `${baseURL}/`;
  }
  return new URL(baseURL);
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

function BinderLaunchContent(props: BinderLaunchProps) {
  const { onLaunch } = props;
  const defaultBinderBaseURL = props.binder ?? 'https://mybinder.org';

  // Determine Git ref
  const refComponent = encodeURIComponent(props.ref ?? 'HEAD');

  // Build binder URL path
  const query = encodeURLParams({ urlpath: `/lab/tree/${props.location}` });

  // Parse the repo, assume it is a validated GitHub URL
  let gitComponent: string;
  const resource = parseKnownGitProvider(props.repo);
  switch (resource?.provider) {
    case 'github': {
      gitComponent = `gh/${resource.org}/${resource.repo}`;
      break;
    }
    default: {
      const escapedURL = encodeURIComponent(props.repo);
      gitComponent = `git/${escapedURL}`;
    }
  }

  const formRef = useRef<HTMLFormElement>(null);
  const buildLink = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const data = Object.fromEntries(new FormData(form) as any);
    const binderURL = ensureBasename(data.url || defaultBinderBaseURL);
    binderURL.pathname = `${binderURL.pathname}v2/${gitComponent}/${refComponent}`;
    binderURL.search = `?${query}`;
    return binderURL.toString();
  }, [formRef, gitComponent, refComponent, query]);

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
          <Form.Label className="text-[15px] font-medium leading-[35px]">Binder URL</Form.Label>
          <Form.Message className="text-[13px] opacity-80" match="typeMismatch">
            Please provide a valid URL
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

function JupyterHubLaunchContent(props: JupyterHubLaunchProps) {
  const { onLaunch } = props;
  const defaultHubBaseURL = props.jupyterhub ?? '';

  const resource = parseKnownGitProvider(props.repo);

  let urlPath = 'lab/tree';
  switch (resource?.provider) {
    case 'github': {
      urlPath = `${urlPath}/${resource.repo}${props.location}`;
    }
  }

  // Encode query for nbgitpuller
  const query = encodeURLParams({
    repo: props.repo,
    urlpath: urlPath,
    branch: props.ref,
  });

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
    const hubURL = ensureBasename(rawHubBaseURL);
    hubURL.pathname = `${hubURL.pathname}hub/user-redirect/git-pull`;
    hubURL.search = `?${query}`;
    return hubURL.toString();
  }, [formRef, query]);

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
            Please enter a URL
          </Form.Message>

          <Form.Message className="text-[13px] opacity-80" match="typeMismatch">
            Please provide a valid URL
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

export function LaunchButton(props: BinderLaunchProps | JupyterHubLaunchProps) {
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
              className="flex shrink-0 border-b border-mauve6"
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
