import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { GenericParent, SourceFileKind } from 'myst-common';
import { useNodeRenderers } from '@myst-theme/providers';
import classNames from 'classnames';
import { ClearCell, RunCell } from './ComputeControls';

function isACodeCell(node: GenericParent) {
  return (
    node.type === 'block' &&
    node.children.length === 2 &&
    node.children[0].type === 'code' &&
    node.children[1].type === 'output'
  );
}

function Block({
  id,
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
      className={classNames('relative group', className, dataClassName, {
        [subGrid]: !noSubGrid,
      })}
    >
      {children}
      {isACodeCell(node) && (
        <div className="flex md:flex-col absolute -top-[28px] md:top-0 right-0 md:-right-[28px] mt-8">
          <RunCell id={id} />
          <ClearCell id={id} />
        </div>
      )}
    </div>
  );
}

export function ContentBlocks({
  name,
  pageKind,
  mdast,
  className,
}: {
  name: string;
  pageKind: SourceFileKind;
  mdast: GenericParent;
  className?: string;
}) {
  const blocks = mdast.children as GenericParent[];
  return (
    <>
      {blocks.map((node) => (
        <Block key={node.key} id={node.key} pageKind={pageKind} node={node} className={className} />
      ))}
    </>
  );
}
