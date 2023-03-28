import type { GenericParent } from 'myst-common';
import type { NodeRenderer } from '@myst-theme/providers';
import { useReferences } from '@myst-theme/providers';
import { useParse } from '.';
import { ClickPopover } from './components/ClickPopover';
import { select } from 'unist-util-select';

export function FootnoteDefinition({ identifier }: { identifier: string }) {
  const references = useReferences();
  const node =
    (references as any)?.footnotes?.[identifier] ??
    select(`footnoteDefinition[identifier=${identifier}]`, references?.article);
  const children = useParse(node as GenericParent);
  return <>{children}</>;
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
