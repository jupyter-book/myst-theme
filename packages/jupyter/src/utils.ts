import type {
  Thebe,
  ThebeServerOptions,
  ThebeLocalOptions,
  ThebeBinderOptions,
} from 'myst-frontmatter';
import type { CoreOptions, RepoProvider } from 'thebe-core';

export type ExtendedCoreOptions = CoreOptions & {
  useBinder?: boolean;
  useJupyterLite?: boolean;
};

function extractGithubRepoInfo(url: string): { owner: string; repo: string } | null {
  const pattern = /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(pattern);

  if (match) {
    return {
      owner: match[1],
      repo: match[2],
    };
  }

  return null;
}

function extractBinderRepoInfo(
  url: string,
): { binderUrl: string; repoProvider: string; owner: string; repo: string; ref: string } | null {
  const pattern =
    /(https?:\/\/[^\/]+(?:\/[^\/]+)*?)\/(v\d+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
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

  const {
    binder,
    server,
    lite,
    local,
    kernelName,
    disableSessionSaving,
    mathjaxConfig,
    mathjaxUrl,
  } = (fm as Thebe | undefined) ?? {};

  const thebeOptions: ExtendedCoreOptions = { mathjaxConfig, mathjaxUrl };

  if (disableSessionSaving) {
    thebeOptions.savedSessionOptions = { enabled: false };
  }

  // handle thebe.local.*
  // as local OVERIDES other binder and server settings, handle these first
  // TODO need to expose NODE_ENV somehow via a loader
  let NODE_ENV = 'development';
  if (typeof window !== 'undefined') {
    NODE_ENV = (window as any).NODE_ENV;
  }
  if (NODE_ENV !== 'production' && local) {
    if (isObject(local)) {
      const { url, token, kernelName: localKernelName } = local as ThebeLocalOptions;
      if (url || token) {
        thebeOptions.serverSettings = {};
        if (url) thebeOptions.serverSettings.baseUrl = url;
        if (token) thebeOptions.serverSettings.token = token;
      }
      if (localKernelName) {
        thebeOptions.kernelOptions = { kernelName: localKernelName };
      }
    }
    return thebeOptions;
    // else just fall through & return - TODO return early?
  }

  // handle additional optons
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
    const { url, ref, provider, repo } = binder as ThebeBinderOptions;
    thebeOptions.binderOptions = {
      ref,
      repo,
    };
    if (url) thebeOptions.binderOptions.binderUrl = url;
    if (provider) thebeOptions.binderOptions.repoProvider = provider as unknown as RepoProvider; // ffs
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
    const { url, token } = server as ThebeServerOptions;
    thebeOptions.serverSettings = {};
    if (url) thebeOptions.serverSettings.baseUrl = url;
    if (token) thebeOptions.serverSettings.token = token;
  }
  // else if (fm === true || server === true || !server) => do nothing - just return / fall though for defaults
  return thebeOptions;
}
