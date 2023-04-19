import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import { useNodeRenderers, BlockContextProvider } from '@myst-theme/providers';
import classNames from 'classnames';

// maybe better in a react provider
function addParentKeyAndContext(parent: string, node: GenericParent): GenericParent {
  return {
    ...node,
    children: node.children.map((child) => ({
      ...child,
      parent,
      context: SourceFileKind.Notebook,
    })),
  };
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

  // TODO - do we need these wrapper components? are we able to push the custom logic
  // down into the standard code/output renderers and we decorate the node with data we need?
  const children = useParse(addParentKeyAndContext(id, node), renderers);
  const subGrid = 'article-grid article-subgrid-gap col-screen';
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));
  return (
    <BlockContextProvider id={id} kind={pageKind}>
      <div
        key={id}
        id={id}
        className={classNames(className, dataClassName, {
          [subGrid]: !noSubGrid,
        })}
      >
        {children}
      </div>
    </BlockContextProvider>
  );
}

export function ContentBlocks({
  name,
  pageKind,
  mdast,
  className,
}: {
  name: string;
  pageKind: KINDS;
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
