import pkg from './package.json' with { type: 'json' };
import { writeFile, mkdir } from 'node:fs/promises';

const producerLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}/": { singleton: true, requiredVersion: "${constraint}" },`,
);
const producerBody = '{' + producerLines.join('\n') + '}';

const consumerLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}/": {
    version: "${constraint.replace(/^\^/, '')}",
    get: () => import("${name}").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "${constraint}" },
},`,
);
const consumerBody = '{' + consumerLines.join('\n') + '}';

const moduleBody = `
import type {
  ShareArgs ,
} from '@module-federation/runtime-core/types';
import type {
  ModuleFederationOptions
} from '@module-federation/vite'

export const consumerConfig: Record<string, ShareArgs> = ${consumerBody};
export const producerConfig: Required<ModuleFederationOptions['shared']> = ${producerBody};`;

await mkdir('src', { recursive: true });
await writeFile('src/index.ts', moduleBody);
