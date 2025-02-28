import React, { useMemo } from 'react';
import type { GenericParent, GenericNode } from 'myst-common';
import { MyST } from 'myst-to-react';

import { select, selectAll, matches } from 'unist-util-select';
import { filter } from 'unist-util-filter';
import type { NodeRenderers } from '@myst-theme/providers';

import { InvalidBlock } from './InvalidBlock.js';
import { BlockHeading } from './BlockHeading.js';
import { splitByHeader } from './utils.js';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function JustifiedBlock(props: Omit<LandingBlockProps, 'children'>) {
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
    return <InvalidBlock {...props} blockName="justified" />;
  }
  return (
    <LandingBlock {...props}>
      <div className="py-20 sm:py-28 lg:px-8">
        {subtitle && (
          <p className="font-semibold text-indigo-400 uppercase my-0">
            <MyST ast={subtitle.children} />
          </p>
        )}
        <div className="flex flex-col lg:content-center lg:justify-between lg:flex-row">
          <div className="flex flex-col">
            {heading && (
              <BlockHeading
                node={heading}
                className="text-5xl font-semibold tracking-tight mt-2 mb-0"
              />
            )}
            {body && (
              <div className="mt-6">
                <MyST ast={body} />
              </div>
            )}
          </div>
          <div className="flex flex-col mt-8 lg:mt-0">
            {links && (
              <div className="flex flex-row gap-4 items-center">
                <MyST ast={links} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LandingBlock>
  );
}

const JUSTIFIED_RENDERERS: NodeRenderers = {
  block: {
    'block[kind=justified]': JustifiedBlock,
  },
};
export default JUSTIFIED_RENDERERS;
