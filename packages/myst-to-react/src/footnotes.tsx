import type { GenericParent } from 'myst-common';
import type { NodeRenderer } from '@myst-theme/providers';
import { XRefProvider, useNodeRenderers, useReferences } from '@myst-theme/providers';
import { useParse } from '.';
import { ClickPopover } from './components/ClickPopover';
import { select } from 'unist-util-select';

function FootnoteDefinition({ identifier }: { identifier: string }) {
  const references = useReferences();
  const renderers = useNodeRenderers();
  const node =
    (references as any)?.footnotes?.[identifier] ??
    select(`footnoteDefinition[identifier=${identifier}]`, references?.article);
  const children = useParse(node as GenericParent, renderers);
  return <XRefProvider>{children}</XRefProvider>;
}

export const FootnoteReference: NodeRenderer = (node) => {
  return (
    <ClickPopover
      key={node.key}
      card={<FootnoteDefinition identifier={node.identifier as string} />}
      as="span"
    >
      <sup>[{node.number ?? node.identifier}]</sup>
    </ClickPopover>
  );
};

const FOOTNOTE_RENDERERS = {
  footnoteReference: FootnoteReference,
  // Do not render the definitions, they get pulled in by a handler
  footnoteDefinition: () => null,
};

export default FOOTNOTE_RENDERERS;
