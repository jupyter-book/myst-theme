import { MyST } from 'myst-to-react';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function InvalidBlock(props: Omit<LandingBlockProps, 'children'> & { blockName: string }) {
  const { node, blockName } = props;
  return (
    <LandingBlock {...props}>
      <div className="myst-landing-invalid relative" role="alert">
        <div className="myst-landing-invalid-header px-4 py-2 font-bold text-white bg-red-500 rounded-t">
          Invalid block <span className="font-mono">{blockName}</span>
        </div>
        <div className="myst-landing-invalid-border border border-t-0 border-red-400 rounded-b ">
          <div className="myst-landing-invalid-message px-4 py-3 text-red-700 bg-red-100">
            <p>This '{blockName}' block does not conform to the expected AST structure.</p>
          </div>

          <div className="myst-landing-invalid-content px-4 py-3">
            <MyST ast={node.children} />
          </div>
        </div>
      </div>
    </LandingBlock>
  );
}
