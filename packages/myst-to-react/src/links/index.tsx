import type { Link } from 'myst-spec';
import {
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useLinkProvider, useSiteManifest, useBaseurl, withBaseurl } from '@myst-theme/providers';
import type { SiteManifest } from 'myst-config';
import type { NodeRenderer, NodeRenderers } from '@myst-theme/providers';
import { HoverPopover, LinkCard } from '../components/index.js';
import { WikiLink } from './wiki.js';
import { RRIDLink } from './rrid.js';
import { RORLink } from './ror.js';
import { GithubLink } from './github.js';
import { MyST } from '../MyST.js';
import classNames from 'classnames';

type TransformedLink = Link & { internal?: boolean; protocol?: string };

function getPageInfo(site: SiteManifest | undefined, path: string) {
  if (!site) return undefined;
  const [projectSlug, pageSlug] = path.replace(/^\//, '').split('/');
  const project = site.projects?.find((p) => p.slug === projectSlug || (!p.slug && !pageSlug));
  if (!project) return undefined;
  return project.pages.find((p) => p.slug === (pageSlug || projectSlug));
}

function InternalLink({ url, children, className}: { url: string; children: React.ReactNode, className?: string }) {
  const Link = useLinkProvider();
  const site = useSiteManifest();
  const page = getPageInfo(site, url);
  const baseurl = useBaseurl();
  const skipPreview = !page || (!page.description && !page.thumbnail);
  if (!page || skipPreview) {
    return (
      <Link to={withBaseurl(url, baseurl)} prefetch="intent" className={className}>
        {children}
      </Link>
    );
  }
  return (
    <HoverPopover
      card={
        <LinkCard
          internal
          url={url}
          title={page.title}
          description={page.description}
          thumbnail={page.thumbnailOptimized || page.thumbnail}
        />
      }
    >
      <Link to={withBaseurl(url, baseurl)} prefetch="intent" className={className}>
        {children}
      </Link>
    </HoverPopover>
  );
}

export const WikiLinkRenderer: NodeRenderer<TransformedLink> = ({ node }) => {
  const className = classNames(node.class, { button: node.kind === 'button' });
  return ( 
  <WikiLink url={node.url} page={node.data?.page as string} wiki={node.data?.wiki as string} className={className}>
      <MyST ast={node.children} />
  </WikiLink>
  );
};

export const GithubLinkRenderer: NodeRenderer<TransformedLink> = ({ node }) => {
  const className = classNames(node.class, { button: node.kind === 'button' });
  return (
    <GithubLink
      kind={node.data?.kind as any}
      url={node.url}
      org={node.data?.org as string}
      repo={node.data?.repo as string}
      raw={node.data?.raw as string}
      file={node.data?.file as string}
      from={node.data?.from as number | undefined}
      to={node.data?.to as number | undefined}
      issue_number={node.data?.issue_number as number | undefined}
      className={className}
    >
      <MyST ast={node.children} />
    </GithubLink>
  );
};

export const RRIDLinkRenderer: NodeRenderer<TransformedLink> = ({ node }) => {
  const className = classNames(node.class, { button: node.kind === 'button' });
  return (
  <RRIDLink rrid={node.data?.rrid as string} className={className} />
  );
};

export const RORLinkRenderer: NodeRenderer<TransformedLink> = ({ node }) => {
  const className = classNames(node.class, { button: node.kind === 'button' });
  return (
  <RORLink node={node} ror={node.data?.ror as string} className={className} />
  );
};

export const SimpleLink: NodeRenderer<TransformedLink> = ({ node }) => {
  const internal = node.internal ?? false;
  const className = classNames(node.class, {button: node.kind=== 'button'});
  if (internal) {
    return (
      <InternalLink url={node.url} className={className}>
        <MyST ast={node.children} />
      </InternalLink>
    );
  }
  return (
    <a href={node.url} className={className}>
      <MyST ast={node.children} />
    </a>
  );
};

export const linkBlock: NodeRenderer<TransformedLink> = ({ node }) => {
  const iconClass = 'self-center transition-transform flex-none ml-3';
  const containerClass =
    'flex-1 p-4 my-5 block border font-normal hover:border-blue-500 dark:hover:border-blue-400 no-underline hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-100 border-gray-200 dark:border-gray-500 rounded shadow-sm hover:shadow-lg dark:shadow-neutral-700';
  const internal = node.internal ?? false;
  const nested = (
    <div className="flex h-full align-middle">
      <div className="flex-grow">
        {node.title}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <MyST ast={node.children} />
        </div>
      </div>
      {internal && <LinkIcon width="1.5rem" height="1.5rem" className={iconClass} />}
      {!internal && <ExternalLinkIcon width="1.5rem" height="1.5rem" className={iconClass} />}
    </div>
  );

  if (internal) {
    return (
      <a href={node.url} className={containerClass}>
        {nested}
      </a>
    );
  }
  return (
    <a className={containerClass} target="_blank" rel="noopener noreferrer" href={node.url}>
      {nested}
    </a>
  );
};

const LINK_RENDERERS: NodeRenderers = {
  link: {
    base: SimpleLink,
    // Then duplicate the renderers for protocols
    'link[protocol=github]': GithubLinkRenderer,
    'link[protocol=wiki]': WikiLinkRenderer,
    'link[protocol=rrid]': RRIDLinkRenderer,
    'link[protocol=ror]': RORLinkRenderer,
    // Put the kinds last as they will match first in the future
    'link[kind=github]': GithubLinkRenderer,
    'link[kind=wiki]': WikiLinkRenderer,
    'link[kind=rrid]': RRIDLinkRenderer,
    'link[kind=ror]': RORLinkRenderer,
  },
  linkBlock,
};

export default LINK_RENDERERS;
