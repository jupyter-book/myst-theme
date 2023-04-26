import type { NodeRenderer } from '@myst-theme/providers';
import { InlineError } from './inlineError';

export const InlineExpression: NodeRenderer = (node, children) => {
  if (!node.result) {
    return <InlineError value={`Unexecuted inline expression for: ${node.value}`} />;
  }
  if (node.result?.status !== 'ok') {
    return <InlineError value={`${node.result?.ename}: ${node.result?.evalue}`} />;
  }
  // TODO: something with Thebe in the future!
  return (
    <span key={node.key} title={`Evaluated from: "${node.value}"`}>
      {children}
    </span>
  );
};

const INLINE_EXPRESSION_RENDERERS = {
  inlineExpression: InlineExpression,
};

export default INLINE_EXPRESSION_RENDERERS;
