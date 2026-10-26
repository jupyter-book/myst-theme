import pkg from './package.json' with { type: 'json' };
import { writeFile, mkdir } from 'node:fs/promises';

const sharedLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}/": { singleton: true, requiredVersion: "${constraint}" },`,
);

const producerLines = Object.entries(pkg.peerDependencies).map(
  ([name, constraint]) => `"${name}/": {
    version: "${constraint.replace(/^\^/, '')}",
    get: () => import("${name}").then(mod => () => mod),
    shareConfig: { singleton: true, requiredVersion: "${constraint}" },
},`,
);

const sharedBody = '{' + sharedLines.join('\n') + '}';
const producerBody = '{' + producerLines.join('\n') + '}';

const moduleBody = `export const shared = ${sharedBody};
export const producer = ${producerBody};`;

await mkdir('src', { recursive: true });
await writeFile('src/index.ts', moduleBody);
