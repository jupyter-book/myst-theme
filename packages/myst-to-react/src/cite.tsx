import classNames from 'classnames';
import { useReferences } from '@myst-theme/providers';
import type { NodeRenderer } from '@myst-theme/providers';
import { doi } from 'doi-utils';
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

export const Cite = ({
  label,
  error,
  children,
}: {
  label?: string;
  error?: boolean;
  children: React.ReactNode;
}) => {
  const references = useReferences();
  if (!label) {
    return <InlineError value="cite (no label)" message={'Citation Has No Label'} />;
  }
  const { html, doi: doiString } = references?.cite?.data[label] ?? {};
  if (error) {
    return <InlineError value={label} message={'Citation Not Found'} />;
  }
  const doiUrl = doiString ? doi.buildUrl(doiString as string) : null;
  return (
    <HoverPopover openDelay={300} card={<CiteChild html={html} />}>
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

export const CiteRenderer: NodeRenderer = (node, children) => {
  return (
    <Cite key={node.key} label={node.label} error={node.error}>
      {children}
    </Cite>
  );
};

const CITE_RENDERERS: Record<string, NodeRenderer> = {
  citeGroup: CiteGroup,
  cite: CiteRenderer,
};

export default CITE_RENDERERS;
