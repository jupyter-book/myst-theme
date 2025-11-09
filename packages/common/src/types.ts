import type { Dependency, SourceFileKind, MystSearchIndex } from 'myst-spec-ext';
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
  enumerator?: string;
  // For external URLs
  url?: string;
  open_in_same_tab?: boolean;
};

export type SiteLoader = {
  theme?: Theme;
  config?: SiteManifest;
  searchIndex?: MystSearchIndex;
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

export type PageFrontmatterWithDownloads = Omit<
  PageFrontmatter,
  'parts' | 'downloads' | 'exports'
> & {
  parts?: Record<string, { frontmatter?: PageFrontmatter; mdast: GenericParent }>;
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

export type CommonTemplateOptions = {
  favicon?: string;
  logo?: string;
  logo_dark?: string;
  logo_text?: string;
  logo_url?: string;
  analytics_google?: string;
  analytics_plausible?: string;
  numbered_references?: boolean;
  folders?: boolean;
  style?: string;
};
