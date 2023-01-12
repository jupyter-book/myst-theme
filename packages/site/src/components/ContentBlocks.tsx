import { useParse, DEFAULT_RENDERERS } from 'myst-to-react';
import type { Parent } from 'myst-spec';
import { useNodeRenderers } from '@myst-theme/providers';

function Block({ id, node }: { id: string; node: Parent }) {
  const renderers = useNodeRenderers() ?? DEFAULT_RENDERERS;
  const children = useParse(node, renderers);
  return <div id={id}>{children}</div>;
}

export function ContentBlocks({ mdast }: { mdast: Parent }) {
  const blocks = mdast.children as Parent[];
  return (
    <>
      {blocks.map((node, index) => {
        return <Block key={(node as any).key} id={`${index}`} node={node} />;
      })}
    </>
  );
}
