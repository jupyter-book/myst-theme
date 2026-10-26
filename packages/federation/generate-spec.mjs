import pkg from './package.json' with { type: 'json' };
import { writeFile, mkdir } from 'node:fs/promises';

const hostRuntimeSharedLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}/": {
    version: "${constraint.replace(/^\^/, '')}",
    get: () => import("${name}").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "${constraint}" },
},`,
);
const hostRuntimeSharedBody = '{' + hostRuntimeSharedLines.join('\n') + '}';

const hostBuildSharedLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}/": { singleton: true, requiredVersion: "${constraint}" },`,
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

const sharedList = ${JSON.stringify(Array.from(Object.keys(pkg.peerDependencies)))}

export function buildRemoteShared(pkg: PackageJSON): Required<ModuleFederationOptions['shared']> {
    const dependencies = {...(pkg.dependencies ?? {}), ...(pkg.peerDependencies ?? {})};
    // Ensure core dependencies are host provided
    const entries = (
        sharedList.filter(name => name in dependencies).map(name => [
          name, { singleton: true, import: false, requiredVersion: dependencies[name].replace(/^~/, '^')}
        ])
    )
    // TODO allow extensions to provide their own dependencies
    return Object.fromEntries(entries)
}
`;

await mkdir('src', { recursive: true });
await writeFile('src/index.ts', moduleBody);
