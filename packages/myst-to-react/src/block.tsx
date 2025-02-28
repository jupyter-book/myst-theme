import { Details } from './dropdown.js';
import { MyST } from './MyST.js';
import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import { useGridSystemProvider } from '@myst-theme/providers';
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
  const grid = useGridSystemProvider();
  const subGrid = node.visibility === 'hide' ? '' : `${grid} subgrid-gap col-screen`;
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));
  const block = (
    <div
      key={`block-${id}`}
      id={id}
      className={classNames('relative group/block', className, dataClassName, {
        [subGrid]: !noSubGrid,
        hidden: node.visibility === 'remove',
      })}
    >
      <MyST ast={node.children} />
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
