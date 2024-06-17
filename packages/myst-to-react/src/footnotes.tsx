import type { NodeRenderer } from '@myst-theme/providers';
import { XRefProvider, useReferences } from '@myst-theme/providers';
import { select } from 'unist-util-select';
import { HoverPopover } from './components/index.js';
import { MyST } from './MyST.js';
import { HashLink } from './hashLink.js';

function FootnoteDefinition({ identifier }: { identifier: string }) {
  const references = useReferences();
  const node =
    (references as any)?.footnotes?.[identifier] ??
    select(`footnoteDefinition[identifier=${identifier}]`, references?.article);
  return (
    <XRefProvider>
      <div className="hover-document article w-[500px] sm:max-w-[500px] px-3 text-sm">
        <MyST ast={node.children} />
      </div>
    </XRefProvider>
  );
}

export const FootnoteReference: NodeRenderer = ({ node }) => {
  return (
    <HoverPopover
      openDelay={0}
      card={<FootnoteDefinition identifier={node.identifier as string} />}
    >
      <span id={`fnref-${node.key}`}>
        <sup className="hover-link">
          <HashLink
            id={`fn-${node.identifier}`}
            title="Link to Footnote"
            scrollBehavior="instant"
            canSelectText
          >
            [{node.enumerator ?? node.number ?? node.identifier}]
          </HashLink>
        </sup>
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
