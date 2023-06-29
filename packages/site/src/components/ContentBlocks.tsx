import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import { SourceFileKind } from 'myst-common';
import type { GenericParent } from 'myst-common';
import { useNodeRenderers } from '@myst-theme/providers';
import classNames from 'classnames';
import {
  ClearNotebookCell,
  RunNotebookCell,
  RunNotebookCellSpinnerOnly,
} from './controls/NotebookCellControls';
import { useIsAComputableCell } from '@myst-theme/jupyter';

function isACodeCell(node: GenericParent) {
  return (
    node &&
    node.type === 'block' &&
    node.children &&
    node.children?.length === 2 &&
    node.children[0].type === 'code' &&
    node.children[1].type === 'output'
  );
}

function Block({
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
  const renderers = useNodeRenderers() ?? DEFAULT_RENDERERS;
  const children = useParse(node, renderers);
  const subGrid = 'article-grid article-subgrid-gap col-screen';
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));
  return (
    <div
      key={id}
      id={id}
      className={classNames('relative group/block', className, dataClassName, {
        [subGrid]: !noSubGrid,
      })}
    >
      {pageKind === SourceFileKind.Notebook && isACodeCell(node) && (
        <>
          <div className="flex sticky top-[80px] z-20 opacity-70 group-hover/block:opacity-100 group-hover/block:hidden">
            <div className="absolute top-0 -right-[28px] flex md:flex-col">
              <RunNotebookCellSpinnerOnly id={id} />
            </div>
          </div>
          <div className="hidden sticky top-[80px] z-20 opacity-70 group-hover/block:opacity-100 group-hover/block:flex">
            <div className="absolute top-0 -right-[28px] flex md:flex-col">
              <RunNotebookCell id={id} />
              <ClearNotebookCell id={id} />
            </div>
          </div>
        </>
      )}
      {children}
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
      {blocks.map((node) => (
        <Block key={node.key} id={node.key} pageKind={pageKind} node={node} className={className} />
      ))}
    </>
  );
}
