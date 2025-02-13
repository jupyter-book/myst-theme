import React, { useMemo } from 'react';
import type { GenericParent, GenericNode } from 'myst-common';
import { MyST } from 'myst-to-react';

import { select, selectAll } from 'unist-util-select';
import { filter } from 'unist-util-filter';
import type { NodeRenderers } from '@myst-theme/providers';

import { InvalidBlock } from './InvalidBlock.js';
import { BlockHeading } from './BlockHeading.js';
import { splitByHeader } from './utils.js';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function SplitImageBlock(props: Omit<LandingBlockProps, 'children'>) {
  const { node } = props;
  const { image, body, links, subtitle, heading } = useMemo(() => {
    const { head, body: rawBody } = splitByHeader(node);

    const linksNode = selectAll('link,crossReference', rawBody);
    const subtitleNode = select('paragraph', head) as GenericParent | null;
    const headingNode = select('heading[depth=2]', head) as GenericParent | null;
    const imageNode = select('image', rawBody);
    const bodyNode = filter(
      rawBody,
      (otherNode: GenericNode) => !['link', 'crossReference', 'image'].includes(otherNode.type),
    )!.children;

    return {
      body: bodyNode,
      image: imageNode,
      links: linksNode,
      subtitle: subtitleNode,
      heading: headingNode,
    };
  }, [node]);

  if (!image || !body) {
    return <InvalidBlock {...props} blockName="split-image" />;
  }

  return (
    <LandingBlock {...props}>
      <div className="relative bg-stone-900 dark:bg-stone-800 text-white rounded-md">
        <div className="lg:absolute lg:h-full lg:w-[calc(50%)] h-80 relative [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:m-0 [&_picture]:m-0 [&_picture]:inline">
          <MyST ast={image} />
        </div>
        <div className="relative py-24">
          <div className="lg:ml-auto lg:w-[calc(50%)] lg:p-8 px-6 lg:pl-24">
            {subtitle && (
              <p className="font-semibold text-indigo-400 uppercase my-0">
                <MyST ast={subtitle.children} />
              </p>
            )}
            {heading && (
              <BlockHeading
                node={heading}
                className="text-5xl text-white font-semibold tracking-tight mt-2 mb-0"
              />
            )}
            <div className="mt-6 text-gray-300">
              <MyST ast={body} />
            </div>
            {links && (
              <div className="mt-8 flex gap-4 items-center">
                <MyST ast={links} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LandingBlock>
  );
}

const SPLIT_IMAGE_RENDERERS: NodeRenderers = {
  block: {
    'block[class~=split-image]': SplitImageBlock,
  },
};
export default SPLIT_IMAGE_RENDERERS;
