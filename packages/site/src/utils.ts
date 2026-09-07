import type { GenericNode, GenericParent } from 'myst-common';
import { extractPart } from 'myst-common';
import type { PageLoader } from '@myst-theme/common';
import { resolveSiteUrls } from 'myst-config';
import type { SiteAction, SiteManifest } from 'myst-config';

export function getDomainFromRequest(request: Request) {
  const url = new URL(request.url);
  const domain = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
  return domain;
}

export { normalizeSiteUrl } from 'myst-config';

/**
 * Return the routing and asset prefix configured for this deployment.
 */
export function getBaseUrl(config?: SiteManifest): string | undefined {
  return resolveSiteUrls({ url: config?.url, env: process.env }).baseUrl;
}

/**
 * Resolve the full public base URL used by generated site files.
 */
export function getSiteUrl(request: Request, config?: SiteManifest) {
  const { siteUrl, baseUrl } = resolveSiteUrls({ url: config?.url, env: process.env });
  return siteUrl ?? `${getDomainFromRequest(request)}${baseUrl ?? ''}`;
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
