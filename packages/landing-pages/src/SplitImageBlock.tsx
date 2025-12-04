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

export function SplitImageBlock(props: Omit<LandingBlockProps, 'children'>) {
  const { node } = props;
  const { image, body, links, subtitle, heading } = useMemo(() => {
    const { head, body: rawBody } = splitByHeader(node);

    const linksNode = selectAll('link,crossReference', rawBody);
    const subtitleNode = select('paragraph', head) as GenericParent | null;
    const headingNode = select('heading', head) as GenericParent | null;
    const imageNode = select('image', rawBody);
    const bodyNodes =
      filter(
        rawBody,
        (otherNode: GenericNode) =>
          !matches('link[class*=button], crossReference[class*=button], image', otherNode),
      )?.children ?? [];

    return {
      body: bodyNodes,
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
      <div className="myst-landing-split-img relative rounded-md bg-stone-900 dark:bg-stone-800">
        <div className="myst-landing-split-img-image lg:absolute lg:h-full lg:w-[calc(50%)] md:absolute md:h-full md:w-[calc(100%/3)] h-80 relative [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:m-0 [&_picture]:m-0 [&_picture]:inline">
          <MyST ast={image} />
        </div>
        <div className="myst-landing-split-img-content-wrapper relative py-24">
          <div className="myst-landing-split-img-content lg:ml-auto lg:w-[calc(50%)] lg:p-8 lg:pl-24 md:ml-auto md:w-[calc(2*100%/3)] md:pl-16 md:p-8 px-6">
            {subtitle && (
              <p className="myst-landing-split-img-subtitle my-0 font-semibold prose text-indigo-400 uppercase  prose-invert">
                <MyST ast={subtitle.children} />
              </p>
            )}
            {heading && (
              <BlockHeading
                node={heading}
                className="myst-landing-split-img-heading mt-2 mb-0 text-5xl font-semibold tracking-tight text-white"
              />
            )}
            <div className="myst-landing-split-img-body mt-6">
              <MyST ast={body} className="prose prose-invert" />
            </div>
            {links && (
              <div className="myst-landing-split-img-links flex flex-row flex-wrap items-center gap-4 mt-8">
                <MyST ast={links} className="prose prose-invert" />
              </div>
            )}
          </div>
        </div>
      </div>
    </LandingBlock>
  );
}

export const SPLIT_IMAGE_RENDERERS: NodeRenderers = {
  block: {
    'block[kind=split-image]': SplitImageBlock,
  },
};
