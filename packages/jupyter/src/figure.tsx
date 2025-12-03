import { SourceFileKind } from 'myst-spec-ext';
import { type GenericNode } from 'myst-common';
import { DEFAULT_RENDERERS, MyST } from 'myst-to-react';
import classNames from 'classnames';
import { OutputDecoration } from './decoration.js';

export function Figure({ node }: { node: GenericNode }) {
  const { base: Container } = DEFAULT_RENDERERS['container'];
  const isFromJupyer = node.source?.kind === SourceFileKind.Notebook;
  const output = node.children?.find((child) => child.type === 'output');
  if (isFromJupyer && !!output) {
    const placeholder = node.children?.find((child) => child.type === 'image' && child.placeholder);
    const others = node.children?.filter((child) => !(child.type === 'image' && child.placeholder));
    return (
      <figure
        id={node.html_id || node.identifier || node.key}
        className={classNames('myst-jp-figure', { subcontainer: node.subcontainer }, node.class)}
      >
        <OutputDecoration
          key={node.key}
          outputId={output.id ?? output.key}
          placeholder={placeholder}
          title={node.source?.title}
          url={node.source?.url}
          remoteBaseUrl={node.source?.remoteBaseUrl}
        >
          <MyST ast={others} />
        </OutputDecoration>
      </figure>
    );
  }
  return <Container node={node} />;
}
