import React, { useRef, useCallback, useState } from 'react';
import classNames from 'classnames';

import * as Popover from '@radix-ui/react-popover';
import {
  RocketIcon,
  Cross2Icon,
  ClipboardCopyIcon,
  ExternalLinkIcon,
  QuestionMarkCircledIcon,
  UpdateIcon,
  Link2Icon,
} from '@radix-ui/react-icons';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { BinderIcon, JupyterIcon } from '@scienceicons/react/24/solid';
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
  copiedMessage?: string;
  invalidLinkFallback?: string;
  copiedMessageDuration?: number;
  buildLink: () => string | undefined;
  className?: string;
};

/**
 * Component to add a copy-to-clipboard button
 */
function CopyButton(props: CopyButtonProps) {
  const {
    className,
    defaultMessage,
    copiedMessage,
    invalidLinkFallback,
    buildLink,
    copiedMessageDuration,
  } = props;
  const [message, setMessage] = useState(defaultMessage);

  const copyLink = useCallback(() => {
    // In secure links, we can copy it!
    if (window.isSecureContext) {
      // Build the link for the clipboard
      const link = props.buildLink();
      // Write to clipboard
      window.navigator.clipboard.writeText(link ?? invalidLinkFallback ?? '<invalid link>');
      // Update UI
      setMessage(copiedMessage ?? defaultMessage);

      // Set callback to restore message
      setTimeout(() => {
        setMessage(defaultMessage);
      }, copiedMessageDuration ?? 1000);
    }
  }, [
    defaultMessage,
    copiedMessage,
    buildLink,
    copiedMessageDuration,
    invalidLinkFallback,
    setMessage,
  ]);

  return (
    <button
      type="button"
      className={classNames(
        'myst-fm-launch-copy-button',
        className,
        'flex flex-row items-center gap-1',
      )}
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

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handle);
    };
  }, [value, delay]);
  return debouncedValue;
}

type ProviderType = 'binderhub' | 'jupyterhub';

/**
 * Interrogate a possible remote provider URL to
 * determine whether it is a BinderHub or JupyterHub
 *
 * @param baseUrl - URL to interrogate, ending with a slash
 */
async function interrogateProviderType(baseUrl: string): Promise<ProviderType | 'error'> {
  const binderURL = `${baseUrl}versions`;
  try {
    const response = await fetch(binderURL);
    const data = await response.json();
    if ('binderhub' in data) {
      return 'binderhub';
    }
  } catch (err) {
    console.debug(`Couldn't reach ${binderURL}`);
  }
  const hubURL = `${baseUrl}hub/api/`;
  try {
    const response = await fetch(hubURL);
    const data = await response.json();
    if ('version' in data) {
      return 'jupyterhub';
    }
  } catch (err) {
    console.debug(`Couldn't reach ${binderURL}`);
  }

  return 'error';
}

