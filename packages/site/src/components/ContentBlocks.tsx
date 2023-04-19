import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { GenericParent, SourceFileKind } from 'myst-common';
import { useNodeRenderers } from '@myst-theme/providers';
import classNames from 'classnames';

// maybe better in a react provider
// function addParentKeyAndContext(parent: string, node: GenericParent): GenericParent {
//   return {
//     ...node,
//     children: node.children.map((child) => ({
//       ...child,
//       parent,
//       context: SourceFileKind.Notebook,
//     })),
//   };
// }

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
      className={classNames(className, dataClassName, {
        [subGrid]: !noSubGrid,
      })}
    >
      {children}
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
