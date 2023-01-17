import type { MinifiedOutput } from 'nbtx';
import { walkOutputs } from 'nbtx';
import type { SiteManifest } from 'myst-config';
import { selectAll } from 'unist-util-select';
import type { Image as ImageSpec, Link as LinkSpec } from 'myst-spec';
import type { FooterLinks, Heading, NavigationLink, PageLoader } from '../types';

type Image = ImageSpec & { urlOptimized?: string };
type Link = LinkSpec & { static?: boolean };
type Output = { data?: MinifiedOutput[] };

type ManifestProject = Required<SiteManifest>['projects'][0];
type ManifestProjectItem = ManifestProject['pages'][0];

export function getProject(
  config?: SiteManifest,
  projectSlug?: string,
): ManifestProject | undefined {
  if (!projectSlug || !config) return undefined;
  const project = config.projects?.find((p) => p.slug === projectSlug);
  return project;
}

export function getProjectHeadings(
  config: SiteManifest,
  projectSlug?: string,
  opts: { addGroups: boolean } = { addGroups: false },
): Heading[] | undefined {
  const project = getProject(config, projectSlug);
  if (!project) return undefined;
  const headings: Heading[] = [
    {
      title: project.title,
      slug: project.index,
      path: `/${project.slug}`,
      level: 'index',
    },
    ...project.pages.map((p) => {
      if (!('slug' in p)) return p;
      return { ...p, path: `/${project.slug}/${p.slug}` };
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
): FooterLinks {
  if (!projectSlug || !slug || !config) return {};
  const pages = getProjectHeadings(config, projectSlug, {
    addGroups: true,
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
  data.actions?.forEach((action) => {
    if (!action.static) return;
    action.url = updateUrl(action.url);
  });
  if (data.logo) data.logo = updateUrl(data.logo);
  // Update the thumbnails to point at the CDN
  data.projects?.forEach((project) => {
    project.pages
      .filter((page): page is ManifestProjectItem => 'slug' in page)
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
  if (data?.frontmatter?.exports) {
    data.frontmatter.exports = data.frontmatter.exports.map((exp) => {
      if (!exp.url) return exp;
      return { ...exp, url: updateUrl(exp.url) };
    });
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
    walkOutputs(node.data, (obj) => {
      // The path will be defined from output of myst-cli
      // Here we are re-asigning it to the current domain
      if (!obj.path) return;
      obj.path = updateUrl(obj.path);
    });
  });
  return data;
}
