import type { NodeRenderer } from '@myst-theme/providers';
import { InlineError } from './inlineError';
import { Tooltip } from './components';
import { MyST } from './MyST';

export const InlineExpression: NodeRenderer = ({ node }) => {
  if (!node.result) {
    return <InlineError value={`Unexecuted inline expression for: ${node.value}`} />;
  }
  if (node.result?.status !== 'ok') {
    return <InlineError value={`${node.result?.ename}: ${node.result?.evalue}`} />;
  }
  // TODO: something with Thebe in the future!
  return (
    <Tooltip title={<code>{node.value}</code>}>
      <span className="border-b border-dotted cursor-help">
        <MyST ast={node.children} />
      </span>
    </Tooltip>
  );
};

const INLINE_EXPRESSION_RENDERERS = {
  inlineExpression: InlineExpression,
};

export default INLINE_EXPRESSION_RENDERERS;
