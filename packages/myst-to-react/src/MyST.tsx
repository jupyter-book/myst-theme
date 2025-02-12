import { matches } from 'unist-util-select';
import type { NodeRenderersValidated } from '@myst-theme/providers';
import { useNodeRenderers } from '@myst-theme/providers';
import type { GenericNode } from 'myst-common';

function DefaultComponent({ node, className }: { node: GenericNode; className?: string }) {
  if (!node.children) return <span className={className}>{node.value}</span>;
  return (
    <div className={className}>
      <MyST ast={node.children} />
    </div>
  );
}

export function selectRenderer(renderers: NodeRenderersValidated, node: GenericNode) {
  const componentRenderers = renderers[node.type] ?? renderers['DefaultComponent'];
  const SpecificComponent = Object.entries(componentRenderers ?? {})
    .reverse()
    .find(([selector]) => selector !== 'base' && matches(selector, node))?.[1];
  return SpecificComponent ?? componentRenderers?.base ?? DefaultComponent;
}

export function MyST({
  ast,
  className,
}: {
  ast?: GenericNode | GenericNode[];
  className?: string;
}) {
  const renderers = useNodeRenderers();
  if (!ast || ast.length === 0) return null;
  if (!Array.isArray(ast)) {
    const Component = selectRenderer(renderers, ast);
    return <Component key={ast.key} node={ast} className={className} />;
  }
  return (
    <>
      {ast?.map((node) => {
        const Component = selectRenderer(renderers, node);
        return <Component key={node.key} node={node} className={className} />;
      })}
    </>
  );
}
