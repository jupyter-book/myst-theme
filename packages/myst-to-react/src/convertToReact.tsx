import React, { createElement as e } from 'react';
import { useNodeRenderers, type NodeRenderer } from '@myst-theme/providers';
import type { GenericNode } from 'myst-common';

function DefaultComponent({ node }: { node: GenericNode }) {
  if (!node.children) return <span>{node.value}</span>;
  return (
    <div>
      <MySTChildren node={node} />
    </div>
  );
}

export function toReact(
  fragment: GenericNode[],
  replacements: Record<string, NodeRenderer>,
): React.ReactNode {
  if (fragment.length === 0) return undefined;
  return fragment.map((node) => {
    if (node.type === 'text') return node.value;
    const Component = replacements[node.type] as NodeRenderer | undefined;
    if (Component) {
      return <Component key={node.key} node={node} />;
    }
    return <DefaultComponent key={node.key} node={node} />;
  });
}

export function MySTChildren({ nodes }: { nodes?: GenericNode[] }) {
  const renderers = useNodeRenderers();
  return toReact(nodes ?? [], renderers ?? {});
}

export function mystToReact(
  content: GenericNode,
  replacements: Record<string, NodeRenderer>,
): React.ReactNode {
  return toReact(content.children ?? [], replacements);
}
