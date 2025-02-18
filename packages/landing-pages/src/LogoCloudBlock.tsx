import React, { useMemo } from 'react';
import type { GenericNode } from 'myst-common';
import { MyST } from 'myst-to-react';
import type { NodeRenderers } from '@myst-theme/providers';

import { select, selectAll, matches } from 'unist-util-select';
import { filter } from 'unist-util-filter';

import { InvalidBlock } from './InvalidBlock.js';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function LogoCloudBlock(props: Omit<LandingBlockProps, 'children'>) {
  const { node } = props;
  const { grid, body, links } = useMemo(() => {
    const gridNode = select('grid', node);
    const rawBodyNode = filter(node, (child: GenericNode) => child.type !== 'grid')!;

    const linksNode = selectAll('link[class*=button], crossReference[class*=button]', rawBodyNode);
    const bodyNodes =
      filter(
        rawBodyNode,
        (otherNode: GenericNode) =>
          !matches('link[class*=button], crossReference[class*=button]', otherNode),
      )?.children ?? [];

    return {
      body: bodyNodes,
      grid: gridNode,
      links: linksNode,
    };
  }, [node]);

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
    'block[class*=logo-cloud]': LogoCloudBlock,
  },
};
export default LOGO_CLOUD_RENDERERS;
