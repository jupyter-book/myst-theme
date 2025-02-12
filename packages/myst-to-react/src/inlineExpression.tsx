import type { NodeRenderer } from '@myst-theme/providers';
import { InlineError } from './inlineError.js';
import { Tooltip } from './components/index.js';
import { MyST } from './MyST.js';
import classNames from 'classnames';

export const InlineExpression: NodeRenderer = ({ node, className }) => {
  if (!node.result) {
    return (
      <InlineError
        value={`Unexecuted inline expression for: ${node.value}`}
        className={className}
      />
    );
  }
  if (node.result?.status !== 'ok') {
    return (
      <InlineError value={`${node.result?.ename}: ${node.result?.evalue}`} className={className} />
    );
  }
  // TODO: something with Thebe in the future!
  return (
    <Tooltip title={<code>{node.value}</code>}>
      <span className={classNames('border-b border-dotted cursor-help', className)}>
        <MyST ast={node.children} />
      </span>
    </Tooltip>
  );
};

const INLINE_EXPRESSION_RENDERERS = {
  inlineExpression: InlineExpression,
};

export default INLINE_EXPRESSION_RENDERERS;
