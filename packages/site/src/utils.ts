import type { GenericNode, GenericParent } from 'myst-common';
import { extractPart } from 'myst-common';
import type { PageLoader } from '@myst-theme/common';
import type { SiteAction } from 'myst-config';
import { executableNodesFromBlock } from '@myst-theme/jupyter';

export function getDomainFromRequest(request: Request) {
  const url = new URL(request.url);
  const domain = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
  return domain;
}

export type KnownParts = {
  abstract?: GenericParent;
  summary?: GenericParent;
  keypoints?: GenericParent;
  data_availability?: GenericParent;
  acknowledgments?: GenericParent;
};

export function extractKnownParts(tree: GenericParent): KnownParts {
  const abstract = extractPart(tree, 'abstract');
  const summary = extractPart(tree, 'summary', { requireExplicitPart: true });
  const keypoints = extractPart(tree, ['keypoints'], { requireExplicitPart: true });
  const data_availability = extractPart(tree, ['data_availability', 'data availability']);
  const acknowledgments = extractPart(tree, ['acknowledgments', 'acknowledgements']);
  return { abstract, summary, keypoints, data_availability, acknowledgments };
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

export function isACodeCell(node: GenericParent) {
  return !!executableNodesFromBlock(node);
}
