import type { ExpandedThebeFrontmatter, JupyterServerOptions } from 'myst-frontmatter';
import type { CoreOptions } from 'thebe-core';

export type ExtendedCoreOptions = CoreOptions & {
  useBinder?: boolean;
  useJupyterLite?: boolean;
};

function isObject(maybeObject: any) {
  return typeof maybeObject === 'object' && maybeObject !== null;
}

export function thebeFrontmatterToOptions(
  fm: ExpandedThebeFrontmatter | undefined,
): ExtendedCoreOptions | undefined {
  if (fm === undefined) return undefined;

  const { binder, server, lite, kernelName, disableSessionSaving, mathjaxConfig, mathjaxUrl } =
    fm ?? {};

  const thebeOptions: ExtendedCoreOptions = { mathjaxConfig, mathjaxUrl };

  if (disableSessionSaving) {
    thebeOptions.savedSessionOptions = { enabled: false };
  }

  // handle additional options
  if (kernelName) {
    thebeOptions.kernelOptions = {
      kernelName: kernelName,
    };
  }

  if (binder) {
    thebeOptions.useBinder = true;
    const { repo, ref, url, provider } = binder;
    thebeOptions.binderOptions = { repo, ref, binderUrl: url, repoProvider: provider };
  }

  // check for juptyer lite
  if (lite === true) {
    thebeOptions.useJupyterLite = true;
  }

  // translate fm to server settings
  if (isObject(server)) {
    // handle fully specified server object
    const { url, token } = server as JupyterServerOptions;
    thebeOptions.serverSettings = {};
    if (url) thebeOptions.serverSettings.baseUrl = url;
    if (token) thebeOptions.serverSettings.token = token;
  }

  return thebeOptions;
}
