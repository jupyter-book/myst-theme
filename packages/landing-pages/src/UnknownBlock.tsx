import { MyST } from 'myst-to-react';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function UnknownBlock(props: Omit<LandingBlockProps, 'children'> & { blockName: string }) {
  const { node, blockName } = props;
  return (
    <LandingBlock {...props}>
      <div className="relative" role="alert">
        <div className="px-4 py-2 font-bold text-white bg-red-500 rounded-t">
          Unknown block <span className="font-mono">{blockName}</span>
        </div>
        <div className="px-4 py-3 border border-t-0 border-red-400 rounded-b">
          <MyST ast={node} />
        </div>
      </div>
    </LandingBlock>
  );
}
