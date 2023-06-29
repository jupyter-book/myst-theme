import { selectAll } from 'unist-util-select';
import { EXIT, SKIP, visit } from 'unist-util-visit';
import type { CrossReference } from 'myst-spec';
import {
  useLinkProvider,
  useNodeRenderers,
  useReferences,
  useBaseurl,
  withBaseurl,
  XRefProvider,
  useXRefState,
} from '@myst-theme/providers';
import type { GenericNode, GenericParent } from 'myst-common';
import { useParse } from '.';
import { InlineError } from './inlineError';
import type { NodeRenderer } from '@myst-theme/providers';
import useSWR from 'swr';
import { HoverPopover } from './components/HoverPopover';

const hiddenNodes = new Set(['comment', 'mystComment']);

function selectHeadingNodes(
  mdast: GenericParent,
  identifier: string,
  maxNodes = 3, // Max nodes to show after a header
) {
  let begin = false;
  let htmlId: string | undefined = undefined;
  const nodes: GenericNode[] = [];
  visit(mdast, (node) => {
    if ((begin && node.type === 'heading') || nodes.length >= maxNodes) {
      return EXIT;
    }
    if (node.identifier === identifier && node.type === 'heading') {
      begin = true;
      htmlId = node.html_id || node.identifier;
    }
    if (begin) {
      if (!hiddenNodes.has(node.type)) nodes.push(node);
      return SKIP; // Don't traverse the children
    }
  });
  return { htmlId, nodes };
}

function selectDefinitionTerm(mdast: GenericParent, identifier: string) {
  let begin = false;
  const nodes: GenericNode[] = [];
  visit(mdast, (node) => {
    if (begin && node.type === 'definitionTerm') {
      if (nodes.length > 1) return EXIT;
    } else if (begin && node.type !== 'definitionDescription') {
      return EXIT;
    }
    if (node.identifier === identifier && node.type === 'definitionTerm') {
      nodes.push(node);
      begin = true;
    }
    if (begin) {
      if (node.type === 'definitionDescription') nodes.push(node);
      return SKIP; // Don't traverse the children
    }
  });
  return {
    htmlId: nodes?.[0]?.html_id || nodes?.[0]?.identifier,
    nodes: [{ type: 'definitionList', key: 'dl', children: nodes }],
  };
}

function selectMdastNodes(
  mdast: GenericParent,
  identifier: string,
): { htmlId?: string; nodes: GenericNode[] } {
  // Select the first identifier that is not a crossReference or citation
  const node = selectAll(`[identifier=${identifier}],[key=${identifier}]`, mdast).filter(
    ({ type }) => type !== 'crossReference' && type !== 'cite',
  )[0] as GenericNode | undefined;
  if (!node) return { nodes: [] };
  switch (node.type) {
    case 'heading':
      return selectHeadingNodes(mdast, identifier);
    case 'definitionTerm':
      return selectDefinitionTerm(mdast, identifier);
    default:
      return { htmlId: node.html_id || node.identifier, nodes: [node] };
  }
}

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.json();
    throw new Error(`Content returned with status ${res.status}.`);
  });

// This is a small component that must be distinct based on the nodes
// This is because the useParse can have different numbers of hooks, which breaks things
function XrefChildren({
  load,
  remote,
  url,
  dataUrl,
  identifier,
}: {
  load?: boolean;
  remote?: boolean;
  url?: string;
  dataUrl?: string;
  identifier: string;
}) {
  const data = useSelectNodes({ load, remote, url, dataUrl, identifier });
  const renderers = useNodeRenderers();
  const children = useParse({ type: 'block', children: data?.nodes ?? [] }, renderers);

  if (!data) return null;
  if (data.loading) {
    return <>Loading...</>;
  }
  if (data.error) {
    return <>Error loading remote page.</>;
  }
  if (!data.nodes || data.nodes.length === 0) {
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

export function useFetchMdast({
  remote,
  url,
  dataUrl,
}: {
  remote?: boolean;
  url?: string;
  dataUrl?: string;
}) {
  // dataUrl should point directly to the cross reference mdast data.
  // If dataUrl is not provided, it will be computed by appending .json to the url.
  const baseurl = useBaseurl();
  const external = url?.startsWith('http') ?? false;
  const lookupUrl = external
    ? `/api/lookup?url=${url}.json`
    : dataUrl
    ? `${withBaseurl(dataUrl, baseurl)}`
    : `${withBaseurl(url, baseurl)}.json`;
  console.log('lookupUrl', lookupUrl);
  return useSWR(remote ? lookupUrl : null, fetcher);
}

function useSelectNodes({
  load,
  remote,
  url,
  dataUrl,
  identifier,
}: {
  load?: boolean;
  remote?: boolean;
  url?: string;
  dataUrl?: string;
  identifier: string;
}) {
  const references = useReferences();
  if (!load) return;
  const { data, error } = useFetchMdast({ remote, url, dataUrl });
  const mdast = data?.mdast ?? references?.article;
  const { nodes, htmlId } = selectMdastNodes(mdast, identifier);
  return { htmlId, nodes, loading: remote && !data, error: remote && error };
}

export function CrossReferenceHover({
  url: urlIn,
  dataUrl: dataUrlIn,
  remote: remoteIn,
  children,
  identifier,
  htmlId = '',
}: {
  remote?: boolean;
  url?: string;
  dataUrl?: string;
  identifier: string;
  htmlId?: string;
  children: React.ReactNode;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const parent = useXRefState();
  const remote = parent.remote || remoteIn;
  const url = parent.remote ? urlIn ?? parent.url : urlIn;
  const dataUrl = parent.remote ? dataUrlIn ?? parent.dataUrl : dataUrlIn;
  const external = url?.startsWith('http') ?? false;
  const scroll: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (!htmlId) return;
    const el = document.getElementById(htmlId);
    openDetails(el);
    el?.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(undefined, '', `#${htmlId}`);
  };
  return (
    <HoverPopover
      card={({ load }) => (
        <XRefProvider remote={remote} url={url} dataUrl={dataUrl}>
          <div className="hover-document w-[500px] sm:max-w-[500px] px-3">
            <XrefChildren
              load={load}
              remote={remote}
              url={url}
              dataUrl={dataUrl}
              identifier={identifier}
            />
          </div>
        </XRefProvider>
      )}
    >
      <span>
        {remote && external && (
          <a href={`${url}${htmlId ? `#${htmlId}` : ''}`} target="_blank" className="hover-link">
            {children}
          </a>
        )}
        {remote && !external && (
          <Link
            to={`${withBaseurl(url, baseurl)}${htmlId ? `#${htmlId}` : ''}`}
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
  const { remote, url, dataUrl, identifier, html_id } = node as any;
  return (
    <CrossReferenceHover
      key={node.key}
      identifier={identifier}
      htmlId={html_id}
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
