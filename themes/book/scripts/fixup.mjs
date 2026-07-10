/**
 * react-router's pre-rendering places content under <BASE_URL>,
 * but assets under `/`.
 * We can adjust this by moving <BASE_URL> to `/`.
 */
import { rename, readdir, mkdir, rmdir } from 'node:fs/promises';
import { relative, join } from 'node:path';

const BASE_URL = process.env.BASE_URL ?? '/';
if (BASE_URL === '/') {
  process.exit(0);
}

const buildRoot = 'build/client';
const contentRoot = `${buildRoot}${BASE_URL}`;

// Move files under build
for (const ent of await readdir(contentRoot, { recursive: true, withFileTypes: true })) {
  const filePath = join(ent.path, ent.name);
  const newFilePath = join(buildRoot, relative(contentRoot, filePath));

  if (ent.isDirectory()) {
    await mkdir(newFilePath);
  } else {
    await rename(filePath, newFilePath);
  }
}
// Clean up by removing the base-URL directory.
await rmdir(contentRoot, { recursive: true, force: true });
