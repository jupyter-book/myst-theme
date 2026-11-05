import { prerender } from '@myst-theme/prerender';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as build from 'virtual:react-router/server-build';

const CLIENT_PATH = path.join(path.dirname(import.meta.dirname), 'client');
const OUT_PATH = process.env.BUILD_DIRECTORY;
if (OUT_PATH === undefined) {
  throw new Error('Missing build path');
}

await fs.rm(OUT_PATH, { recursive: true, force: true });
await fs.cp(CLIENT_PATH, OUT_PATH, { recursive: true });

await prerender(build, OUT_PATH);
