import type { GenericNode, GenericParent } from 'myst-common';
import { extractPart, resolveBaseUrl } from 'myst-common';
import type { PageLoader } from '@myst-theme/common';
import type { SiteAction, SiteManifest } from 'myst-config';

export function getDomainFromRequest(request: Request) {
  const url = new URL(request.url);
  const domain = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
  return domain;
}

function getConfiguredSiteUrl(): string | undefined {
  if (process.env.BASE_URL) {
    return resolveBaseUrl(process.env.BASE_URL).publicUrl;
  }
  if (process.env.READTHEDOCS_CANONICAL_URL) {
    return resolveBaseUrl(process.env.READTHEDOCS_CANONICAL_URL, 'READTHEDOCS_CANONICAL_URL')
      .publicUrl;
  }
  return undefined;
}

/**
 * Return the routing and asset prefix configured for this deployment.
 * Prefer an absolute BASE_URL so generated site files also use the public origin.
 */
export function getBaseUrl(_config?: SiteManifest): string | undefined {
  if (process.env.BASE_URL) return resolveBaseUrl(process.env.BASE_URL).pathname;
  return resolveBaseUrl(process.env.READTHEDOCS_CANONICAL_URL, 'READTHEDOCS_CANONICAL_URL')
    .pathname;
}

/**
 * Resolve the full public base URL used by generated site files.
 * An absolute BASE_URL is preferred; a path-only BASE_URL retains request-origin behavior.
 */
export function getSiteUrl(request: Request, _config?: SiteManifest) {
  const siteUrl = getConfiguredSiteUrl();
  return siteUrl ?? `${getDomainFromRequest(request)}${getBaseUrl() ?? ''}`;
}

export type KnownParts = {
  abstract?: GenericParent;
  summary?: GenericParent;
  keypoints?: GenericParent;
  data_availability?: GenericParent;
  acknowledgments?: GenericParent;
};

export function extractKnownParts(
  tree: GenericParent,
  parts?: Record<string, { mdast?: GenericParent }>,
): KnownParts {
  const abstract = extractPart(tree, 'abstract');
  const summary = extractPart(tree, 'summary', { requireExplicitPart: true });
  const keypoints = extractPart(tree, ['keypoints'], { requireExplicitPart: true });
  const data_availability = extractPart(tree, ['data_availability', 'data availability']);
  const acknowledgments = extractPart(tree, ['acknowledgments', 'acknowledgements']);
  const otherParts = Object.fromEntries(
    Object.entries(parts ?? {}).map(([k, v]) => {
      return [k, v.mdast];
    }),
  );
  return { abstract, summary, keypoints, data_availability, acknowledgments, ...otherParts };
}

/**
 * Combines the project downloads and the export options
 */
export function combineDownloads(
  siteDownloads: SiteAction[] | undefined,
  pageFrontmatter: PageLoader['frontmatter'],
) {
  if (pageFrontmatter.downloads) {
    return pageFrontmatter.downloads;
  }
  // No downloads on the page, combine the exports if they exist
  if (siteDownloads) {
    return [...(pageFrontmatter.exports ?? []), ...siteDownloads];
  }
  return pageFrontmatter.exports;
}

/**
 * This returns the contents of a part that we want to render (not the root or block, which are already wrapped)
 * This also fixes a bug that the key is not defined on a block.
 */
export function getChildren(content?: GenericParent): GenericNode | GenericNode[] {
  if (
    content?.type === 'root' &&
    content.children?.length === 1 &&
    content.children[0].type === 'block'
  ) {
    return content.children[0].children as GenericNode[];
  }
  return content as GenericNode;
}
