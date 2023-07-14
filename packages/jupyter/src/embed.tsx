import { type GenericNode } from 'myst-common';
import { select } from 'unist-util-select';
import { JupyterOutput } from './output';
import { OutputDecoration } from './decoration';

export function Embed(node: GenericNode, children: React.ReactNode) {
  // TODO do we need to select or is the output expected to be the first/only child?
  const output = select('output', node) as GenericNode;
  if (!output) return <>{children}</>;
  // TODO maybe we just call Output(node) here?
  return (
    <OutputDecoration
      key={node.key}
      outputId={output.id}
      title={node.source?.title}
      url={node.source?.url}
    >
      <JupyterOutput
        outputId={output.id}
        identifier={output.identifier}
        align={node.align}
        data={node.data}
      />
    </OutputDecoration>
  );
}
