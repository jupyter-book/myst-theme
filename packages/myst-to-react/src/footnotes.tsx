import type { GenericParent } from 'myst-common';
import type { NodeRenderer } from '@myst-theme/providers';
import { XRefProvider, useNodeRenderers, useReferences } from '@myst-theme/providers';
import { useParse } from '.';
import { select } from 'unist-util-select';
import { HoverPopover } from './components/HoverPopover';

function FootnoteDefinition({ identifier }: { identifier: string }) {
  const references = useReferences();
  const renderers = useNodeRenderers();
  const node =
    (references as any)?.footnotes?.[identifier] ??
    select(`footnoteDefinition[identifier=${identifier}]`, references?.article);
  const children = useParse(node as GenericParent, renderers);
  return (
    <XRefProvider>
      <div className="hover-document w-[500px] sm:max-w-[500px] px-3">{children}</div>
    </XRefProvider>
  );
}

export const FootnoteReference: NodeRenderer = (node) => {
  return (
    <HoverPopover
      key={node.key}
      openDelay={0}
      card={<FootnoteDefinition identifier={node.identifier as string} />}
    >
      <span>
        <sup className="hover-link">[{node.number ?? node.identifier}]</sup>
      </span>
    </HoverPopover>
  );
};

const FOOTNOTE_RENDERERS = {
  footnoteReference: FootnoteReference,
  // Do not render the definitions, they get pulled in by a handler
  footnoteDefinition: () => null,
};

export default FOOTNOTE_RENDERERS;
