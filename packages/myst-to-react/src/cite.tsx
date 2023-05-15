import classNames from 'classnames';
import { useReferences } from '@myst-theme/providers';
import type { NodeRenderer } from '@myst-theme/providers';
import doi from 'doi-utils';
import { InlineError } from './inlineError';
import { HoverPopover } from './components/HoverPopover';

function CiteChild({ html }: { html?: string }) {
  return (
    <div
      className="hover-document w-[500px] sm:max-w-[500px] p-3"
      dangerouslySetInnerHTML={{ __html: html || '' }}
    />
  );
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
  const references = useReferences();
  const { html, doi: doiString } = references?.cite?.data[node.label] ?? {};
  if (node.error) {
    return <InlineError key={node.key} value={node.label} message={'Citation Not Found'} />;
  }
  const doiUrl = doiString ? doi.buildUrl(doiString as string) : null;
  return (
    <HoverPopover key={node.key} openDelay={300} card={<CiteChild html={html} />}>
      <cite className="hover-link">
        {doiUrl && (
          <a href={doiUrl} target="_blank" rel="noreferrer" className="hover-link">
            {children}
          </a>
        )}
        {!doiUrl && children}
      </cite>
    </HoverPopover>
  );
};

const CITE_RENDERERS: Record<string, NodeRenderer> = {
  citeGroup: CiteGroup,
  cite: Cite,
};

export default CITE_RENDERERS;
