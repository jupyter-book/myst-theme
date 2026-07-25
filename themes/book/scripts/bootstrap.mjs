import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';

const sharedPackages = [
  '@heroicons/react',
  '@myst-theme/anywidget',
  '@myst-theme/common',
  '@myst-theme/frontmatter',
  '@myst-theme/icons',
  '@myst-theme/jupyter',
  '@myst-theme/landing-pages',
  '@myst-theme/providers',
  '@myst-theme/search',
  '@myst-theme/search-minisearch',
  '@myst-theme/site',
  '@myst-theme/styles',
  'myst-spec-ext',
  'myst-to-react',
  'myst-common',
  'myst-config',
  'myst-migrate',
  'thebe-core',
  'react',
];

const _pkgJSON = readFileSync(path.join(import.meta.dirname, '..', 'package.json'));
const pkgJSON = JSON.parse(_pkgJSON);

const sharedData = Object.fromEntries(
  sharedPackages.map((name) => {
    const _response = execSync(`bun info ${name} --json`);
    const { version } = JSON.parse(_response);
    const constraint = pkgJSON.dependencies[name];
    return [
      name,
      {
        scope: 'default',
        version,
        get: `{{ ${name} }}`,
        shareConfig: {
          singleton: true,
          import: false,
          requiredVersion: constraint.replace('^', '~'),
        },
      },
    ];
  }),
);
const sharedDataSrc = JSON.stringify(sharedData).replaceAll(
  /["']\{\{ (.*?) \}\}["']/g,
  (m, src) => {
    return `import("${src}").then(mod => () => mod)`;
  },
);

const bootstrap = `
import type { NodeRenderers } from '@myst-theme/providers';
import { createInstance } from '@module-federation/runtime';

export type Remote = {
  name: string;
  entry: string;
}

export async function loadRenderers(remotes: Remote[]): Promise<NodeRenderers> {
  const mf = createInstance({
    name: 'host',
    remotes,
    shared: ${sharedDataSrc}
  });

 return await Promise.all(
        remotes.map(r => mf.loadRemote(r.name).then((m) => m.default))
 );
}

`;

writeFileSync(path.join(import.meta.dirname, '..', 'app', 'bootstrap.ts'), bootstrap);
