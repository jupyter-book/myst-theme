import type { GenericNode, GenericParent } from 'myst-common';
import { extractPart } from 'myst-common';
import type { PageLoader } from '@myst-theme/common';
import { normalizeBaseurl } from '@myst-theme/providers';
import type { SiteAction, SiteManifest } from 'myst-config';

export function getDomainFromRequest(request: Request) {
  const url = new URL(request.url);
  const domain = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
  return domain;
}

function normalizePublicBaseUrl(value: string, source: string): string | undefined {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) {
    throw new Error(
      `${source} must be an absolute http(s) URL without a query or fragment: ${value}`,
    );
  }
  return normalizeBaseurl(url.href) ?? url.href;
}

function getConfiguredSiteUrl(): string | undefined {
  if (process.env.BASE_URL) {
    return normalizePublicBaseUrl(process.env.BASE_URL, 'BASE_URL');
  }
  if (process.env.READTHEDOCS_CANONICAL_URL) {
    return normalizePublicBaseUrl(
      process.env.READTHEDOCS_CANONICAL_URL,
      'READTHEDOCS_CANONICAL_URL',
    );
  }
  return undefined;
}

/**
 * Return the routing and asset prefix configured for this deployment.
 */
export function getBaseUrl(_config?: SiteManifest): string | undefined {
  const siteUrl = getConfiguredSiteUrl();
  if (siteUrl) return normalizeBaseurl(new URL(siteUrl).pathname) || undefined;
  return normalizeBaseurl(process.env.BASE_URL) || undefined;
}

/**
 * Resolve the full public base URL used by generated site files.
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
