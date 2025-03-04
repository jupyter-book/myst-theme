import { Details } from './dropdown.js';
import { MyST } from './MyST.js';
import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import { useBlockDepth, useGridSystemProvider, BlockDepthProvider } from '@myst-theme/providers';
import type { NodeRenderer } from '@myst-theme/providers';

export function Block({
  id,
  node,
  className,
}: {
  id: string;
  node: GenericParent;
  className?: string;
}) {
  const depth = useBlockDepth();
  const grid = useGridSystemProvider();
  const subGrid = node.visibility === 'hide' ? '' : `${grid} subgrid-gap col-screen`;
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    depth > 0 ||
    (dataClassName && dataClassName.includes('col-')) ||
    (className && className.includes('col-'));
  const block = (
    <div
      key={`block-${id}`}
      id={id}
      className={classNames('relative group/block', className, dataClassName, {
        [subGrid]: !noSubGrid,
        hidden: node.visibility === 'remove',
      })}
    >
      <BlockDepthProvider depth={depth + 1}>
        <MyST ast={node.children} />
      </BlockDepthProvider>
    </div>
  );
  if (node.visibility === 'hide') {
    return <Details title="Block">{block}</Details>;
  }
  return block;
}

export const BlockRenderer: NodeRenderer = ({ node, className }) => {
  return (
    <Block key={node.key} id={node.key} node={node} className={classNames(node.class, className)} />
  );
};

const BLOCK_RENDERERS: Record<string, NodeRenderer> = {
  block: BlockRenderer,
};

export default BLOCK_RENDERERS;
