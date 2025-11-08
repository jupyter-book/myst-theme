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
import type { NodeRenderers } from '@myst-theme/providers';

export function NotebookBlock({ node, className }: { node: GenericParent; className?: string }) {
  const pageKind = usePageKind();
  const block = (
    <div
      id={node.html_id ?? node.identifier ?? node.key}
      className={classNames('relative group/block', className, node.class, {
        [node.data?.class]: typeof node.data?.class === 'string',
        hidden: node.visibility === 'remove',
      })}
    >
      {pageKind === SourceFileKind.Notebook && node.kind === 'notebook-code' && (
        <>
          <div className="flex sticky top-[115px] z-10 opacity-90 group-hover/block:opacity-100 group-hover/block:hidden">
            <div className="flex absolute top-0 right-0">
              <NotebookRunCellSpinnerOnly id={`spinner-${node.key}`} />
            </div>
          </div>
          {/* Use opacity-0 instead of hidden to keep buttons in DOM layout.*/}
          <div className="sticky top-[80px] z-10 opacity-0 group-hover/block:opacity-100 group-hover/block:flex">
            <div className="absolute top-0 -right-[28px] flex md:flex-col">
              <NotebookRunCell id={`run-${node.key}`} />
              <NotebookClearCell id={`clear-${node.key}`} />
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
    'block[kind=notebook-code],block[kind=notebook-content]': NotebookBlock,
  },
};
