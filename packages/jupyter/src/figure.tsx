import { SourceFileKind } from 'myst-spec-ext';
import { type GenericNode } from 'myst-common';
import { DEFAULT_RENDERERS, MyST } from 'myst-to-react';
import { OutputDecoration } from './decoration.js';

export function Figure({ node }: { node: GenericNode }) {
  const { container: Container } = DEFAULT_RENDERERS;
  const isFromJupyer = node.source?.kind === SourceFileKind.Notebook;
  const output = node.children?.find((child) => child.type === 'output');
  if (isFromJupyer && !!output) {
    const placeholder = node.children?.find((child) => child.type === 'image' && child.placeholder);
    const others = node.children?.filter((child) => !(child.type === 'image' && child.placeholder));
    return (
      <OutputDecoration
        key={node.key}
        outputId={output.id}
        placeholder={placeholder}
        title={node.source?.title}
        url={node.source?.url}
      >
        <MyST ast={others} />
      </OutputDecoration>
    );
  }
  return <Container node={node} />;
}
