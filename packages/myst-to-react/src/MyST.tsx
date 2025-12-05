import { matches } from 'unist-util-select';
import type { NodeRenderersValidated } from '@myst-theme/providers';
import { useNodeRenderers } from '@myst-theme/providers';
import type { GenericNode } from 'myst-common';
import { ASTError } from './astError.js';

function DefaultComponent({ node, className }: { node: GenericNode; className?: string }) {
  // Validate the node has basic required properties
  if (!node || typeof node !== 'object') {
    return (
      <ASTError
        node={node as GenericNode}
        title="Invalid AST Node"
        message="Encountered a malformed AST node that is not a valid object."
        debugHints={[
          'This usually indicates a parsing or serialization error.',
          'Check the content source for syntax errors.',
          'Verify that the AST was generated correctly.',
        ]}
      />
    );
  }

  if (!node.type) {
    return (
      <ASTError
        node={node}
        title="Missing Node Type"
        message="AST node is missing the required 'type' property."
        debugHints={[
          'Every AST node must have a type property.',
          'This may indicate corrupted or incomplete AST data.',
          'Check the content processing pipeline for errors.',
        ]}
      />
    );
  }

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
  if (!ast) return null;

  // Handle single node
  if (!Array.isArray(ast)) {
    try {
      const Component = selectRenderer(renderers, ast);
      return <Component key={ast.key} node={ast} className={className} />;
    } catch (error) {
      return (
        <ASTError
          node={ast}
          title="Rendering Error"
          message={`Failed to render AST node: ${error instanceof Error ? error.message : 'Unknown error'}`}
          debugHints={[
            'This node caused an error during rendering.',
            'Check if the node type is supported by your renderer configuration.',
            'Verify that the node has all required properties for its type.',
          ]}
        />
      );
    }
  }

  // Handle array of nodes
  if (ast.length === 0) return null;

  return (
    <>
      {ast.map((node, index) => {
        // Validate each node in the array
        if (!node || typeof node !== 'object') {
          const dummyNode = { type: 'invalid', key: `invalid-${index}` } as GenericNode;
          return (
            <ASTError
              key={`error-${index}`}
              node={dummyNode}
              title="Invalid Array Node"
              message={`Array contains invalid node at index ${index}.`}
              debugHints={[
                'Arrays of AST nodes should only contain valid node objects.',
                'Check for null, undefined, or primitive values in the array.',
                'This may indicate a problem with AST generation or serialization.',
              ]}
            />
          );
        }

        try {
          const Component = selectRenderer(renderers, node);
          return <Component key={node.key || `node-${index}`} node={node} className={className} />;
        } catch (error) {
          return (
            <ASTError
              key={`error-${node.key || index}`}
              node={node}
              title="Rendering Error"
              message={`Failed to render AST node: ${error instanceof Error ? error.message : 'Unknown error'}`}
              debugHints={[
                'This node caused an error during rendering.',
                'Check if the node type is supported by your renderer configuration.',
                'Verify that the node has all required properties for its type.',
              ]}
            />
          );
        }
      })}
    </>
  );
}
