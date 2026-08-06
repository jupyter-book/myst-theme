import { rename, readdir, mkdir, rm } from 'node:fs/promises';
import { relative, join } from 'node:path';

export interface ResolvedConfig {
  buildDirectory: string;
  basename: string;
}

export async function buildEnd({ reactRouterConfig }: { reactRouterConfig: ResolvedConfig }) {
  const { buildDirectory, basename } = reactRouterConfig;
  const destDirectory = process.env.MYST_BUILD_DIRECTORY;

  const buildRoot = join(buildDirectory, 'client');
  // Lift files under <BASE_URL> to the root of the build buildDirectory
  // This is an annoying react-router bug
  if (basename !== '/') {
    const contentRoot = `${buildRoot}${basename}`;

    // Move files under build
    for (const ent of await readdir(contentRoot, { recursive: true, withFileTypes: true })) {
      const filePath = join(ent.parentPath, ent.name);
      const newFilePath = join(buildRoot, relative(contentRoot, filePath));

      if (ent.isDirectory()) {
        await mkdir(newFilePath);
      } else {
        await rename(filePath, newFilePath);
      }
    }
    // Clean up by removing the base-URL directory.
    await rm(contentRoot, { recursive: true, force: true });
  }
  if (destDirectory !== undefined) {
    // Move build directory to expected location
    // We cannot just set the buildDirectory react-router config, as it breaks prerendering
    await rm(destDirectory, { recursive: true, force: true });
    await rename(buildRoot, destDirectory);
  }
}