function DetectLaunchContent(props: ModalLaunchProps) {
  const { thebe, location, onLaunch } = props;
  const { binder } = thebe;
  const defaultBinderBaseURL = binder?.url ?? 'https://mybinder.org';

  // Detect the provider type
  const [detectedProviderType, setDetectedProviderType] = useState<
    ProviderType | 'error' | undefined
  >(undefined);

  // Handle URL entry that needs to be debounced
  const [url, setURL] = useState('');
  const onUrlChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Reset the known state of the provider
      setDetectedProviderType(undefined);
      // Update the recorded state of the URL input
      setURL(event.target.value);
    },
    [setURL],
  );

  const formRef = useRef<HTMLFormElement>(null);

  const buildLink = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const data = Object.fromEntries(new FormData(form) as any);
    const rawBaseUrl = data.url;
    if (!rawBaseUrl) {
      return;
    }
    const baseUrl = ensureBasename(rawBaseUrl);

    const userProvider = data?.provider as ProviderType | undefined;
    const provider = userProvider ?? detectedProviderType;
    switch (provider) {
      case 'jupyterhub': {
        const gitPullURL = makeNbgitpullerURL(binder ?? {}, location);
        return `${baseUrl}hub/user-redirect/${gitPullURL}`;
      }
      case 'binderhub': {
        return makeBinderURL({ ...(binder ?? {}), url: baseUrl }, location);
      }
      case undefined: {
        return;
      }
    }
  }, [formRef, location, binder, detectedProviderType]);

  // FIXME: use ValidityState from radix-ui once passing-by-name is fixed
  const urlRef = useRef<HTMLInputElement>(null);
  const buildValidLink = useCallback(() => {
    if (urlRef.current?.dataset.invalid === 'true') {
      return;
    } else {
      return buildLink();
    }
  }, [buildLink, urlRef]);

  // Detect the provider type on debounced text input
  const debouncedURL = useDebounce(url, 100);
  const [isInterrogating, setIsInterrogating] = useState(false);
  React.useEffect(() => {
    // Check validity manually to ensure that we don't make requests that aren't sensible
    const urlIsValid = !!urlRef.current?.checkValidity?.();
    // Don't detect URL if it isn't valid
    if (!urlIsValid) {
      return;
    }

    // Enter interrogating state
    setIsInterrogating(true);

    // Interrogate remote endpoint
    let baseName;
    try {
      baseName = ensureBasename(debouncedURL);
    } catch (err) {
      return;
    }
    interrogateProviderType(baseName)
      .then((provider: ProviderType | 'error') => {
        if (provider !== 'error') {
          setDetectedProviderType(provider);
        }
        // Special case for mybinder.org
        else if (/https?:\/\/mybinder.org\//.test(baseName)) {
          setDetectedProviderType('binderhub');
        } else {
          setDetectedProviderType('error');
        }
      })
      .catch(console.error)
      // Clear the interrogating state
      .finally(() => setIsInterrogating(false));
  }, [debouncedURL, urlRef, setIsInterrogating]);

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
    <Form.Root onSubmit={handleSubmit} ref={formRef}>
      <Form.Field className="myst-fm-launch-form mb-2.5 grid" name="url">
        <div className="flex flex-col items-baseline justify-between">
          <Form.Label className="myst-fm-launch-label text-[15px] font-medium leading-[35px]">
            Enter a JupyterHub or BinderHub URL, e.g.{' '}
            <a
              href="https://mybinder.org"
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              https://mybinder.org
            </a>
          </Form.Label>
          <Form.Message className="text-[13px] opacity-80" match="typeMismatch">
            Please provide a valid URL that starts with http(s).
          </Form.Message>
        </div>
        <div className="relative flex">
          <span className="flex absolute h-full" aria-hidden>
            {(detectedProviderType === 'binderhub' && (
              <BinderIcon className="myst-fm-launch-status-ready w-[24px] h-[24px] mx-[4px] self-center pointer-events-none" />
            )) ||
              (detectedProviderType === 'jupyterhub' && (
                <JupyterIcon className="myst-fm-launch-status-ready w-[24px] h-[24px] mx-[4px] self-center pointer-events-none" />
              )) ||
              (detectedProviderType === 'error' && (
                <QuestionMarkCircledIcon className="myst-fm-launch-status-error w-[24px] h-[24px] mx-[4px] self-center pointer-events-none" />
              )) ||
              (isInterrogating && (
                <UpdateIcon className="myst-fm-launch-status-building w-[24px] h-[24px] mx-[4px] self-center pointer-events-none motion-safe:animate-spin" />
              )) || (
                <Link2Icon className="myst-fm-launch-status w-[24px] h-[24px] mx-[4px] self-center pointer-events-none" />
              )}
          </span>
          <Form.Control asChild>
            <input
              className="myst-fm-launch-input ps-[32px] box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded px-2.5 text-[15px] leading-none shadow-[0_0_0_1px] shadow-slate-400 outline-none bg-gray-50 dark:bg-gray-700 hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black]"
              type="url"
              placeholder={defaultBinderBaseURL}
              required
              ref={urlRef}
              onChange={onUrlChanged}
            />
          </Form.Control>
        </div>
      </Form.Field>

      <details
        className={classNames(
          'myst-fm-launch-modal-body rounded-md my-5 shadow dark:shadow-2xl dark:shadow-neutral-900 overflow-hidden',
          'bg-gray-50 dark:bg-stone-800',
          { hidden: !(detectedProviderType === 'jupyterhub' || detectedProviderType === 'error') },
        )}
        open={false}
      >
        <summary
          className={classNames(
            'myst-fm-launch-modal-header m-0 text-lg font-medium py-1 min-h-[2em] pl-3',
            'cursor-pointer hover:shadow-[inset_0_0_0px_30px_#00000003] dark:hover:shadow-[inset_0_0_0px_30px_#FFFFFF03]',
            'bg-gray-100 dark:bg-slate-900',
          )}
        >
          <span className="text-neutral-900 dark:text-white">
            <span className="block float-right text-sm font-thin text-neutral-700 dark:text-neutral-200">
              <ChevronRightIcon
                width="1.5rem"
                height="1.5rem"
                className={classNames('details-toggle', 'transition-transform')}
              />
            </span>
            JupyterHub Requirements
          </span>
        </summary>
        <div className="px-4 py-1 details-body flex flex-col gap-1">
          <p>
            Launching on a JupyterHub will usually require you to choose a "profile". You should
            select a profile that has the right packages, and enough resources to run the code-cells
            and inline expressions in this MyST project.
          </p>

          <p>
            Whichever image you choose, it must have the{' '}
            <a href="https://github.com/jupyterhub/nbgitpuller" className="underline">
              nbgitpuller
            </a>{' '}
            extension installed. If it is missing, you will see an HTTP 404 error once the server
            starts.
          </p>
          <p>
            Contact the Hub administrator for more information about using nbgitpuller with
            JupyterHub.
          </p>
        </div>
      </details>

      <fieldset
        disabled={detectedProviderType !== 'error'}
        className={classNames('myst-fm-launch-option mt-6', {
          hidden: detectedProviderType !== 'error',
        })}
      >
        <legend className="mb-3">
          The provider type could not be detected automatically. what kind of provider have you
          given?
        </legend>
        <div>
          <input
            id="jupyterhub"
            type="radio"
            name="provider"
            value="jupyterhub"
            className="mr-2"
            defaultChecked
          />
          <label className="cursor-pointer " htmlFor="jupyterhub">
            JupyterHub
          </label>
        </div>
        <div>
          <input id="binderhub" type="radio" name="provider" className="mr-2" value="binderhub" />
          <label className="cursor-pointer " htmlFor="binderhub">
            BinderHub
          </label>
        </div>
      </fieldset>

      <fieldset
        className={classNames('myst-fm-launch-modal-footer flex flex-row justify-between mt-6', {
          hidden: detectedProviderType === undefined,
        })}
        disabled={detectedProviderType === undefined}
      >
        <Form.Submit asChild>
          <button className="myst-fm-launch-button inline-flex flex-row gap-1 h-[35px] items-center justify-center rounded px-[15px] font-medium leading-none bg-orange-500 hover:bg-orange-600 outline-none text-white focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
            <span>Launch</span> <ExternalLinkIcon className="myst-fm-launch-icon inline-block" />
          </button>
        </Form.Submit>

        <CopyButton
          className="inline-flex h-[35px] items-center justify-center rounded px-[15px] font-medium leading-none bg-gray-400 hover:bg-gray-500 outline-none text-white focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none"
          defaultMessage="Copy Link"
          copiedMessage="Link Copied"
          buildLink={buildValidLink}
        />
      </fieldset>
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
          className="myst-fm-launch-button inline-flex size-[24px] hover:text-[#E18435] items-center justify-center"
          aria-label="Launch in external computing interface"
          title="Launch in external computing interface"
        >
          <RocketIcon className="myst-fm-launch-icon" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="myst-fm-launch-modal myst-fm-launch-modal-content z-30 text-gray-700 dark:text-white bg-white dark:bg-stone-800 p-5 rounded shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] max-w-[400px]"
          sideOffset={5}
        >
          <DetectLaunchContent {...props} onLaunch={closePopover} />
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
