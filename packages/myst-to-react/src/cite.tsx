import classNames from 'classnames';
import { useReferences } from '@myst-theme/providers';
import type { NodeRenderer } from '@myst-theme/providers';
import { ClickPopover } from './components/ClickPopover';
import { InlineError } from './inlineError';

function CiteChild({ label }: { label: string }) {
  const references = useReferences();
  const { html } = references?.cite?.data[label] ?? {};
  return <div dangerouslySetInnerHTML={{ __html: html || '' }} />;
}

export const CiteGroup: NodeRenderer = (node, children) => {
  return (
    <span
      key={node.key}
      className={classNames('cite-group', {
        narrative: node.kind === 'narrative',
        parenthetical: node.kind === 'parenthetical',
      })}
    >
      {children}
    </span>
  );
};

export const Cite: NodeRenderer = (node, children) => {
  if (node.error) {
    return <InlineError key={node.key} value={node.label} message={'Citation Not Found'} />;
  }
  return (
    <ClickPopover key={node.key} card={<CiteChild label={node.label as string} />}>
      {children}
    </ClickPopover>
  );
};

const CITE_RENDERERS: Record<string, NodeRenderer> = {
  citeGroup: CiteGroup,
  cite: Cite,
};

export default CITE_RENDERERS;
