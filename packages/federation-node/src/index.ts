/**
 * Server-side tooling for loading federated modules in MyST theme
 *
 * Initial implementation built from examples given by @gioboa on GitHub — thanks!
 */
import { createRequire } from 'node:module';
import ssrEntryLoader from '@module-federation/vite/ssrEntryLoader';
import { SHARED_PACKAGES, HOST_RUNTIME_SHARED } from '@myst-theme/federation';

import type { ThemeRemote } from '@myst-theme/common';
import { createInstance } from '@module-federation/runtime';
const require = createRequire(import.meta.url);

// Absolute paths of the packages the remote SSR entry imports as bare
// specifiers. The loader rewrites them to these files so the remote renders
// with the same React instance as the host (hooks and context keep working).
function resolveShared(specifiers: string[]): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const specifier of specifiers) {
    try {
      resolved[specifier] = require.resolve(specifier);
    } catch {
      // Not installed on the server: the loader leaves the specifier untouched.
    }
  }
  console.log(resolved);
  return resolved;
}

/**
 * Use Vite's SSR entry loader to rewrite entrypoints to the SSR entry
 * on the server side during SSR. Shared modules are replaced by the host's
 * own copies, including React.
 */
function createSSREntryLoader() {
  return ssrEntryLoader({
    resolvedShared: resolveShared([
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@module-federation/runtime',
      '@module-federation/sdk',
      ...SHARED_PACKAGES,
    ]),
  });
}

type Manifest = {
  exposes?: { assets?: { css?: { sync?: string[]; async?: string[] } } }[];
};

/**
 * The server generates <link> nodes, but does not fetch them. We must generate the proper
 * URL that will resolve on the client. Each MyST theme federated module is required to publish
 * the manifest alongside the entrypoint so that style URLs may be resolved.
 *
 * @params remotes remotes definition
 *
 **/
export async function getRemoteStyles(remotes: ThemeRemote[]): Promise<string[]> {
  const hrefs = await Promise.all(
    remotes.map(async (remote) => {
      // Client assets are loaded against the remote.entry, but the manifest is needed at
      // SSR time via the remote.hostEntry
      const publicEntry = new URL(remote.entry, 'https://not-a-host.com');
      const cdnEntry = remote.hostEntry;
      const manifestURL = new URL('mf-manifest.json', cdnEntry);
      try {
        const response = await fetch(manifestURL);
        if (!response.ok) return [];
        const manifest = (await response.json()) as Manifest;
        return (manifest.exposes ?? []).flatMap((expose) =>
          [...(expose.assets?.css?.sync ?? []), ...(expose.assets?.css?.async ?? [])].map(
            (file) => new URL(file, publicEntry).pathname,
          ),
        );
      } catch {
        console.error(`Unable to load manifest for ${remote.name}: ${manifestURL}`);
        return [];
      }
    }),
  );
  return [...new Set(hrefs.flat())];
}
/**
 * Adapt theme remote definitions with aliases for host-local remotes by swapping the client-local remote for the host-local remote.
 *
 * @param remotes remote definitions
 */
function adaptSSRRemotes(remotes: ThemeRemote[]): Omit<ThemeRemote, 'hostEntry'>[] {
  return remotes.map((remote) => {
    const { hostEntry, ...rest } = remote;
    return { ...rest, entry: hostEntry };
  });
}

/**
 * Load remotes using an SSR-enabled Module Federation instance.
 *
 * @param name application name
 * @param remotes remotes definitions
 */
export async function loadServerRemotes<T>(name: string, remotes: ThemeRemote[]): Promise<T[]> {
  // Server: no plugin-created instance exists, use our own.
  const instance = createInstance({
    name,
    remotes: adaptSSRRemotes(remotes),
    shared: HOST_RUNTIME_SHARED,
    plugins: [createSSREntryLoader() as any],
  });
  return Promise.all(
    remotes.map(async (remote) => {
      const module = await instance.loadRemote<T>(remote.name);
      if (!module) throw new Error(`Remote module "${remote.name}" could not be loaded`);
      return module;
    }),
  );
}
