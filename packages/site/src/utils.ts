import type { GenericParent } from 'myst-common';
import { extractPart } from 'myst-common';

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
  const summary = extractPart(tree, 'summary');
  const keypoints = extractPart(tree, 'keypoints');
  const data_availability = extractPart(tree, 'data_availability');
  const acknowledgments = extractPart(tree, 'acknowledgments');
  return { abstract, summary, keypoints, data_availability, acknowledgments };
}
