import { Details } from './dropdown.js';
import { MyST } from './MyST.js';
import { SourceFileKind } from 'myst-spec-ext';
import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import {
  NotebookClearCell,
  NotebookRunCell,
  NotebookRunCellSpinnerOnly,
  executableNodesFromBlock,
} from '@myst-theme/jupyter';
import { useGridSystemProvider, usePageKindProvider } from '@myst-theme/providers';
import type { NodeRenderer } from '@myst-theme/providers';

export function isACodeCell(node: GenericParent) {
  return !!executableNodesFromBlock(node);
}
export function Block({
  id,
  node,
  className,
}: {
  id: string;
  node: GenericParent;
  className?: string;
}) {
  const pageKind = usePageKindProvider();
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
      {pageKind === SourceFileKind.Notebook && isACodeCell(node) && (
        <>
          <div className="flex sticky top-[80px] z-10 opacity-70 group-hover/block:opacity-100 group-hover/block:hidden">
            <div className="absolute top-0 -right-[28px] flex md:flex-col">
              <NotebookRunCellSpinnerOnly id={id} />
            </div>
          </div>
          <div className="hidden sticky top-[80px] z-10 opacity-70 group-hover/block:opacity-100 group-hover/block:flex">
            <div className="absolute top-0 -right-[28px] flex md:flex-col">
              <NotebookRunCell id={id} />
              <NotebookClearCell id={id} />
            </div>
          </div>
        </>
      )}
      <MyST ast={node.children} />
    </div>
  );
  if (node.visibility === 'hide') {
    return <Details title="Notebook Cell">{block}</Details>;
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
