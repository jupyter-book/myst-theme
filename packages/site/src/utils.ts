import type { GenericNode, GenericParent } from 'myst-common';
import { extractPart } from 'myst-common';
import type { PageLoader } from '@myst-theme/common';
import type { SiteAction, SiteManifest } from 'myst-config';

export function getDomainFromRequest(request: Request) {
  const url = new URL(request.url);
  const domain = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
  return domain;
}

type SiteManifestWithCanonicalUrl = SiteManifest & { canonical_url?: string };

/**
 * Normalize an absolute public site URL for use in generated SEO files.
 */
export function normalizeCanonicalUrl(value: string, source = 'canonical site URL'): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${source} must be an absolute http(s) URL: ${value}`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${source} must use http or https: ${value}`);
  }
  if (url.search || url.hash) {
    throw new Error(`${source} must not include a query string or fragment: ${value}`);
  }
  return url.href.replace(/\/+$/, '');
}

/**
 * Resolve the full public base URL used by sitemaps and robots.txt.
 */
export function getCanonicalSiteUrl(request: Request, config?: SiteManifestWithCanonicalUrl) {
  if (process.env.SITE_URL) {
    return normalizeCanonicalUrl(process.env.SITE_URL, 'SITE_URL');
  }
  if (config?.canonical_url) {
    return normalizeCanonicalUrl(config.canonical_url, 'site.canonical_url');
  }
  if (process.env.READTHEDOCS_CANONICAL_URL) {
    return normalizeCanonicalUrl(
      process.env.READTHEDOCS_CANONICAL_URL,
      'READTHEDOCS_CANONICAL_URL',
    );
  }
  const baseUrl = process.env.BASE_URL;
  if (baseUrl && !baseUrl.startsWith('/')) {
    throw new Error(`BASE_URL must be a path beginning with "/": ${baseUrl}`);
  }
  return `${getDomainFromRequest(request)}${baseUrl?.replace(/\/$/, '') ?? ''}`;
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
