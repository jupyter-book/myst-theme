import { MyST } from 'myst-to-react';
import { LandingBlock, type LandingBlockProps } from './LandingBlock.js';

export function InvalidBlock(props: Omit<LandingBlockProps, 'children'> & { blockName: string }) {
  const { node, blockName } = props;
  return (
    <LandingBlock {...props}>
      <div className="myst-landing-invalid relative" role="alert">
        <div className="myst-landing-invalid-header px-4 py-2 font-bold text-white bg-myst-error rounded-t">
          Invalid block <span className="font-mono">{blockName}</span>
        </div>
        <div className="myst-landing-invalid-border border border-t-0 border-myst-error rounded-b">
          <div className="myst-landing-invalid-message px-4 py-3 text-myst-error-text bg-myst-error-bg">
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
