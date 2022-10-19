import type { MinifiedOutput } from '@curvenote/nbtx';
import { walkPaths } from '@curvenote/nbtx';
import type {
  FooterLinks,
  Heading,
  ManifestProject,
  NavigationLink,
  SiteManifest,
  PageLoader,
  ManifestProjectPage,
} from '@curvenote/site-common';
import { selectAll } from 'unist-util-select';
import type { Image as ImageSpec, Link as LinkSpec } from 'myst-spec';

type Image = ImageSpec & { urlOptimized?: string };
type Link = LinkSpec & { static?: boolean };
type Output = { data?: MinifiedOutput[] };

export function getProject(
  config?: SiteManifest,
  projectSlug?: string,
): ManifestProject | undefined {
  if (!projectSlug || !config) return undefined;
  const project = config.projects.find((p) => p.slug === projectSlug);
  return project;
}

export function getProjectHeadings(
  config: SiteManifest,
  projectSlug?: string,
  opts: { addGroups: boolean; urlbase?: string } = { addGroups: false },
): Heading[] | undefined {
  const project = getProject(config, projectSlug);
  if (!project) return undefined;
  // Ensure there is a leading /
  const urlbase = opts.urlbase?.replace(/^\/?/, '/') ?? '';
  const headings: Heading[] = [
    {
      title: project.title,
      slug: project.index,
      path: `${urlbase}/${project.slug}`,
      level: 'index',
    },
    ...project.pages.map((p) => {
      if (!('slug' in p)) return p;
      return { ...p, path: `${urlbase}/${project.slug}/${p.slug}` };
    }),
  ];
  if (opts.addGroups) {
    let lastTitle = project.title;
    return headings.map((heading) => {
      if (!heading.slug || heading.level === 'index') {
        lastTitle = heading.title;
      }
      return { ...heading, group: lastTitle };
    });
  }
  return headings;
}

function getHeadingLink(currentSlug: string, headings?: Heading[]): NavigationLink | undefined {
  if (!headings) return undefined;
  const linkIndex = headings.findIndex(({ slug }) => !!slug && slug !== currentSlug);
  const link = headings[linkIndex];
  if (!link?.path) return undefined;
  return {
    title: link.title,
    url: link.path,
    group: link.group,
  };
}

export function getFooterLinks(
  config?: SiteManifest,
  projectSlug?: string,
  slug?: string,
  urlbase?: string,
): FooterLinks {
  if (!projectSlug || !slug || !config) return {};
  const pages = getProjectHeadings(config, projectSlug, {
    addGroups: true,
    urlbase,
  });
  const found = pages?.findIndex(({ slug: s }) => s === slug) ?? -1;
  if (found === -1) return {};
  const prev = getHeadingLink(slug, pages?.slice(0, found).reverse());
  const next = getHeadingLink(slug, pages?.slice(found + 1));
  const footer: FooterLinks = {
    navigation: { prev, next },
  };
  return footer;
}

type UpdateUrl = (url: string) => string;

export function updateSiteManifestStaticLinksInplace(
  data: SiteManifest,
  updateUrl: UpdateUrl,
): SiteManifest {
  data.actions.forEach((action) => {
    if (!action.static) return;
    action.url = updateUrl(action.url);
  });
  if (data.logo) data.logo = updateUrl(data.logo);
  // Update the thumbnails to point at the CDN
  data.projects.forEach((project) => {
    project.pages
      .filter((page): page is ManifestProjectPage => 'slug' in page)
      .forEach((page) => {
        if (page.thumbnail) page.thumbnail = updateUrl(page.thumbnail);
        if (page.thumbnailOptimized) page.thumbnailOptimized = updateUrl(page.thumbnailOptimized);
      });
  });
  return data;
}

export function updatePageStaticLinksInplace(data: PageLoader, updateUrl: UpdateUrl): PageLoader {
  if (data?.frontmatter?.thumbnail) {
    data.frontmatter.thumbnail = updateUrl(data.frontmatter.thumbnail);
  }
  if (data?.frontmatter?.thumbnailOptimized) {
    data.frontmatter.thumbnailOptimized = updateUrl(data.frontmatter.thumbnailOptimized);
  }
  // Fix all of the images to point to the CDN
  const images = selectAll('image', data.mdast) as Image[];
  images.forEach((node) => {
    node.url = updateUrl(node.url);
    if (node.urlOptimized) {
      node.urlOptimized = updateUrl(node.urlOptimized);
    }
  });
  const links = selectAll('link,linkBlock,card', data.mdast) as Link[];
  const staticLinks = links.filter((node) => node.static);
  staticLinks.forEach((node) => {
    // These are static links to thinks like PDFs or other referenced files
    node.url = updateUrl(node.url);
  });
  const outputs = selectAll('output', data.mdast) as Output[];
  outputs.forEach((node) => {
    if (!node.data) return;
    walkPaths(node.data, (path, obj) => {
      obj.path = updateUrl(path);
      obj.content = updateUrl(obj.content as string);
    });
  });
  return data;
}
