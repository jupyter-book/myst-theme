import { selectAll } from 'unist-util-select';
import { EXIT, SKIP, visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { CrossReference } from 'myst-spec';
import {
  useLinkProvider,
  useNodeRenderers,
  useReferences,
  useBaseurl,
  withBaseurl,
  XRefProvider,
} from '@myst-theme/providers';
import type { GenericNode } from 'myst-common';
import { useParse } from '.';
import { InlineError } from './inlineError';
import type { NodeRenderer } from '@myst-theme/providers';
import useSWR from 'swr';
import { HoverPopover } from './components/HoverPopover';

const MAX_NODES = 3; // Max nodes to show after a header

function selectMdastNodes(mdast: Root, identifier: string) {
  const identifiers = selectAll(`[identifier=${identifier}],[key=${identifier}]`, mdast);
  const container = identifiers.filter(({ type }) => type === 'container' || type === 'math')[0];
  const nodes = container ? [container] : [];
  if (nodes.length === 0 && identifiers.length > 0 && mdast) {
    let begin = false;
    visit(mdast, (node) => {
      if ((begin && node.type === 'heading') || nodes.length >= MAX_NODES) {
        return EXIT;
      }
      if ((node as any).identifier === identifier && node.type === 'heading') begin = true;
      if (begin) {
        nodes.push(node);
        return SKIP; // Don't traverse the children
      }
    });
  }
  if (nodes.length === 0 && identifiers.length > 0) {
    // If we haven't found anything, push the first identifier that isn't a cite or crossReference
    const resolved = identifiers.filter(
      (node) => node.type !== 'crossReference' && node.type !== 'cite',
    )[0];
    nodes.push(resolved ?? identifiers[0]);
  }
  return nodes;
}

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.json();
    throw new Error(`Content returned with status ${res.status}.`);
  });

// This is a small component that must be distinct based on the nodes
// This is because the useParse can have different numbers of hooks, which breaks things
function XrefChildren({
  nodes,
  loading,
  error,
  identifier,
}: {
  nodes: GenericNode[];
  loading?: boolean;
  error?: boolean;
  identifier?: string;
}) {
  const renderers = useNodeRenderers();
  const children = useParse({ type: 'block', children: nodes }, renderers);

  if (loading) {
    return <>Loading...</>;
  }
  if (error) {
    return <>Error loading remote page.</>;
  }
  if (!nodes || nodes.length === 0) {
    return (
      <>
        <InlineError value={identifier || 'No Label'} message="Cross Reference Not Found" />
      </>
    );
  }
  return <>{children}</>;
}

function openDetails(el: HTMLElement | null) {
  if (!el) return;
  if (el.nodeName === 'DETAILS') {
    (el as HTMLDetailsElement).open = true;
  }
  openDetails(el.parentElement);
}

export function CrossReferenceHover({
  url,
  dataUrl,
  remote,
  children,
  identifier,
}: {
  remote?: boolean;
  url?: string;
  dataUrl?: string;
  identifier: string;
  children: React.ReactNode;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  // dataUrl should point directly to the cross reference mdast data.
  // If dataUrl is not provided, it will be computed by appending .json to the url.
  const external = url?.startsWith('http') ?? false;
  const lookupUrl = external
    ? `/api/lookup?url=${url}.json`
    : dataUrl
    ? `${withBaseurl(dataUrl, baseurl)}`
    : `${withBaseurl(url, baseurl)}.json`;
  const { data, error } = useSWR(remote ? lookupUrl : null, fetcher);
  const references = useReferences();
  const mdast = data?.mdast ?? references?.article;
  const nodes = selectMdastNodes(mdast, identifier);
  const htmlId = (nodes[0] as any)?.html_id || (nodes[0] as any)?.identifier;
  const link = `${url}${htmlId ? `#${htmlId}` : ''}`;
  const scroll: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    const el = document.getElementById(htmlId);
    openDetails(el);
    el?.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(undefined, '', `#${htmlId}`);
  };
  return (
    <HoverPopover
      card={
        <XRefProvider remote={remote} url={url} dataUrl={dataUrl}>
          <div className="hover-document w-[500px] sm:max-w-[500px] px-3">
            <XrefChildren
              nodes={nodes}
              loading={remote && !data}
              error={remote && error}
              identifier={identifier}
            />
          </div>
        </XRefProvider>
      }
    >
      <span>
        {remote && external && (
          <a href={link} target="_blank" className="hover-link">
            {children}
          </a>
        )}
        {remote && !external && (
          <Link
            to={`${withBaseurl(url, baseurl)}#${htmlId}`}
            prefetch="intent"
            className="hover-link"
          >
            {children}
          </Link>
        )}
        {!remote && (
          <a href={`#${htmlId}`} onClick={scroll} className="hover-link">
            {children}
          </a>
        )}
      </span>
    </HoverPopover>
  );
}

export const CrossReferenceNode: NodeRenderer<CrossReference> = (node, children) => {
  if (!children) {
    return (
      <InlineError
        key={node.key}
        value={node.label || node.identifier || 'No Label'}
        message="Cross Reference Not Found"
      />
    );
  }
  const { remote, url, dataUrl, identifier } = node as any;
  return (
    <CrossReferenceHover
      key={node.key}
      identifier={identifier}
      remote={remote}
      url={url}
      dataUrl={dataUrl}
    >
      {children}
    </CrossReferenceHover>
  );
};

const CROSS_REFERENCE_RENDERERS = {
  crossReference: CrossReferenceNode,
};

export default CROSS_REFERENCE_RENDERERS;
