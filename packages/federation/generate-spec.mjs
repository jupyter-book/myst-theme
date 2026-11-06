/**
 * Typical MF configurations only need remote and host configurations
 * that need to be authored:
 *
 * 1. Host build time — when the host app is being compiled
 * 2. Remote build time — when the remote extension is being compiled
 *
 * The host and remote are two different sides of the contract. The host consumes code provided by the remote (and, via shared modules, vice-versa). The mechanisms to do this are mostly configured at build-time. The host needs to know *which* remotes to load. This is not know ahead of time, so it is configured at runtime.
 *
 * Once we bring SSR into the picture, the Vite MF build plugin does not create a global Module Federation runtime that we can use to register remotes. For this reason, we do not use the Module Federation Vite plugin on the host. Instead, we set up a runtime ourselves.
 */
import pkg from './package.json' with { type: 'json' };
import { writeFile, mkdir } from 'node:fs/promises';

const hostRuntimeSharedLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}": {
    version: "${constraint.replace(/^\^/, '')}",
    get: () => import("${name}").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "${constraint}" },
},`,
);
const hostRuntimeSharedBody = '{' + hostRuntimeSharedLines.join('\n') + '}';

const moduleBody = `
import type {
  ShareArgs ,
} from '@module-federation/runtime-core/types';
import type {
  ModuleFederationOptions
} from '@module-federation/vite'

export const hostRuntimeShared: Record<string, ShareArgs> = ${hostRuntimeSharedBody};

export type PackageJSON = {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

export const SHARED_PACKAGES = ${JSON.stringify(Array.from(Object.keys(pkg.peerDependencies)))}

export function buildRemoteShared(pkg: PackageJSON): Required<ModuleFederationOptions['shared']> {
    const dependencies = {...(pkg.dependencies ?? {}), ...(pkg.peerDependencies ?? {})};
    // Ensure core dependencies are host provided
    const entries = (
        SHARED_PACKAGES.filter(name => name in dependencies).map(name => [
          name, { singleton: true, import: false, requiredVersion: dependencies[name].replace(/^~/, '^')}
        ])
    )
    // TODO allow extensions to provide their own dependencies
    return Object.fromEntries(entries)
}
`;

await mkdir('src', { recursive: true });
await writeFile('src/index.ts', moduleBody);
