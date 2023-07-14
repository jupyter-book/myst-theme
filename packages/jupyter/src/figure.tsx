import { SourceFileKind, type GenericNode } from 'myst-common';
import { DEFAULT_RENDERERS, MyST } from 'myst-to-react';
import { OutputDecoration } from './decoration';

export function Figure({ node }: { node: GenericNode }) {
  const { container: Container } = DEFAULT_RENDERERS;
  const isFromJupyer = node.source?.kind === SourceFileKind.Notebook;
  const output = node.children?.find((child) => child.type === 'output');
  if (isFromJupyer && !!output) {
    return (
      <OutputDecoration
        key={node.key}
        outputId={output.id}
        title={node.source?.title}
        url={node.source?.url}
      >
        <MyST ast={node.children} />
      </OutputDecoration>
    );
  }
  return <Container node={node} />;
}
