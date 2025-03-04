import { Details, MyST } from 'myst-to-react';
import { SourceFileKind } from 'myst-spec-ext';
import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import {
  NotebookClearCell,
  NotebookRunCell,
  NotebookRunCellSpinnerOnly,
} from './controls/index.js';
import { usePageKind } from '@myst-theme/providers';
import type { NodeRenderers, NodeRenderer } from '@myst-theme/providers';

export function NotebookBlock({
  id,
  node,
  className,
}: {
  id: string;
  node: GenericParent;
  className?: string;
}) {
  const pageKind = usePageKind();
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  const block = (
    <div
      key={`block-${id}`}
      id={id}
      className={classNames('relative group/block', className, dataClassName, {
        hidden: node.visibility === 'remove',
      })}
    >
      {pageKind === SourceFileKind.Notebook && node.kind === 'notebook-code' && (
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

export const NotebookBlockRenderer: NodeRenderer = ({ node, className }) => {
  return (
    <NotebookBlock
      key={node.key}
      id={node.key}
      node={node}
      className={classNames(node.class, className)}
    />
  );
};

/**
 * The logic for the selector is complex:
 *
 *  - MD files have `notebook-code` and otherwise blocks with no kind.
 *  - IPyNB files have both `notebook-code` and `notebook-content` blocks.
 *  - An article may contain `notebook-code` blocks from the `code-cell` directive even though it is not considered a notebook (i.e., no frontmatter kernelspec).
 *
 * This component therefore only renders for `code-cells` (both ipynb and .md) and `content-cells` (ipynb).
 *
 * The benefit of this is that we can use the block-kind to figure out if e.g. the cell is executable.
 */
export const NOTEBOOK_BLOCK_RENDERERS: NodeRenderers = {
  block: {
    'block[kind=notebook-code],block[kind=notebook-content]': NotebookBlockRenderer,
  },
};
