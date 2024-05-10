import type { Link } from 'myst-spec';
import {
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useLinkProvider, useSiteManifest, useBaseurl, withBaseurl } from '@myst-theme/providers';
import type { SiteManifest } from 'myst-config';
import type { NodeRenderer } from '@myst-theme/providers';
import { HoverPopover, LinkCard } from '../components/index.js';
import { WikiLink } from './wiki.js';
import { RRIDLink } from './rrid.js';
import { RORLink } from './ror.js';
import { GithubLink } from './github.js';
import { MyST } from '../MyST.js';

type TransformedLink = Link & { internal?: boolean; protocol?: string };

function getPageInfo(site: SiteManifest | undefined, path: string) {
  if (!site) return undefined;
  const [projectSlug, pageSlug] = path.replace(/^\//, '').split('/');
  const project = site.projects?.find((p) => p.slug === projectSlug || (!p.slug && !pageSlug));
  if (!project) return undefined;
  return project.pages.find((p) => p.slug === (pageSlug || projectSlug));
}

function InternalLink({ url, children }: { url: string; children: React.ReactNode }) {
  const Link = useLinkProvider();
  const site = useSiteManifest();
  const page = getPageInfo(site, url);
  const baseurl = useBaseurl();
  const skipPreview = !page || (!page.description && !page.thumbnail);
  if (!page || skipPreview) {
    return (
      <Link to={withBaseurl(url, baseurl)} prefetch="intent">
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
      <Link to={withBaseurl(url, baseurl)} prefetch="intent">
        {children}
      </Link>
    </HoverPopover>
  );
}

export const link: NodeRenderer<TransformedLink> = ({ node }) => {
  const internal = node.internal ?? false;
  const protocol = node.protocol;

  switch (protocol) {
    case 'wiki':
      return (
        <WikiLink url={node.url} page={node.data?.page as string} wiki={node.data?.wiki as string}>
          <MyST ast={node.children} />
        </WikiLink>
      );
    case 'github':
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
        >
          <MyST ast={node.children} />
        </GithubLink>
      );
    case 'rrid':
      return <RRIDLink rrid={node.data?.rrid as string} />;
    case 'ror':
      return <RORLink node={node} ror={node.data?.ror as string} />;
    default:
      if (internal) {
        return (
          <InternalLink url={node.url}>
            <MyST ast={node.children} />
          </InternalLink>
        );
      }
      return (
        <a target="_blank" href={node.url} rel="noreferrer">
          <MyST ast={node.children} />
        </a>
      );
  }
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

const LINK_RENDERERS = {
  link,
  linkBlock,
};

export default LINK_RENDERERS;
