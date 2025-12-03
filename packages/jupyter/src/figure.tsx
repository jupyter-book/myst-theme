import { SourceFileKind } from 'myst-spec-ext';
import { type GenericNode } from 'myst-common';
import { DEFAULT_RENDERERS, MyST } from 'myst-to-react';
import classNames from 'classnames';
import { OutputDecoration } from './decoration.js';
import { OutputsContextProvider } from './providers.js';

type NodeWithId = GenericNode & { id: string };

export function Figure({ node }: { node: GenericNode }) {
  const { base: Container } = DEFAULT_RENDERERS['container'];
  const isFromJupyer = node.source?.kind === SourceFileKind.Notebook;

  const output = node.children?.find((child) => child.type === 'output') as NodeWithId | undefined;
  const outputs = node.children?.find((child) => child.type === 'outputs') as
    | NodeWithId
    | undefined;

  if (isFromJupyer) {
    if (outputs) {
      const placeholder = node.children?.find(
        (child) => child.type === 'image' && child.placeholder,
      );
      const others = node.children?.filter(
        (child) => !(child.type === 'image' && child.placeholder),
      );
      return (
        <figure
          id={node.html_id || node.identifier || node.key}
          className={classNames('myst-jp-figure', { subcontainer: node.subcontainer }, node.class)}
        >
          <OutputDecoration
            key={node.key}
            outputId={outputs.id ?? outputs.key}
            placeholder={placeholder}
            title={node.source?.title}
            url={node.source?.url}
            remoteBaseUrl={node.source?.remoteBaseUrl}
          >
            <OutputsContextProvider outputsId={outputs.id ?? outputs.key}>
              <MyST ast={others} />
            </OutputsContextProvider>
          </OutputDecoration>
        </figure>
      );
    } else if (output) {
      return (
        <div className="border border-gred-500">
          <details>
            <summary>Legacy Output Embedded</summary>
            <pre>{JSON.stringify(output, null, 2)}</pre>
          </details>
        </div>
      );
    }
  }
  return <Container node={node} />;
}
