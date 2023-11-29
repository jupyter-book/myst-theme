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
  githubBadgeUrl: string | undefined,
  binderBadgeUrl: string | undefined,
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

  // handle shortcut options for binder
  /**
   * github: owner/repo | url
   * binder: url
   * thebe: true
   *
   * OR
   *
   * github: owner/repo | url
   * binder: url
   * thebe:
   *   binder: true
   */
  if (binder === true || (fm === true && (githubBadgeUrl || binderBadgeUrl))) {
    thebeOptions.useBinder = true;

    if (githubBadgeUrl || binderBadgeUrl) {
      const isValidBinderUrl = binderBadgeUrl ? extractBinderRepoInfo(binderBadgeUrl) : false;
      if (isValidBinderUrl) {
        const { binderUrl, owner, repo, ref } = isValidBinderUrl;
        thebeOptions.binderOptions = {
          binderUrl,
          repo: `${owner}/${repo}`,
          ref,
        };
      } else if (githubBadgeUrl) {
        // TODO test for owner/repo vs url
        const isUrl = extractGithubRepoInfo(githubBadgeUrl);
        if (isUrl != null) {
          const { owner, repo } = isUrl;
          thebeOptions.binderOptions = {
            repo: `${owner}/${repo}`,
            ref: 'HEAD',
          };
        } else if (githubBadgeUrl.split('/').length === 2) {
          // assume owner/repo
          thebeOptions.binderOptions = {
            repo: githubBadgeUrl,
            ref: 'HEAD',
          };
        } else {
          console.debug(
            'myst-theme:thebeFrontmatterToOptions looks like an invalid github frontmatter value',
            githubBadgeUrl,
          );
          console.debug('myst-theme:thebeFrontmatterToOptions cannot connect to binder');
          thebeOptions.useBinder = false;
        }
      }
    }
  } else if (isObject(binder)) {
    // handle fully specified binder options
    thebeOptions.useBinder = true;
    const { url, ref, provider, repo } = binder as BinderHubOptions;
    thebeOptions.binderOptions = {
      ref,
      repo,
    };
    if (url) thebeOptions.binderOptions.binderUrl = url;
    if (provider) thebeOptions.binderOptions.repoProvider = provider;
  }

  // handle jupyterlite
  /**
   * thebe:
   *   lite: true
   */
  if (lite === true) {
    thebeOptions.useJupyterLite = true;
  }

  // handle shortcut options for direct server, which really is the fallback for any shortcut option
  /**
   * github: undefined
   * binder: undefined
   * thebe: true
   *
   * OR
   *
   * github: undefined
   * binder: undefined
   * thebe:
   *   server: true
   */
  if (isObject(server)) {
    // handle fully specified server object
    const { url, token } = server as JupyterServerOptions;
    thebeOptions.serverSettings = {};
    if (url) thebeOptions.serverSettings.baseUrl = url;
    if (token) thebeOptions.serverSettings.token = token;
  }
  // else if (fm === true || server === true || !server) => do nothing - just return / fall though for defaults
  return thebeOptions;
}

export function makeThebeOptions(
  project: ManifestProject,
  optionsOverrideFn = (opts?: ExtendedCoreOptions) => opts,
): {
  options?: ExtendedCoreOptions;
  githubBadgeUrl?: string;
  binderBadgeUrl?: string;
} {
  if (!project) return {};
  const thebeFrontmatter = project?.thebe;
  const githubBadgeUrl = project?.github;
  const binderBadgeUrl = project?.binder;
  const optionsFromFrontmatter = thebeFrontmatterToOptions(
    thebeFrontmatter,
    githubBadgeUrl,
    binderBadgeUrl,
  );

  const options = optionsOverrideFn(optionsFromFrontmatter);

  return {
    options,
    githubBadgeUrl,
    binderBadgeUrl,
  };
}
