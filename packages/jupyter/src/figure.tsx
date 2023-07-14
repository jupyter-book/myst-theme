import { SourceFileKind, type GenericNode } from 'myst-common';
import { DEFAULT_RENDERERS } from 'myst-to-react';
import { OutputDecoration } from './decoration';

export function Figure(node: GenericNode, children: React.ReactNode) {
  const { container } = DEFAULT_RENDERERS;
  console.log('container', node);
  const isFromJupyer = node.source?.kind === SourceFileKind.Notebook;
  const output = node.children?.find((child) => child.type === 'output');
  console.log('output', children);
  if (isFromJupyer && !!output) {
    return (
      <OutputDecoration
        key={node.key}
        outputId={output.id}
        title={node.source?.title}
        url={node.source?.url}
      >
        {children}
      </OutputDecoration>
    );
  }

  return container(node, children);
}
