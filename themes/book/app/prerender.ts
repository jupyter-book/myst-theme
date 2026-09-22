import { prerender } from '@myst-theme/prerender';
import fs from 'node:fs/promises';
import * as build from 'virtual:react-router/server-build';

const ASSETS_PATH = './build/client';
const OUT_PATH = process.env.BUILD_DIRECTORY;
if (OUT_PATH === undefined) {
  throw new Error('Missing build path');
}

await fs.rm(OUT_PATH);
await fs.cp(ASSETS_PATH, OUT_PATH, { recursive: true });

await prerender(build, OUT_PATH);
