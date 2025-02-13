import React, { useMemo } from 'react';
import type { GenericNode } from 'myst-common';
import { MyST } from 'myst-to-react';
import type { NodeRenderers } from '@myst-theme/providers';

import { select, selectAll } from 'unist-util-select';
import { filter } from 'unist-util-filter';

import { InvalidBlock } from './InvalidBlock.js';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function LogoCloudBlock(props: Omit<LandingBlockProps, 'children'>) {
  const { node } = props;

  const grid = useMemo(() => select('grid', node), [node]);
  const rawBody = useMemo(
    () => filter(node, (child: GenericNode) => child.type !== 'grid')!,
    [node],
  );
  const body = useMemo(
    () =>
      filter(
        rawBody,
        (child: GenericNode) => child.type !== 'link' && child.type !== 'crossReference',
      )!.children,
    [rawBody],
  );
  const links = useMemo(() => selectAll('link,crossReference', rawBody), [rawBody]);
  if (!grid) {
    return <InvalidBlock {...props} blockName="logo-cloud" />;
  }

  return (
    <LandingBlock {...props}>
      <div className="text-center py-20 sm:py-28">
        <div className="font-semibold">
          <MyST ast={body} />
        </div>
        {grid && <MyST ast={grid} />}
        {links && (
          <div className="mt-8 flex gap-4 items-center justify-center">
            <MyST ast={links} />
          </div>
        )}
      </div>
    </LandingBlock>
  );
}

const LOGO_CLOUD_RENDERERS: NodeRenderers = {
  block: {
    'block[class~=logo-cloud]': LogoCloudBlock,
  },
};
export default LOGO_CLOUD_RENDERERS;
