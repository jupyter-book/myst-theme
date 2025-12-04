import { type GenericNode } from 'myst-common';
import { OutputDecoration } from './decoration.js';
import { MyST } from 'myst-to-react';
import { OutputsContextProvider } from './providers.js';

type NodeWithId = GenericNode & { id: string };

export function Embed({ node }: { node: GenericNode }) {
  const output = node.children?.find((child) => child.type === 'output') as NodeWithId | undefined;
  const outputs = node.children?.find((child) => child.type === 'outputs') as
    | NodeWithId
    | undefined;

  if (outputs) {
    return (
      <OutputDecoration
        key={node.key}
        outputId={outputs.id ?? outputs.key}
        title={node.source?.title}
        url={node.source?.url}
        remoteBaseUrl={node.source?.remoteBaseUrl}
      >
        <OutputsContextProvider outputsId={outputs.id ?? outputs.key}>
          <MyST ast={node.children} />
        </OutputsContextProvider>
      </OutputDecoration>
    );
  } else if (output) {
    return (
      <OutputsContextProvider outputsId={output.key}>
        <MyST ast={node.children} />
      </OutputsContextProvider>
    );
  }

  return <MyST ast={node.children} />;
}
