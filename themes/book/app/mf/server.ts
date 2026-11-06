/**
 * Module Federation factory, taken from https://github.com/gioboa/module-federation-vite-examples/blob/113597cd0f012c87b5726b3029b1c2a09d6bad5e/tanstack/dynamic-host/src/mf/server.ts
 *
 * Authored by @gioboa on GitHub
 */
// Server only. Imported lazily from load-remote.ts behind `import.meta.env.SSR`.
// Nothing creates a Module Federation instance on the server when the host has
// no static `remotes`, so the global `loadRemote` throws RUNTIME-009 there.
// This module creates one with the plugin's public `ssrEntryLoader`, which
// swaps the browser remote entry for the remote's SSR entry (`remoteEntry.ssr.js`)
// and rewrites its shared imports to the host's own copies of React.
import { createRequire } from 'node:module';
import ssrEntryLoader from '@module-federation/vite/ssrEntryLoader';
import { SHARED_PACKAGES } from '@myst-theme/federation';

const require = createRequire(import.meta.url);

export type Remote = {
  name: string;
  entry: string;
  type: 'module';
};

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

export function createSSREntryLoader() {
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

/**
 * Remotes may be defined relative to the host.
 * We need to resolve that at runtime
 */
export async function adaptSSRRemotes(remotes: Remote[]) {
  const { getCDNUrl } = await import('../utils/loaders.server.js');
  return remotes.map((remote) => {
    if (remote.entry.startsWith('/')) {
      return { ...remote, entry: getCDNUrl(remote.entry.slice(1)) };
    } else {
      return remote;
    }
  });
}
