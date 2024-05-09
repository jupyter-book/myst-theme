import { selectAll } from 'unist-util-select';
import { EXIT, SKIP, visit } from 'unist-util-visit';
import type { CrossReference } from 'myst-spec';
import {
  useLinkProvider,
  useReferences,
  useBaseurl,
  withBaseurl,
  XRefProvider,
  useXRefState,
  type NodeRenderer,
} from '@myst-theme/providers';
import type { GenericNode, GenericParent } from 'myst-common';
import { InlineError } from './inlineError.js';
import { default as useSWR } from 'swr';
import { HoverPopover } from './components/index.js';
import { MyST } from './MyST.js';

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
function XrefChildren({ load, identifier }: { load?: boolean; identifier: string }) {
  const data = useSelectNodes({ load, identifier });
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
  return <MyST ast={data?.nodes} />;
}

function openDetails(el: HTMLElement | null) {
  if (!el) return;
  if (el.nodeName === 'DETAILS') {
    (el as HTMLDetailsElement).open = true;
  }
  openDetails(el.parentElement);
}

function createRemoteBaseUrl(url?: string, remoteBaseUrl?: string): string {
  if (remoteBaseUrl && url?.startsWith(remoteBaseUrl)) {
    // The remoteBaseUrl is included in the url
    // This is the case for entry point references
    return url;
  }
  return `${remoteBaseUrl || ''}${url || ''}`;
}

function createExternalUrl({
  url,
  remoteBaseUrl,
  dataUrl,
  baseurl,
}: {
  url?: string;
  remoteBaseUrl?: string;
  dataUrl?: string;
  baseurl?: string;
}): string | null {
  // Handle external links first
  if (
    !!remoteBaseUrl || // The parent reference is external
    dataUrl?.startsWith('http') // Or the url is actually external
  ) {
    if (!dataUrl) {
      console.error('Expected external URL to provide a dataUrl');
      return null; // Means the fetch won't happen
    }
    return createRemoteBaseUrl(dataUrl, remoteBaseUrl);
  }
  // dataUrl should point directly to the cross reference mdast data.
  if (dataUrl) {
    // All modern myst should have a dataUrl
    return withBaseurl(dataUrl, baseurl);
  }
  // If dataUrl is not provided, it will be computed by appending .json to the url.
  // This is legacy
  return `${withBaseurl(url, baseurl)}.json`;
}

export function useFetchMdast({
  remote,
  url,
  remoteBaseUrl,
  dataUrl,
}: {
  remote?: boolean;
  url?: string;
  remoteBaseUrl?: string;
  dataUrl?: string;
}) {
  const baseurl = useBaseurl();
  const lookupUrl = createExternalUrl({ url, remoteBaseUrl, dataUrl, baseurl });
  return useSWR(remote ? lookupUrl : null, fetcher);
}

function useSelectNodes({ load, identifier }: { load?: boolean; identifier: string }) {
  const references = useReferences();
  const { remote, url, remoteBaseUrl, dataUrl } = useXRefState();
  if (!load) return;
  const { data, error } = useFetchMdast({ remote, url, remoteBaseUrl, dataUrl });
  const mdast = data?.mdast ?? references?.article;
  const { nodes, htmlId } = selectMdastNodes(mdast, identifier);
  return { htmlId, nodes, loading: remote && !data, error: remote && error };
}

export function CrossReferenceHover({
  url: urlIn,
  dataUrl: dataUrlIn,
  remote: remoteIn,
  remoteBaseUrl: remoteBaseUrlIn,
  children,
  identifier,
  htmlId = '',
}: {
  remote?: boolean;
  url?: string;
  dataUrl?: string;
  remoteBaseUrl?: string;
  identifier: string;
  htmlId?: string;
  children: React.ReactNode;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const parent = useXRefState();
  const remote = parent.remote || remoteIn;
  const remoteBaseUrl = parent.remoteBaseUrl || remoteBaseUrlIn;
  const url = parent.remote ? urlIn ?? parent.url : urlIn;
  const dataUrl = parent.remote ? dataUrlIn ?? parent.dataUrl : dataUrlIn;
  const external = !!remoteBaseUrl || (url?.startsWith('http') ?? false);
  const scroll: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (!htmlId) return;
    const el = document.getElementById(htmlId);
    openDetails(el);
    el?.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(undefined, '', `#${htmlId}`);
    if (el) {
      // Changes keyboard tab-index location
      if (el.tabIndex === -1) el.tabIndex = -1;
      el.focus({ preventScroll: true });
    }
  };
  return (
    <HoverPopover
      card={({ load }) => (
        <XRefProvider remote={remote} remoteBaseUrl={remoteBaseUrl} url={url} dataUrl={dataUrl}>
          <div className="hover-document article w-[500px] sm:max-w-[500px] overflow-auto">
            {remoteBaseUrl && (
              <div className="w-full px-3 py-1 text-xs border-b bg-gray-50">
                <strong className="text-gray-700">Source: </strong>
                <a className="text-gray-700" href={remoteBaseUrl} target="_blank">
                  {remoteBaseUrl}
                </a>
              </div>
            )}
            <div className="px-3">
              <XrefChildren load={load} identifier={identifier} />
            </div>
          </div>
        </XRefProvider>
      )}
    >
      <span>
        {remote && external && (
          <a
            href={`${createRemoteBaseUrl(url, remoteBaseUrl)}${htmlId ? `#${htmlId}` : ''}`}
            target="_blank"
            className="hover-link"
          >
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

export const CrossReferenceNode: NodeRenderer<CrossReference> = ({ node }) => {
  if (!node.children) {
    return (
      <InlineError
        value={node.label || node.identifier || 'No Label'}
        message="Cross Reference Not Found"
      />
    );
  }
  const { remote, url, dataUrl, remoteBaseUrl, identifier, html_id } = node as any;
  return (
    <CrossReferenceHover
      identifier={identifier}
      htmlId={html_id}
      remote={remote}
      url={url}
      dataUrl={dataUrl}
      remoteBaseUrl={remoteBaseUrl}
    >
      {node.prefix && <>{node.prefix} </>}
      <MyST ast={node.children} />
      {node.suffix || null}
    </CrossReferenceHover>
  );
};

const CROSS_REFERENCE_RENDERERS = {
  crossReference: CrossReferenceNode,
};

export default CROSS_REFERENCE_RENDERERS;
