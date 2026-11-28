/**
 * Client-side tooling for loading federated modules in MyST theme
 *
 * Initial implementation built from examples given by @gioboa on GitHub — thanks!
 */
import { createInstance } from '@module-federation/runtime';
import { HOST_RUNTIME_SHARED } from '@myst-theme/federation';
import type { ThemeRemote, ConfigRemote } from '@myst-theme/common';

type RemoteResolver = (entry: ConfigRemote) => { hostEntry: string; entry: string } | undefined;

/**
 * Remotes may be defined relative to the host. To avoid fetching against a route, we directly use the CDN url for SSR.
 * But we want to provide the client with /_public` URLs, so this function is only run on the SSR host.
 *
 * @param remotes Array of remote instances
 * @param opts Options to control expansion of the remotes
 */
export function expandLocalRemotes(
  remotes: ConfigRemote[],
  opts?: { resolver?: RemoteResolver },
): ThemeRemote[] {
  return remotes.map((remote) => {
    const resolved = opts?.resolver?.(remote);
    if (resolved !== undefined) {
      return {
        ...remote,
        ...resolved,
        type: 'module',
      };
    } else {
      return { ...remote, hostEntry: remote.entry, type: 'module' };
    }
  });
}

/**
 * We do not want to rely on MF's default preloading of CSS, because it compares href attributes to determine whether the client already has the necessary link.
 * At SSR time, we cannot create an href, only a pathname, so <link href=/foo.css /> is not recognised
 * by the MF preload duplicate detection, and we end up with two CSS outputs
 */
function createCSSPreloadFilter() {
  return {
    name: 'disable-css-preload',
    beforePreloadRemote(args: any) {
      args.preloadOps.forEach((op: any) => {
        const filter = op.filter;
        op.filter = (asset: string) => (filter?.(asset) ?? true) && !asset.endsWith('.css');
      });
      return args;
    },
  };
}

/**
 * Load remotes using an regular client Module Federation instance.
 * CSS is not loaded, and should be explicitly handled by the application.
 *
 * @param name name of the application
 * @param remotes remotes definitions
 */

export async function loadClientRemotes<T>(name: string, remotes: ThemeRemote[]): Promise<T[]> {
  const instance = createInstance({
    name,
    remotes: remotes,
    shared: HOST_RUNTIME_SHARED,
    plugins: [createCSSPreloadFilter() as any],
  });
  return Promise.all(
    remotes.map(async (remote) => {
      const module = await instance.loadRemote<T>(remote.name);
      if (!module) throw new Error(`Remote module "${remote.name}" could not be loaded`);
      return module;
    }),
  );
}
