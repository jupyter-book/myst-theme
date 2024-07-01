import { MyST } from 'myst-to-react';
import { SourceFileKind } from 'myst-spec-ext';
import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import {
  NotebookClearCell,
  NotebookRunCell,
  NotebookRunCellSpinnerOnly,
} from '@myst-theme/jupyter';
import { useGridSystemProvider } from '@myst-theme/providers';
import { isACodeCell } from '../utils.js';

export function Block({
  id,
  pageKind,
  node,
  className,
}: {
  id: string;
  pageKind: SourceFileKind;
  node: GenericParent;
  className?: string;
}) {
  const grid = useGridSystemProvider();
  const subGrid = `${grid} subgrid-gap col-screen`;
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));
  return (
    <div
      key={`block-${id}`}
      id={id}
      className={classNames('relative group/block', className, dataClassName, {
        [subGrid]: !noSubGrid,
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
}

export function ContentBlocks({
  mdast,
  pageKind = SourceFileKind.Article,
  className,
}: {
  mdast: GenericParent;
  pageKind?: SourceFileKind;
  className?: string;
}) {
  if (!mdast) return null;
  const blocks = mdast.children as GenericParent[];
  return (
    <>
      {blocks
        .filter((node) => node.visibility !== 'remove')
        .map((node) => (
          <Block
            key={node.key}
            id={node.key}
            pageKind={pageKind}
            node={node}
            className={className}
          />
        ))}
    </>
  );
}
