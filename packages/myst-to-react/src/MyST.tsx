import { useNodeRenderers } from '@myst-theme/providers';
import type { GenericNode } from 'myst-common';

function DefaultComponent({ node }: { node: GenericNode }) {
  if (!node.children) return <span>{node.value}</span>;
  return (
    <div>
      <MyST ast={node.children} />
    </div>
  );
}

export function MyST({ ast }: { ast?: GenericNode | GenericNode[] }) {
  const renderers = useNodeRenderers();
  if (!ast || ast.length === 0) return null;
  if (!Array.isArray(ast)) {
    const Component = renderers[ast.type] ?? renderers['DefaultComponent'] ?? DefaultComponent;
    return <Component key={ast.key} node={ast} />;
  }
  return (
    <>
      {ast?.map((node) => {
        const Component = renderers[node.type] ?? DefaultComponent;
        return <Component key={node.key} node={node} />;
      })}
    </>
  );
}
