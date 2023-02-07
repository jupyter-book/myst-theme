import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { Parent } from 'myst-spec';
import { useNodeRenderers } from '@myst-theme/providers';
import classNames from 'classnames';

function Block({ id, node, className }: { id: string; node: Parent; className?: string }) {
  const renderers = useNodeRenderers() ?? DEFAULT_RENDERERS;
  const children = useParse(node, renderers);
  const subGrid = 'article-grid article-subgrid-gap col-screen';
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));
  return (
    <div
      id={id}
      className={classNames(className, dataClassName, {
        [subGrid]: !noSubGrid,
      })}
    >
      {children}
    </div>
  );
}

export function ContentBlocks({ mdast, className }: { mdast: Parent; className?: string }) {
  const blocks = mdast.children as Parent[];
  return (
    <>
      {blocks.map((node, index) => {
        return <Block key={(node as any).key} id={`${index}`} node={node} className={className} />;
      })}
    </>
  );
}
