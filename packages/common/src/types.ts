import type { Dependency, SourceFileKind } from 'myst-spec-ext';
import type { GenericParent, References } from 'myst-common';
import type { SiteAction, SiteExport, SiteManifest } from 'myst-config';
import type { PageFrontmatter } from 'myst-frontmatter';

export enum Theme {
  light = 'light',
  dark = 'dark',
}

export enum ErrorStatus {
  noSite = 'Site was not found',
  noArticle = 'Article was not found',
}

export type Heading = {
  slug?: string;
  path?: string;
  title: string;
  short_title?: string;
  level: number | 'index';
  group?: string;
};

export type SiteLoader = {
  theme: Theme;
  config?: SiteManifest;
  CONTENT_CDN_PORT?: string | number;
  MODE?: 'app' | 'static';
  BASE_URL?: string;
};

export type NavigationLink = {
  group?: string;
  title: string;
  url: string;
  short_title?: string;
};

export type FooterLinks = {
  navigation?: {
    prev?: NavigationLink;
    next?: NavigationLink;
  };
};

type PageFrontmatterWithDownloads = Omit<PageFrontmatter, 'downloads' | 'exports'> & {
  downloads?: SiteAction[];
  exports?: SiteExport[];
};

export type PageLoader = {
  kind: SourceFileKind;
  location: string;
  sha256: string;
  slug: string;
  domain: string; // This is written in at render time in the site
  project: string; // This is written in at render time in the site
  frontmatter: PageFrontmatterWithDownloads;
  mdast: GenericParent;
  references: References;
  footer?: FooterLinks;
  // This may not be defined
  dependencies?: Dependency[];
};
