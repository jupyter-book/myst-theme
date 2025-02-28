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

export function CenteredBlock(props: Omit<LandingBlockProps, 'children'>) {
  const { node } = props;
  const { head, body: rawBody } = useMemo(() => splitByHeader(node), [node]);

  const body = useMemo(
    () =>
      filter(
        rawBody,
        (otherNode: GenericNode) => !['link', 'crossReference'].includes(otherNode.type),
      )!.children,
    [rawBody],
  );
  const links = useMemo(() => selectAll('link,crossReference', rawBody), [rawBody]);
  const subtitle = useMemo(() => select('paragraph', head) as GenericParent | null, [head]);
  const heading = useMemo(() => select('heading[depth=2]', head) as GenericParent | null, [head]);

  if (!body) {
    return <InvalidBlock {...props} blockName="justified" />;
  }
  return (
    <LandingBlock {...props}>
      <div className="relative text-center">
        <div className="py-20 sm:py-28">
          {subtitle && (
            <p className="font-semibold text-indigo-400 uppercase my-0">
              <MyST ast={subtitle.children} />
            </p>
          )}
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
          {links && (
            <div className="mt-8 flex gap-4 items-center justify-center">
              <MyST ast={links} />
            </div>
          )}
        </div>
      </div>
    </LandingBlock>
  );
}

const CENTERED_RENDERERS: NodeRenderers = {
  block: {
    'block[class~=centered]': CenteredBlock,
  },
};
export default CENTERED_RENDERERS;
