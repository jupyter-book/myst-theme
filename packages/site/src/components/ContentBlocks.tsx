import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { GenericNode, GenericParent } from 'myst-common';
import type { NodeRenderer } from '@myst-theme/providers';
import { useNodeRenderers } from '@myst-theme/providers';
import classNames from 'classnames';
import { useCellRefRegistry } from '../pages/NotebookProvider';
import { CellRun } from './CellRun';

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
        {/* <div className="rounded bg-blue-500 text-xs text-white px-2 py-1">
          [CODE] block id: {parentId} | node.id: {node.id ?? 'none'} | node.key:{' '}
          {node.key ?? 'none'}
        </div> */}
        {code}
        {node.kind !== 'inline' && <CellRun id={parentId} />}
      </div>
    );
  };
}

function activeOutputRendererFactory(parentId: string, BaseRenderer: NodeRenderer<any>) {
  // TODO could take a prop here to show some UI to start compute etc...
  // then the output is rendered in isolation, without it's code cell
  return function ActiveOutput(node: GenericNode) {
    const { register } = useCellRefRegistry();
    const output = BaseRenderer(node);
    return (
      <div
        className="not-prose"
        key={node.key}
        data-cell-id={parentId}
        data-mdast-node-type={node.type}
        data-mdast-node-id={node.key}
      >
        {/* <div className="rounded bg-green-500 text-xs text-white px-2 py-1">
          [OUTPUT] block id: {parentId} | node.id: {node.id} | node.key: {node.key ?? 'none'}
        </div> */}
        <div ref={register(parentId)}>{output}</div>
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

function Block({ id, node, className }: { id: string; node: GenericParent; className?: string }) {
  const { code, output, ...otherRenderers } = useNodeRenderers() ?? DEFAULT_RENDERERS;

  // TODO - do we need these wrapper components? are we able to push the custom logic
  // down into the standard code/output renderers and we decorate the node with data we need?
  const children = useParse(ensureCodeBlocksHaveAnOutput(node), {
    ...otherRenderers,
    code: activeCodeRendererFactory(id, code),
    output: activeOutputRendererFactory(id, output),
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
