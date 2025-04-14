import { useMemo } from 'react';
import type { GenericParent, GenericNode } from 'myst-common';
import { MyST } from 'myst-to-react';

import { select, selectAll, matches } from 'unist-util-select';
import { filter } from 'unist-util-filter';
import type { NodeRenderers } from '@myst-theme/providers';

import { InvalidBlock } from './InvalidBlock.js';
import { BlockHeading } from './BlockHeading.js';
import { splitByHeader } from './utils.js';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function CenteredBlock(props: Omit<LandingBlockProps, 'children'>) {
  const { node } = props;
  const { body, links, subtitle, heading } = useMemo(() => {
    const { head, body: rawBody } = splitByHeader(node);

    const linksNode = selectAll('link[class*=button], crossReference[class*=button]', rawBody);
    const subtitleNode = select('paragraph', head) as GenericParent | null;
    const headingNode = select('heading', head) as GenericParent | null;
    const bodyNodes =
      filter(
        rawBody,
        (otherNode: GenericNode) =>
          !matches('link[class*=button], crossReference[class*=button]', otherNode),
      )?.children ?? [];

    return {
      body: bodyNodes,
      links: linksNode,
      subtitle: subtitleNode,
      heading: headingNode,
    };
  }, [node]);

  if (!body) {
    return <InvalidBlock {...props} blockName="centered" />;
  }
  return (
    <LandingBlock {...props}>
      <div className="relative text-center">
        <div className="py-20 sm:py-28">
          {subtitle && (
            <p className="my-0 font-semibold text-indigo-400 uppercase">
              <MyST ast={subtitle.children} />
            </p>
          )}
          {heading && (
            <BlockHeading
              node={heading}
              className="mt-2 mb-0 text-5xl font-semibold tracking-tight"
            />
          )}
          {body && (
            <div className="mt-6">
              <MyST ast={body} />
            </div>
          )}
          {links && (
            <div className="flex flex-row flex-wrap items-center justify-center gap-4 mt-8">
              <MyST ast={links} />
            </div>
          )}
        </div>
      </div>
    </LandingBlock>
  );
}

export const CENTERED_RENDERERS: NodeRenderers = {
  block: {
    'block[kind=centered]': CenteredBlock,
  },
};
