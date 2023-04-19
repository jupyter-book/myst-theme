import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { GenericNode, GenericParent } from 'myst-common';
import type { NodeRenderer } from '@myst-theme/providers';
import { useNodeRenderers } from '@myst-theme/providers';
import classNames from 'classnames';
import { CellRun } from './CellRun';
import { KINDS } from '../types';

function activeCodeRendererFactory(parentId: string, BaseRenderer: NodeRenderer<any>) {
  return function ActiveCode(node: GenericNode) {
    const code = BaseRenderer(node);
    return (
      <div
        className="relative"
        key={node.key}
        data-cell-id={parentId}
        data-mdast-node-type={node.type}
        data-mdast-node-id={node.key}
      >
        {code}
        {node.kind !== 'inline' && <CellRun id={parentId} />}
      </div>
    );
  };
}

function ensureCodeBlocksHaveAnOutput(node: GenericParent) {
  if (node.children.length === 1 && node.children[0].type === 'code') {
    return {
      ...node,
      children: [
        ...node.children,
        {
          type: 'output',
          key: 'injected',
          data: [],
        },
      ],
    };
  }
  if (
    node.children.length === 2 &&
    node.children[0].type === 'code' &&
    node.children[1].type === 'output'
  )
    return node;

  return {
    ...node,
    children: node.children.map((n) => (n.type === 'code' ? { ...n, kind: 'inline' } : n)),
  };
}

function addParentKey(parent: string, node: GenericParent): GenericParent {
  return {
    ...node,
    children: node.children.map((child) => ({ ...child, parent, context: KINDS.Notebook })),
  };
}

function Block({ id, node, className }: { id: string; node: GenericParent; className?: string }) {
  const { code, ...otherRenderers } = useNodeRenderers() ?? DEFAULT_RENDERERS;

  // TODO - do we need these wrapper components? are we able to push the custom logic
  // down into the standard code/output renderers and we decorate the node with data we need?
  const children = useParse(addParentKey(id, ensureCodeBlocksHaveAnOutput(node)), {
    ...otherRenderers,
    code: activeCodeRendererFactory(id, code),
    // output: activeOutputRendererFactory(id, output),
  });
  const subGrid = 'article-grid article-subgrid-gap col-screen';
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));
  return (
    <div
      key={id}
      id={id}
      className={classNames(className, dataClassName, {
        [subGrid]: !noSubGrid,
      })}
    >
      {/* <pre className="text-xs">
        block {node.type} | # children: {node.children.length} |
        {node.children.map((n) => ` ${n.type} |`)}
      </pre> */}
      {children}
    </div>
  );
}

export function ContentBlocks({
  name,
  mdast,
  className,
}: {
  name: string;
  mdast: GenericParent;
  className?: string;
}) {
  const blocks = mdast.children as GenericParent[];
  return (
    <>
      {blocks.map((node) => (
        <Block key={node.key} id={node.key} node={node} className={className} />
      ))}
    </>
  );
}
