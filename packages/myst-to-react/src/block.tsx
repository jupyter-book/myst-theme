import { Details } from './dropdown.js';
import { MyST } from './MyST.js';
import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import type { NodeRenderer } from '@myst-theme/providers';

export function Block({ node, className }: { node: GenericParent; className?: string }) {
  const cn = classNames(className, node.class, {
    [node.data?.class]: typeof node.data?.class === 'string',
  });
  if (node.visibility === 'remove') return null;
  // Only wrap this in a block if the block has a class name or an identifier
  // Otherwise pass through the contents as is.
  // This allows children (e.g. margin) access to the grid-system
  const block =
    cn || node.identifier ? (
      <div id={node.identifier} className={cn}>
        <MyST ast={node.children} />
      </div>
    ) : (
      <MyST ast={node.children} />
    );
  if (node.visibility === 'hide') {
    return <Details title="Block">{block}</Details>;
  }
  return block;
}

const BLOCK_RENDERERS: Record<string, NodeRenderer> = {
  block: Block,
};

export default BLOCK_RENDERERS;
