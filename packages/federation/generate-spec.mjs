/**
 * Typical MF configurations only need remote and host configurations 
 * that need to be authored.
 * However, our Module Federation setup has three distinct configurations:
 *
 * 1. Host build time — when the host app is being compiled
 * 2. Host SSR runtime — when the host app is running via SSR
 * 3. Remote build time — when the remote extension is being compiled
 *
 * The host and remote are two different sides of the contract. The host consumes code provided by the remote (and, via shared modules, vice-versa). The mechanisms to do this are mostly configured at build-time. The host needs to know *which* remotes to load. This is not know ahead of time, so it is configured at runtime.
 *
 * Once we bring SSR into the picture, the Vite MF build plugin does not create a global Module Federation runtime that we can use to register remotes. So, we create an MF instance for SSR that we manually register our shared packages with.
 *
 * It might be possible to remove the build-time configuration for this altogether, in the host. Let's see.
 *
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

const hostBuildSharedLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}": { singleton: true, requiredVersion: "${constraint}" },`,
);
const hostBuildSharedBody = '{' + hostBuildSharedLines.join('\n') + '}';

const moduleBody = `
import type {
  ShareArgs ,
} from '@module-federation/runtime-core/types';
import type {
  ModuleFederationOptions
} from '@module-federation/vite'

export const hostRuntimeShared: Record<string, ShareArgs> = ${hostRuntimeSharedBody};
export const hostBuildShared: Required<ModuleFederationOptions['shared']> = ${hostBuildSharedBody};

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
