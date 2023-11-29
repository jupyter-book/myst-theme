import type { ManifestProject } from '@myst-theme/providers';
import type { Thebe, JupyterServerOptions, BinderHubOptions } from 'myst-frontmatter';
import type { CoreOptions, WellKnownRepoProvider } from 'thebe-core';

export type ExtendedCoreOptions = CoreOptions & {
  useBinder?: boolean;
  useJupyterLite?: boolean;
};

function extractGithubRepoInfo(url: string): { owner: string; repo: string } | null {
  const pattern = /https?:\/\/github\.com\/([^/]+)\/([^/]+)/;
  const match = url.match(pattern);

  if (match) {
    return {
      owner: match[1],
      repo: match[2],
    };
  }

  return null;
}

function extractBinderRepoInfo(url: string): {
  binderUrl: string;
  repoProvider: WellKnownRepoProvider | string;
  owner: string;
  repo: string;
  ref: string;
} | null {
  const pattern = /(https?:\/\/[^/]+(?:\/[^/]+)*?)\/(v\d+)\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)/;
  const match = url.match(pattern);

  if (match) {
    const repoProviderAbbreviation = match[3];
    let repoProvider;

    switch (repoProviderAbbreviation) {
      case 'gh':
        repoProvider = 'github';
        break;
      case 'gl':
        repoProvider = 'gitlab';
        break;
      default:
        repoProvider = repoProviderAbbreviation;
    }

    return {
      binderUrl: match[1],
      repoProvider: repoProvider,
      owner: match[4],
      repo: match[5],
      ref: match[6],
    };
  }

  return null;
}

function isObject(maybeObject: any) {
  return typeof maybeObject === 'object' && maybeObject !== null;
}

export function thebeFrontmatterToOptions(
  fm: boolean | Thebe | undefined,
): ExtendedCoreOptions | undefined {
  if (fm === undefined || fm === false) return undefined;

  const { binder, server, lite, kernelName, disableSessionSaving, mathjaxConfig, mathjaxUrl } =
    (fm as Thebe | undefined) ?? {};

  const thebeOptions: ExtendedCoreOptions = { mathjaxConfig, mathjaxUrl };

  if (disableSessionSaving) {
    thebeOptions.savedSessionOptions = { enabled: false };
  }

  // handle additional options
  if (kernelName) {
    thebeOptions.kernelOptions = {
      kernelName: kernelName,
    };
  }

  if (binder) {
    thebeOptions.useBinder = true;
  }

  // check for juptyer lite
  if (lite === true) {
    thebeOptions.useJupyterLite = true;
  }

  // translate fm to server settings
  if (isObject(server)) {
    // handle fully specified server object
    const { url, token } = server as JupyterServerOptions;
    thebeOptions.serverSettings = {};
    if (url) thebeOptions.serverSettings.baseUrl = url;
    if (token) thebeOptions.serverSettings.token = token;
  }

  return thebeOptions;
}
