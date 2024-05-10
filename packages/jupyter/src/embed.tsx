import { type GenericNode } from 'myst-common';
import { OutputDecoration } from './decoration.js';
import { MyST } from 'myst-to-react';

export function Embed({ node }: { node: GenericNode }) {
  const output = node.children?.find((child) => child.type === 'output');
  if (!output) return <MyST ast={node.children} />;
  return (
    <OutputDecoration
      key={node.key}
      outputId={output.id}
      title={node.source?.title}
      url={node.source?.url}
      remoteBaseUrl={node.source?.remoteBaseUrl}
    >
      <MyST ast={node.children} />
    </OutputDecoration>
  );
}
