import React from 'react';
import { MyST } from 'myst-to-react';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function UnknownBlock(props: Omit<LandingBlockProps, 'children'> & { blockName: string }) {
  const { node, blockName } = props;
  return (
    <LandingBlock {...props}>
      <div className="relative" role="alert">
        <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
          Unknown block <span className="font-mono">{blockName}</span>
        </div>
        <div className="border border-t-0 border-red-400 rounded-b px-4 py-3">
          <MyST ast={node} />
        </div>
      </div>
    </LandingBlock>
  );
}
