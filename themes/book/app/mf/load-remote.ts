/**
 * Module Federation loader, taken from https://github.com/gioboa/module-federation-vite-examples/blob/113597cd0f012c87b5726b3029b1c2a09d6bad5e/tanstack/dynamic-host/src/mf/load-remote.ts
 *
 * Authored by @gioboa on GitHub
 */
import type { ComponentType } from 'react';
import { withBaseurl } from '@myst-theme/providers';
import * as React from 'react';
import { createInstance, type ModuleFederation } from '@module-federation/runtime';
import { hostRuntimeShared } from '@myst-theme/federation';
import type { Remote } from './server.js';

export type RemoteComponentModule = { default: ComponentType };

// One promise per module id, shared by the route loader, React.lazy and the
// client entry, so the server and the hydrating client resolve the same module.
const cache = new Map<string, Promise<RemoteComponentModule>>();

console.log('host', React.version);
/**
 * Remotes may be defined relative to the host.
 * We need to resolve that at runtime. The SSR pathway
 * does not need this, because we will directly query the CDN.
 */
function adaptClientRemotes(remotes: Remote[], baseURL: string) {
  return remotes.map((remote) => {
    if (remote.entry.startsWith('/')) {
      return { ...remote, entry: withBaseurl(remote.entry.slice(1), `${baseURL}/`) };
    } else {
      return remote;
    }
  });
}

let _instance: ModuleFederation | undefined;
export async function getFederationInstance(
  remotes: Remote[],
  baseURL: string,
): Promise<ModuleFederation> {
  if (_instance) {
    return _instance;
  }

  if (import.meta.env.SSR) {
    const { adaptSSRRemotes, createSSREntryLoader } = await import('./server');
    // Server: no plugin-created instance exists, use our own.
    _instance = createInstance({
      name: 'book-theme',
      remotes: await adaptSSRRemotes(remotes),
      shared: hostRuntimeShared,
      plugins: [createSSREntryLoader()],
    });
  } else {
    _instance = createInstance({
      name: 'book-theme',
      remotes: adaptClientRemotes(remotes, baseURL),
      shared: hostRuntimeShared,
      plugins: [],
    });
  }

  return _instance;
}

async function load(
  id: string,
  remotes: Remote[],
  baseURL: string,
): Promise<RemoteComponentModule> {
  const instance = await getFederationInstance(remotes, baseURL);
  const module = await instance.loadRemote<RemoteComponentModule>(id);

  if (!module) throw new Error(`Remote module "${id}" could not be loaded`);
  return module;
}

/**
 * Load federated remote module.
 * The returned Promise is stable; if this remote has already been requested,
 * the same promise is returned.
 */
export function loadRemoteModule(
  id: string,
  remotes: Remote[],
  baseURL: string,
): Promise<RemoteComponentModule> {
  console.log('LOAD', baseURL);
  let promise = cache.get(id);
  if (!promise) {
    promise = load(id, remotes, baseURL);
    promise.catch(() => cache.delete(id));
    cache.set(id, promise);
  }
  return promise;
}
